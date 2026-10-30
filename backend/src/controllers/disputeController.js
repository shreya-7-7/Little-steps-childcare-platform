import Dispute from "../models/Dispute.js";
import Booking from "../models/Booking.js";
import Center from "../models/Center.js";
import User from "../models/User.js";
import { createInAppNotification } from "./notificationController.js";

const VALID_CATEGORIES = [
  "Safety",
  "Facility",
  "Staff Behavior",
  "Billing/Pricing",
  "Cancellation/Schedule",
  "Other",
];

const VALID_STATUSES = ["Open", "UnderReview", "Resolved", "Rejected"];

/**
 * Parent: Submit a new dispute for their own booking.
 */
export const createDispute = async (req, res) => {
  try {
    const { bookingId, category, title, description } = req.body;

    if (!bookingId || !category || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Booking ID, category, title, and description are required.",
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}.`,
      });
    }

    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    if (trimmedTitle.length < 3 || trimmedTitle.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 3 and 150 characters.",
      });
    }

    const trimmedDesc = typeof description === "string" ? description.trim() : "";
    if (trimmedDesc.length < 10 || trimmedDesc.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description must be between 10 and 2000 characters.",
      });
    }

    // Verify booking existence and ownership
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only raise disputes for your own bookings.",
      });
    }

    // Explicitly prevent clients from supplying privileged admin fields
    const dispute = await Dispute.create({
      booking: booking._id,
      parent: req.user._id,
      center: booking.center,
      category,
      title: trimmedTitle,
      description: trimmedDesc,
      status: "Open",
      resolutionNotes: "",
      internalNotes: "",
      adminNotes: "",
      reviewedBy: null,
      resolvedAt: null,
    });

    // Notify parent confirmation (non-blocking)
    createInAppNotification({
      recipient: req.user._id,
      type: "system",
      title: "Dispute Registered",
      message: `Your dispute "${trimmedTitle}" has been received and logged under Open review.`,
      relatedEntity: { id: dispute._id, modelName: "Dispute" },
    });

    // Notify platform administrators
    try {
      const activeAdmins = await User.find({
        role: "admin",
        status: { $ne: "blocked" },
      }).select("_id");
      for (const admin of activeAdmins) {
        await createInAppNotification({
          recipient: admin._id,
          type: "system",
          title: "New Dispute Submitted",
          message: `Parent submitted dispute "${trimmedTitle}" under ${category} for review.`,
          relatedEntity: { id: dispute._id, modelName: "Dispute" },
        });
      }
    } catch (adminNotifErr) {
      console.warn(`[DISPUTE_ADMIN_NOTIFICATION_NOTICE] Could not notify admins: ${adminNotifErr.message}`);
    }

    // Return sanitized object to parent (internal notes excluded)
    const sanitizedDispute = dispute.toObject();
    delete sanitizedDispute.internalNotes;
    delete sanitizedDispute.adminNotes;
    delete sanitizedDispute.reviewedBy;

    return res.status(201).json({
      success: true,
      message: "Dispute submitted successfully and queued for administrative review.",
      dispute: sanitizedDispute,
    });
  } catch (error) {
    console.error("CREATE DISPUTE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Parent: List the authenticated parent's own disputes.
 * Strictly excludes internal investigation notes and reviewer IDs.
 */
export const getMyDisputes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const query = { parent: req.user._id };
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      query.status = req.query.status;
    }

    const [total, disputes] = await Promise.all([
      Dispute.countDocuments(query),
      Dispute.find(query)
        .select("-internalNotes -adminNotes -reviewedBy")
        .populate("center", "centerName city")
        .populate("booking", "childName bookingDate planType")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      count: disputes.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      disputes,
    });
  } catch (error) {
    console.error("GET MY DISPUTES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Parent: View details of a single dispute owned by the authenticated parent.
 * Strictly excludes internal investigation notes and reviewer IDs.
 */
export const getMyDisputeDetails = async (req, res) => {
  try {
    const dispute = await Dispute.findOne({
      _id: req.params.id,
      parent: req.user._id,
    })
      .select("-internalNotes -adminNotes -reviewedBy")
      .populate("center", "centerName city address")
      .populate("booking", "childName bookingDate startTime endTime planType amount status")
      .lean();

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      dispute,
    });
  } catch (error) {
    console.error("GET DISPUTE DETAILS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: List and filter all disputes across the platform.
 */
export const getAdminDisputes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      query.status = req.query.status;
    }
    if (req.query.category && VALID_CATEGORIES.includes(req.query.category)) {
      query.category = req.query.category;
    }

    const [total, disputes] = await Promise.all([
      Dispute.countDocuments(query),
      Dispute.find(query)
        .populate("parent", "name email")
        .populate("center", "centerName city")
        .populate("booking", "childName bookingDate planType status")
        .populate("reviewedBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      count: disputes.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      disputes,
    });
  } catch (error) {
    console.error("ADMIN GET DISPUTES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: View full dispute details for review.
 */
export const getAdminDisputeDetails = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate("parent", "name email")
      .populate("center", "centerName city address")
      .populate("booking", "childName bookingDate startTime endTime planType amount status paymentStatus")
      .populate("reviewedBy", "name email")
      .lean();

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found.",
      });
    }

    return res.status(200).json({
      success: true,
      dispute,
    });
  } catch (error) {
    console.error("ADMIN GET DISPUTE DETAILS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Update dispute status and record separate parent-visible resolution notes and internal notes.
 */
export const updateDisputeStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, internalNotes, adminNotes } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}.`,
      });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found.",
      });
    }

    // Separate parent-facing resolution notes from internal staff investigation notes
    const parentFacingNotes =
      resolutionNotes !== undefined
        ? String(resolutionNotes).trim()
        : adminNotes !== undefined
          ? String(adminNotes).trim()
          : dispute.resolutionNotes;

    const confidentialInternalNotes =
      internalNotes !== undefined
        ? String(internalNotes).trim()
        : dispute.internalNotes;

    if (parentFacingNotes.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Resolution notes cannot exceed 2000 characters.",
      });
    }

    if (confidentialInternalNotes.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Internal notes cannot exceed 2000 characters.",
      });
    }

    dispute.status = status;
    dispute.resolutionNotes = parentFacingNotes;
    dispute.internalNotes = confidentialInternalNotes;
    dispute.adminNotes = confidentialInternalNotes; // Keep adminNotes aligned with internal notes
    dispute.reviewedBy = req.user._id;

    if (status === "Resolved" || status === "Rejected") {
      dispute.resolvedAt = new Date();
    } else {
      dispute.resolvedAt = null;
    }

    await dispute.save();

    // Send in-app notification communicating ONLY the parent-facing resolution note (never internal notes)
    createInAppNotification({
      recipient: dispute.parent,
      type: "system",
      title: `Dispute Status: ${status}`,
      message: `Your dispute regarding "${dispute.title}" was updated to ${status}.${
        parentFacingNotes ? ` Resolution: ${parentFacingNotes}` : ""
      }`,
      relatedEntity: { id: dispute._id, modelName: "Dispute" },
    });

    return res.status(200).json({
      success: true,
      message: `Dispute status successfully updated to ${status}.`,
      dispute,
    });
  } catch (error) {
    console.error("UPDATE DISPUTE STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
