import mongoose from "mongoose";
import {
  reserveBookingCapacity,
  releaseBookingCapacity,
  getBookingIntervals,
  calculateMaxOverlap,
  runInTransaction,
} from "../utils/capacityHelper.js";
import { isBookingWithinCenterSchedule } from "../utils/scheduleHelper.js";
import { createInAppNotification } from "./notificationController.js";
import Booking from "../models/Booking.js";
import Center from "../models/Center.js";
import Provider from "../models/Provider.js";
import User from "../models/User.js";
import CenterCapacity from "../models/CenterCapacity.js";

const createBooking = async (req, res) => {
  try {
    // 0. Defense-in-depth: Authenticated Parent Authorization Check
    if (!req.user || req.user.role !== "parent") {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized: Only authenticated parents can create childcare bookings.",
      });
    }

    const {
      center,
      childName,
      childAge,
      bookingDate,
      startTime,
      endTime,
      planType,
      specialInstructions,
    } = req.body;

    // 1. Mandatory Fields Validation
    if (
      !center ||
      !childName ||
      childAge === undefined ||
      !bookingDate ||
      !startTime ||
      !endTime ||
      !planType
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    // 2. Validate Supported Plan Types
    const validPlanTypes = ["Hourly", "Daily", "Monthly"];
    if (!validPlanTypes.includes(planType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type. Must be Hourly, Daily, or Monthly.",
      });
    }

    // 3. Child Age Validation
    const ageNum = Number(childAge);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 18) {
      return res.status(400).json({
        success: false,
        message: "Child age must be a valid number between 0 and 18.",
      });
    }

    // 4. Booking Date Validation (cannot book in the past)
    const parsedDate = new Date(bookingDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date format.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDay = new Date(parsedDate);
    bookingDay.setHours(0, 0, 0, 0);

    if (bookingDay < today) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past.",
      });
    }

    // 5. Time Format & Duration Validation
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Times must be in valid HH:mm 24-hour format.",
      });
    }

    if (startTime === endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time and end time cannot be identical.",
      });
    }

    // 6. Check Center Existence, Status & Provider Approval
    const centerExists = await Center.findById(center).populate("provider");
    if (!centerExists) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    if (centerExists.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This center is currently inactive and cannot accept bookings.",
      });
    }

    if (
      !centerExists.provider ||
      centerExists.provider.verificationStatus !== "approved"
    ) {
      return res.status(400).json({
        success: false,
        message: "This center's provider is pending verification and cannot accept bookings.",
      });
    }

    // 7. Enforce Center Operating Schedule
    const scheduleValidation = isBookingWithinCenterSchedule(
      centerExists,
      parsedDate,
      startTime,
      endTime
    );

    if (!scheduleValidation.allowed) {
      return res.status(400).json({
        success: false,
        message:
          scheduleValidation.reason ||
          "Requested booking time is outside the center's operating hours.",
      });
    }

    // 8. Authoritative Pricing Calculation
    let amount = 0;
    if (planType === "Hourly") {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      let endMinutes = endH * 60 + endM;

      // Handle overnight shift crossing midnight
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
      }

      const durationHours = Math.max(1, Math.round((endMinutes - startMinutes) / 60));
      const hourlyRate = Math.round(centerExists.monthlyFee / 160);
      amount = hourlyRate * durationHours;
    } else if (planType === "Daily") {
      amount = centerExists.pricePerDay || Math.round(centerExists.monthlyFee / 30);
    } else if (planType === "Monthly") {
      amount = centerExists.monthlyFee;
    }

    // 8. Atomic Hourly & Daily Capacity Reservation and Booking Creation
    const dateStr = parsedDate.toISOString().split("T")[0];
    const bookingId = new mongoose.Types.ObjectId();

    const bookingData = {
      _id: bookingId,
      parent: req.user._id,
      center: centerExists._id,
      childName: childName.trim(),
      childAge: ageNum,
      bookingDate: parsedDate,
      startTime,
      endTime,
      planType,
      specialInstructions: specialInstructions ? specialInstructions.trim() : "",
      amount,
      status: "Pending",
      paymentStatus: "Pending",
    };

    let booking;
    await runInTransaction(async (session) => {
      const capacityReservation = await reserveBookingCapacity(
        centerExists._id,
        dateStr,
        parsedDate,
        startTime,
        endTime,
        planType,
        centerExists.capacity,
        bookingId,
        session
      );

      if (!capacityReservation.success) {
        const err = new Error(capacityReservation.message);
        err.statusCode = 409;
        throw err;
      }

      const createOptions = session ? { session } : {};
      const created = await Booking.create([bookingData], createOptions);
      booking = created[0];
    });

    // In-app notifications with individual try/catch boundaries
    // 1. In-app notification for Provider
    if (centerExists.provider?.user) {
      try {
        await createInAppNotification({
          recipient: centerExists.provider.user,
          type: "booking",
          title: "New Booking Request",
          message: `New booking request for ${centerExists.centerName} (${childName.trim()}).`,
          relatedEntity: { id: booking._id, modelName: "Booking" },
        });
      } catch (err) {
        console.warn(`[PROVIDER_NOTIFICATION_NOTICE] Could not dispatch provider booking notice: ${err.message}`);
      }
    }

    // 2. In-app confirmation for Parent
    try {
      await createInAppNotification({
        recipient: req.user._id,
        type: "booking",
        title: "Booking Request Submitted",
        message: `Your booking request for ${centerExists.centerName} has been submitted.`,
        relatedEntity: { id: booking._id, modelName: "Booking" },
      });
    } catch (err) {
      console.warn(`[PARENT_NOTIFICATION_NOTICE] Could not dispatch parent booking confirmation: ${err.message}`);
    }

    // 3. In-app notification for Platform Administrators
    try {
      const activeAdmins = await User.find({
        role: "admin",
        status: { $ne: "blocked" },
      }).select("_id");

      for (const admin of activeAdmins) {
        await createInAppNotification({
          recipient: admin._id,
          type: "booking",
          title: "New Booking Received",
          message: `New booking received for ${childName.trim()} at ${centerExists.centerName}.`,
          relatedEntity: { id: booking._id, modelName: "Booking" },
        });
      }
    } catch (err) {
      console.warn(`[ADMIN_NOTIFICATION_NOTICE] Could not dispatch admin booking notice: ${err.message}`);
    }

    return res.status(201).json({
      success: true,
      message: "Booking request submitted successfully",
      booking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("center", "centerName city centerImages monthlyFee address")
      .populate("parent", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Authorization: Parent, Center Provider, or Admin
    let isProvider = false;
    if (req.user.role === "provider") {
      const provider = await Provider.findOne({ user: req.user._id });
      if (provider) {
        const center = await Center.findOne({
          _id: booking.center._id,
          provider: provider._id,
        });
        if (center) {
          isProvider = true;
        }
      }
    }

    const isParent = booking.parent._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isParent && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    let cancelledBooking = null;

    await runInTransaction(async (session) => {
      // 1. Single-document atomic status transition: Pending -> Cancelled
      const updateOptions = { new: true };
      if (session) updateOptions.session = session;

      const booking = await Booking.findOneAndUpdate(
        {
          _id: req.params.id,
          parent: req.user._id,
          status: { $in: ["Pending", "pending"] },
        },
        {
          status: "Cancelled",
        },
        updateOptions
      );

      if (!booking) {
        const findOptions = session ? { session } : {};
        const existing = await Booking.findOne({
          _id: req.params.id,
          parent: req.user._id,
        }, null, findOptions);

        if (!existing) {
          const err = new Error("Booking not found");
          err.statusCode = 404;
          throw err;
        }

        const err = new Error("Only pending bookings can be cancelled");
        err.statusCode = 400;
        throw err;
      }

      // 2. Safe capacity release with diagnostic verification
      const dateStr = new Date(booking.bookingDate).toISOString().split("T")[0];
      const released = await releaseBookingCapacity(
        booking.center,
        dateStr,
        booking.startTime,
        booking.endTime,
        booking.planType,
        "parent_cancellation",
        booking._id,
        session
      );
      if (!released) {
        console.warn(
          `[CAPACITY_RELEASE_NOTICE] Capacity release did not match active interval for booking ${booking._id} on ${dateStr}. Interval may have already been released or was unreserved.`
        );
      }

      cancelledBooking = booking;
    });

    // In-app notifications for parent, provider, and admin upon cancellation
    if (cancelledBooking) {
      const childName = cancelledBooking.childName || "Child";
      let centerName = "the childcare center";
      let providerUserId = null;

      // 1. Resolve Center details safely with fallback
      try {
        const center = await Center.findById(cancelledBooking.center).populate("provider", "user");
        if (center?.centerName) {
          centerName = center.centerName;
        }
        providerUserId = center?.provider?.user?._id || center?.provider?.user;
      } catch (centerErr) {
        console.warn(`[CANCELLATION_CENTER_LOOKUP_NOTICE] ${centerErr.message}`);
      }

      // 2. In-app confirmation for Parent (independent try/catch, awaited)
      try {
        await createInAppNotification({
          recipient: cancelledBooking.parent,
          type: "booking",
          title: "Booking Cancellation Confirmed",
          message: `Your booking for ${childName} at ${centerName} has been cancelled.`,
          relatedEntity: { id: cancelledBooking._id, modelName: "Booking" },
        });
      } catch (parentNotifErr) {
        console.warn(`[PARENT_CANCEL_NOTIFICATION_ERROR] ${parentNotifErr.message}`);
      }

      // 3. In-app notification for Provider (independent try/catch, awaited)
      if (providerUserId) {
        try {
          await createInAppNotification({
            recipient: providerUserId,
            type: "booking",
            title: "Booking Cancelled by Parent",
            message: `A booking for ${childName} at ${centerName} was cancelled by the parent.`,
            relatedEntity: { id: cancelledBooking._id, modelName: "Booking" },
          });
        } catch (provNotifErr) {
          console.warn(`[PROVIDER_CANCEL_NOTIFICATION_ERROR] ${provNotifErr.message}`);
        }
      }

      // 4. In-app notification for Platform Administrators (independent try/catch, awaited)
      try {
        const activeAdmins = await User.find({
          role: "admin",
          status: { $ne: "blocked" },
        }).select("_id");

        for (const admin of activeAdmins) {
          await createInAppNotification({
            recipient: admin._id,
            type: "booking",
            title: "Booking Cancelled",
            message: `Booking for ${childName} at ${centerName} was cancelled by the parent.`,
            relatedEntity: { id: cancelledBooking._id, modelName: "Booking" },
          });
        }
      } catch (adminNotifErr) {
        console.warn(`[ADMIN_CANCEL_NOTIFICATION_ERROR] ${adminNotifErr.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking: cancelledBooking,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      parent: req.user._id,
    })
      .populate("center", "centerName city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProviderBookings = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    // Account for multi-center provider ownership:
    // Retrieve all centers belonging to this provider
    const centers = await Center.find({
      provider: provider._id,
    });

    const centerIds = centers.map((c) => c._id);

    const bookings = await Booking.find({
      center: { $in: centerIds },
    })
      .populate("parent", "name email")
      .populate("center", "centerName city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("GET PROVIDER BOOKINGS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveBooking = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    if (provider.verificationStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your provider profile is pending verification. You cannot approve bookings until verified by an administrator.",
      });
    }

    // Account for multi-center provider ownership:
    // Look up the booking first, then verify the center belongs to the acting provider
    const existing = await Booking.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const center = await Center.findOne({
      _id: existing.center,
      provider: provider._id,
    });

    if (!center) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not manage the center for this booking",
      });
    }

    // Capacity verification: ensure total approved bookings on date do not exceed center capacity
    const startOfDay = new Date(existing.bookingDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(existing.bookingDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const approvedBookingsOnDate = await Booking.find({
      center: center._id,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["Approved", "approved"] },
      _id: { $ne: existing._id },
    });

    const { day1: existingInterval } = getBookingIntervals(existing.startTime, existing.endTime, existing.planType);
    const existingApprovedIntervals = approvedBookingsOnDate.map((ab) => {
      const { day1 } = getBookingIntervals(ab.startTime, ab.endTime, ab.planType);
      return day1;
    });

    const overlapCount = calculateMaxOverlap(
      existingApprovedIntervals,
      existingInterval.startMin,
      existingInterval.endMin
    );

    if (overlapCount >= center.capacity) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve: Center has reached maximum capacity of ${center.capacity} children for the requested hours on this date.`,
      });
    }

    // Single-document atomic status transition: Pending -> Approved
    // Guarantees that only a Pending booking can be approved, and concurrent calls cannot double-approve.
    // Note: Capacity reservation was already allocated during createBooking; approval maintains this reservation.
    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $in: ["Pending", "pending"] },
      },
      {
        status: "Approved",
      },
      {
        new: true,
      }
    );

    if (!booking) {
      if (existing.status === "Approved" || existing.status === "approved") {
        return res.status(400).json({
          success: false,
          message: "Booking is already approved",
        });
      }
      if (existing.status === "Cancelled" || existing.status === "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Cannot approve a booking that was cancelled by the parent",
        });
      }
      if (existing.status === "Rejected" || existing.status === "rejected") {
        return res.status(400).json({
          success: false,
          message: "Cannot approve a booking that was previously rejected",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Invalid booking status transition",
      });
    }

    // In-app notification for parent
    createInAppNotification({
      recipient: booking.parent,
      type: "booking",
      title: "Booking Approved",
      message: `Your childcare booking at ${center.centerName} has been approved. You can now proceed to payment.`,
      relatedEntity: { id: booking._id, modelName: "Booking" },
    });

    res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      booking,
    });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    // Account for multi-center provider ownership:
    // Look up the booking first, then verify the center belongs to the acting provider
    const existing = await Booking.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const center = await Center.findOne({
      _id: existing.center,
      provider: provider._id,
    });

    if (!center) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not manage the center for this booking",
      });
    }

    let rejectedBooking = null;

    await runInTransaction(async (session) => {
      // Single-document atomic status transition: Pending/Approved -> Rejected
      const updateOptions = { new: true };
      if (session) updateOptions.session = session;

      const booking = await Booking.findOneAndUpdate(
        {
          _id: req.params.id,
          status: { $in: ["Pending", "pending", "Approved", "approved"] },
        },
        {
          status: "Rejected",
        },
        updateOptions
      );

      if (!booking) {
        if (existing.status === "Cancelled" || existing.status === "cancelled") {
          const err = new Error("Cannot reject a booking that was already cancelled by the parent");
          err.statusCode = 400;
          throw err;
        }

        const err = new Error("Booking is already rejected");
        err.statusCode = 400;
        throw err;
      }

      // Safe capacity release with diagnostic verification
      const dateStr = new Date(booking.bookingDate).toISOString().split("T")[0];
      const released = await releaseBookingCapacity(
        booking.center,
        dateStr,
        booking.startTime,
        booking.endTime,
        booking.planType,
        "provider_rejection",
        booking._id,
        session
      );
      if (!released) {
        console.warn(
          `[CAPACITY_RELEASE_NOTICE] Capacity release did not match active interval for booking ${booking._id} on ${dateStr}. Interval may have already been released or was unreserved.`
        );
      }

      rejectedBooking = booking;
    });

    // In-app notification for parent
    createInAppNotification({
      recipient: existing.parent,
      type: "booking",
      title: "Booking Request Rejected",
      message: `Your booking request at ${center.centerName} was rejected.`,
      relatedEntity: { id: existing._id, modelName: "Booking" },
    });

    res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      booking: rejectedBooking,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * Calculates the exact scheduled UTC end Date for a booking based on its
 * bookingDate, startTime, endTime, and planType.
 */
const calculateBookingEndDateTime = (booking) => {
  const [endH, endM] = booking.endTime.split(":").map(Number);
  const [startH, startM] = booking.startTime.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const isOvernight = endMinutes < startMinutes;

  const baseDate = new Date(booking.bookingDate);

  const year = baseDate.getUTCFullYear();
  const month = baseDate.getUTCMonth();
  const day = baseDate.getUTCDate();

  let targetYear = year;
  let targetMonth = month;
  let targetDay = day;

  if (booking.planType === "Monthly") {
    targetMonth += 1;
    if (isOvernight) {
      targetDay += 1;
    }
  } else if (isOvernight) {
    targetDay += 1;
  }

  return new Date(Date.UTC(targetYear, targetMonth, targetDay, endH, endM, 0, 0));
};

const completeBooking = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    if (provider.verificationStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your provider profile is pending verification. You cannot complete bookings until verified by an administrator.",
      });
    }

    // Account for multi-center provider ownership:
    const existing = await Booking.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const center = await Center.findOne({
      _id: existing.center,
      provider: provider._id,
    });

    if (!center) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not manage the center for this booking",
      });
    }

    // Status verification: Only Approved bookings can be completed
    const isApproved = existing.status === "Approved" || existing.status === "approved";
    if (!isApproved) {
      if (existing.status === "Completed" || existing.status === "completed") {
        return res.status(400).json({
          success: false,
          message: "Booking is already completed",
        });
      }
      if (existing.status === "Cancelled" || existing.status === "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Cannot complete a cancelled booking",
        });
      }
      if (existing.status === "Rejected" || existing.status === "rejected") {
        return res.status(400).json({
          success: false,
          message: "Cannot complete a rejected booking",
        });
      }
      if (existing.status === "Pending" || existing.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "Cannot complete a pending booking. Booking must be approved first.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Only approved bookings can be completed",
      });
    }

    // Verify scheduled service end time has passed
    const endDateTime = calculateBookingEndDateTime(existing);
    if (Date.now() < endDateTime.getTime()) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete booking: The scheduled childcare service has not ended yet. Scheduled end time: ${endDateTime.toISOString()}.`,
      });
    }

    // Atomic single-document status transition: Approved -> Completed
    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $in: ["Approved", "approved"] },
      },
      {
        status: "Completed",
      },
      {
        new: true,
      }
    );

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Booking could not be completed. It may have already been completed or modified concurrently.",
      });
    }

    // In-app notification for parent
    createInAppNotification({
      recipient: existing.parent,
      type: "booking",
      title: "Childcare Stay Completed",
      message: `Your childcare booking at ${center.centerName} is completed. You can now leave a verified review!`,
      relatedEntity: { id: existing._id, modelName: "Booking" },
    });

    res.status(200).json({
      success: true,
      message: "Childcare booking marked as completed successfully",
      booking,
    });
  } catch (error) {
    console.error("COMPLETE BOOKING ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
  getProviderBookings,
  approveBooking,
  rejectBooking,
  completeBooking,
  calculateBookingEndDateTime,
  isBookingWithinCenterSchedule,
};
