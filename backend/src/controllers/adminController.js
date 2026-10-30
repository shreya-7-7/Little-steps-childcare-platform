import { createInAppNotification } from "./notificationController.js";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Center from "../models/Center.js";
import Caregiver from "../models/Caregiver.js";
import Booking from "../models/Booking.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";

// Date parsing and query helper utilities for admin reporting
const parseDateRange = (startDateStr, endDateStr) => {
  if (!startDateStr && !endDateStr) {
    return { start: null, end: null, error: null };
  }

  let start = null;
  let end = null;

  if (startDateStr !== undefined && startDateStr !== null && startDateStr !== "") {
    const parsedStart = new Date(startDateStr);
    if (isNaN(parsedStart.getTime())) {
      return { error: "Invalid startDate format. Please provide a valid date string (e.g., YYYY-MM-DD or ISO 8601)." };
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(startDateStr).trim())) {
      parsedStart.setUTCHours(0, 0, 0, 0);
    }
    start = parsedStart;
  }

  if (endDateStr !== undefined && endDateStr !== null && endDateStr !== "") {
    const parsedEnd = new Date(endDateStr);
    if (isNaN(parsedEnd.getTime())) {
      return { error: "Invalid endDate format. Please provide a valid date string (e.g., YYYY-MM-DD or ISO 8601)." };
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(endDateStr).trim())) {
      parsedEnd.setUTCHours(23, 59, 59, 999);
    }
    end = parsedEnd;
  }

  if (start && end && start > end) {
    return { error: "startDate cannot be later than endDate." };
  }

  return { start, end, error: null };
};

const buildDateFilter = (field, start, end) => {
  if (!start && !end) return {};
  const filter = {};
  if (start && end) {
    filter[field] = { $gte: start, $lte: end };
  } else if (start) {
    filter[field] = { $gte: start };
  } else if (end) {
    filter[field] = { $lte: end };
  }
  return filter;
};

const buildPaymentDateFilter = (start, end) => {
  if (!start && !end) return {};
  const range = {};
  if (start) range.$gte = start;
  if (end) range.$lte = end;

  return {
    $or: [
      { paidAt: range },
      { paidAt: null, createdAt: range },
      { paidAt: { $exists: false }, createdAt: range },
    ],
  };
};

const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { start, end, error } = parseDateRange(startDate, endDate);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const createdFilter = buildDateFilter("createdAt", start, end);
    const bookingDateFilter = (start || end)
      ? {
          $or: [
            { bookingDate: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
            { bookingDate: null, createdAt: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
          ],
        }
      : {};
    const subscriptionDateFilter = (start || end)
      ? {
          $or: [
            { startDate: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
            { startDate: null, createdAt: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
          ],
        }
      : {};
    const paymentCreatedFilter = buildDateFilter("createdAt", start, end);

    const revenueMatch = {
      status: { $in: ["Success", "success", "Paid", "paid"] },
    };
    if (start || end) {
      Object.assign(revenueMatch, buildPaymentDateFilter(start, end));
    }

    const [
      totalUsers,
      totalParents,
      totalProviders,
      verifiedProviders,
      pendingProviders,
      totalCenters,
      totalCaregivers,
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      completedBookings,
      cancelledBookings,
      totalSubscriptions,
      totalPayments,
      revenue,
    ] = await Promise.all([
      // Total users
      User.countDocuments(createdFilter),

      // Total parents
      User.countDocuments({
        role: "parent",
        ...createdFilter,
      }),

      // Total providers
      User.countDocuments({
        role: "provider",
        ...createdFilter,
      }),

      // Verified providers
      User.countDocuments({
        role: "provider",
        isApproved: true,
        ...createdFilter,
      }),

      // Pending providers
      User.countDocuments({
        role: "provider",
        isApproved: false,
        ...createdFilter,
      }),

      // Total centers
      Center.countDocuments(createdFilter),

      // Total caregivers
      Caregiver.countDocuments(createdFilter),

      // Total bookings
      Booking.countDocuments(bookingDateFilter),

      // Pending bookings
      Booking.countDocuments({
        status: { $in: ["Pending", "pending"] },
        ...bookingDateFilter,
      }),

      // Approved bookings
      Booking.countDocuments({
        status: { $in: ["Approved", "approved"] },
        ...bookingDateFilter,
      }),

      // Rejected bookings
      Booking.countDocuments({
        status: { $in: ["Rejected", "rejected"] },
        ...bookingDateFilter,
      }),

      // Completed bookings
      Booking.countDocuments({
        status: { $in: ["Completed", "completed"] },
        ...bookingDateFilter,
      }),

      // Cancelled bookings
      Booking.countDocuments({
        status: { $in: ["Cancelled", "cancelled"] },
        ...bookingDateFilter,
      }),

      // Total subscriptions
      Subscription.countDocuments(subscriptionDateFilter),

      // Successful payments
      Payment.countDocuments({
        status: { $in: ["Success", "success", "Paid", "paid"] },
        ...(start || end ? buildPaymentDateFilter(start, end) : {}),
      }),

      // Total revenue
      Payment.aggregate([
        {
          $match: revenueMatch,
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$amount",
            },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalParents,
        totalProviders,
        verifiedProviders,
        pendingProviders,
        totalCenters,
        totalCaregivers,
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        completedBookings,
        cancelledBookings,
        totalSubscriptions,
        totalPayments,
        revenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
      },
      filters: (start || end) ? {
        startDate,
        endDate,
      } : undefined,
    });
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    const formattedUsers = await Promise.all(
      users.map(async (user) => {
        if (user.role !== "provider") {
          return user;
        }

        const provider = await Provider.findOne({
          user: user._id,
        });

        return {
          ...user.toObject(),

          provider: provider
            ? {
                _id: provider._id,
                phone: provider.phone,
                address: provider.address,
                qualification: provider.qualification,
                experience: provider.experience,
                governmentId: provider.governmentId,
                profileImage: provider.profileImage,
                verificationStatus: provider.verificationStatus,
              }
            : null,
        };
      }),
    );

    res.status(200).json({
      success: true,
      total: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let provider = null;

    if (user.role === "provider") {
      provider = await Provider.findOne({
        user: user._id,
      }).select("-__v");
    }

    res.status(200).json({
      success: true,
      user,
      provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Invalid status",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,

        message: "User not found",
      });
    }

    user.status = status;

    await user.save();

    res.status(200).json({
      success: true,

      message: `User ${status} successfully`,

      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

const getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find()
      .populate("user", "name email role status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: providers.length,
      providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPendingProviders = async (req, res) => {
  try {
    const providers = await Provider.find({
      verificationStatus: "pending",
    })
      .populate("user", "name email role status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: providers.length,
      providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!provider) {
      return res.status(404).json({
        success: false,

        message: "Provider not found",
      });
    }

    res.status(200).json({
      success: true,

      provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

const approveProvider = async (req, res) => {
  try {
    let provider = await Provider.findById(req.params.id);
    if (!provider) {
      provider = await Provider.findOne({ user: req.params.id });
    }

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Update Provider
    provider.verificationStatus = "approved";

    await provider.save();

    // Update related User
    const user = await User.findById(provider.user);

    if (user) {
      user.isApproved = true;
      user.status = "active";

      await user.save();
    }

    // In-app notification for Provider upon approval (non-blocking)
    await createInAppNotification({
      recipient: provider.user,
      type: "provider_status",
      title: "Provider Application Approved",
      message: "Congratulations! Your provider profile and childcare center registration have been approved by the platform administrator.",
      relatedEntity: { id: provider._id, modelName: "Provider" },
    });

    res.status(200).json({
      success: true,
      message: "Provider approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectProvider = async (req, res) => {
  try {
    let provider = await Provider.findById(req.params.id);
    if (!provider) {
      provider = await Provider.findOne({ user: req.params.id });
    }

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Update Provider
    provider.verificationStatus = "rejected";

    await provider.save();

    // Update related User
    const user = await User.findById(provider.user);

    if (user) {
      user.isApproved = false;
      user.status = "blocked";

      await user.save();
    }

    // In-app notification for Provider upon rejection (non-blocking)
    await createInAppNotification({
      recipient: provider.user,
      type: "provider_status",
      title: "Provider Application Rejected",
      message: "Your provider application has been reviewed and rejected by the platform administrator.",
      relatedEntity: { id: provider._id, modelName: "Provider" },
    });

    res.status(200).json({
      success: true,
      message: "Provider rejected successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllCenters = async (req, res) => {
  try {
    const centers = await Center.find()
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: centers.length,
      centers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleCenter = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id).populate({
      path: "provider",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    res.status(200).json({
      success: true,
      center,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCenterStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const center = await Center.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    center.status = status;

    await center.save();

    res.status(200).json({
      success: true,
      message: "Center status updated successfully",
      center,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("parent", "name email")
      .populate("center", "centerName")
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

const getSingleBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("parent", "name email phone")
      .populate("center", "centerName address");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
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

const getBookingsByStatus = async (req, res) => {
  try {
    const rawStatus = req.params.status || "";
    const status =
      rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

    // 👇 Ei jaygay validation add korbe
    const allowedStatus = [
      "Pending",
      "Approved",
      "Rejected",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const bookings = await Booking.find({
      status: { $in: [status, status.toLowerCase()] },
    })
      .populate("parent", "name email")
      .populate("center", "centerName");

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

const getBookingsByPaymentStatus = async (req, res) => {
  try {
    const rawStatus = req.params.paymentStatus || "";
    const paymentStatus =
      rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

    const allowedPaymentStatus = ["Pending", "Paid"];
    if (!allowedPaymentStatus.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const bookings = await Booking.find({
      paymentStatus: { $in: [paymentStatus, paymentStatus.toLowerCase()] },
    })
      .populate("parent", "name email")
      .populate("center", "centerName");

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

const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("parent", "name email")
      .populate("center", "centerName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate("parent", "name email")
      .populate("center", "centerName");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSubscriptionsByStatus = async (req, res) => {
  try {
    const rawStatus = req.params.status || "";
    const status =
      rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

    const allowedStatus = ["Pending", "Active", "Expired", "Cancelled"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription status",
      });
    }

    const subscriptions = await Subscription.find({
      status: { $in: [status, status.toLowerCase()] },
    })
      .populate("parent", "name email")
      .populate("center", "centerName");

    res.status(200).json({
      success: true,

      total: subscriptions.length,

      subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("parent", "name email")
      .populate({
        path: "booking",
        populate: {
          path: "center",
          select: "centerName city address",
        },
      })
      .populate({
        path: "subscription",
        populate: {
          path: "center",
          select: "centerName city address",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,

      total: payments.length,

      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

const getSinglePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("parent", "name email")
      .populate({
        path: "booking",
        populate: {
          path: "center",
          select: "centerName city address",
        },
      })
      .populate({
        path: "subscription",
        populate: {
          path: "center",
          select: "centerName city address",
        },
      });

    if (!payment) {
      return res.status(404).json({
        success: false,

        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,

      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

const getPaymentsByStatus = async (req, res) => {
  try {
    const rawStatus = req.params.status || "";
    const status =
      rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

    const allowedPaymentStatus = ["Pending", "Success", "Failed"];

    if (!allowedPaymentStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const payments = await Payment.find({
      status: { $in: [status, status.toLowerCase()] },
    })
      .populate("parent", "name email")
      .populate({
        path: "booking",
        populate: {
          path: "center",
          select: "centerName city address",
        },
      })
      .populate({
        path: "subscription",
        populate: {
          path: "center",
          select: "centerName city address",
        },
      });

    res.status(200).json({
      success: true,

      total: payments.length,

      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

const getOverviewReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { start, end, error } = parseDateRange(startDate, endDate);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const createdFilter = buildDateFilter("createdAt", start, end);
    const bookingDateFilter = (start || end)
      ? {
          $or: [
            { bookingDate: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
            { bookingDate: null, createdAt: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
          ],
        }
      : {};
    const subscriptionDateFilter = (start || end)
      ? {
          $or: [
            { startDate: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
            { startDate: null, createdAt: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
          ],
        }
      : {};
    const paymentCreatedFilter = buildDateFilter("createdAt", start, end);

    const revenueMatch = {
      status: { $in: ["Success", "success", "Paid", "paid"] },
    };
    if (start || end) {
      Object.assign(revenueMatch, buildPaymentDateFilter(start, end));
    }

    const [
      totalUsers,
      totalProviders,
      totalCenters,
      totalCaregivers,
      totalBookings,
      totalSubscriptions,
      totalPayments,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments(createdFilter),
      Provider.countDocuments(createdFilter),
      Center.countDocuments(createdFilter),
      Caregiver.countDocuments(createdFilter),
      Booking.countDocuments(bookingDateFilter),
      Subscription.countDocuments(subscriptionDateFilter),
      Payment.countDocuments(paymentCreatedFilter),
      Payment.aggregate([
        { $match: revenueMatch },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const overviewData = {
      totalUsers,
      totalProviders,
      totalCenters,
      totalCaregivers,
      totalBookings,
      totalSubscriptions,
      totalPayments,
      totalRevenue,
    };

    res.status(200).json({
      success: true,
      overview: overviewData,
      report: overviewData,
      filters: (start || end) ? {
        startDate,
        endDate,
        dateBases: {
          users: "createdAt",
          providers: "createdAt",
          centers: "createdAt",
          caregivers: "createdAt",
          bookings: "bookingDate",
          subscriptions: "startDate",
          payments: "createdAt",
          revenue: "paidAt (fallback to createdAt)",
        },
      } : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { start, end, error } = parseDateRange(startDate, endDate);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const revenueMatch = {
      status: { $in: ["Success", "success", "Paid", "paid"] },
    };
    if (start || end) {
      Object.assign(revenueMatch, buildPaymentDateFilter(start, end));
    }

    const payments = await Payment.find(revenueMatch).select("amount paidAt createdAt");

    const totalRevenue = payments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = months.map((month) => ({ month, revenue: 0 }));
    payments.forEach((p) => {
      const paymentDate = p.paidAt || p.createdAt;
      const m = new Date(paymentDate).getMonth();
      if (m >= 0 && m < 12) {
        monthlyRevenue[m].revenue += p.amount;
      }
    });

    res.status(200).json({
      success: true,
      totalTransactions: payments.length,
      totalRevenue,
      currency: "INR",
      monthlyRevenue,
      report: monthlyRevenue,
      filters: (start || end) ? {
        startDate,
        endDate,
        dateBasis: "paidAt (fallback to createdAt)",
      } : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBookingReport = async (req, res) => {
  try {
    const { startDate, endDate, dateBasis } = req.query;
    const { start, end, error } = parseDateRange(startDate, endDate);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const bookingDateField = dateBasis === "createdAt" ? "createdAt" : "bookingDate";
    const bookingDateFilter = (start || end)
      ? (dateBasis === "createdAt"
          ? buildDateFilter("createdAt", start, end)
          : {
              $or: [
                { bookingDate: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
                { bookingDate: null, createdAt: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
              ],
            })
      : {};

    const [pending, approved, rejected, completed, cancelled] = await Promise.all([
      Booking.countDocuments({
        status: { $in: ["Pending", "pending"] },
        ...bookingDateFilter,
      }),
      Booking.countDocuments({
        status: { $in: ["Approved", "approved"] },
        ...bookingDateFilter,
      }),
      Booking.countDocuments({
        status: { $in: ["Rejected", "rejected"] },
        ...bookingDateFilter,
      }),
      Booking.countDocuments({
        status: { $in: ["Completed", "completed"] },
        ...bookingDateFilter,
      }),
      Booking.countDocuments({
        status: { $in: ["Cancelled", "cancelled"] },
        ...bookingDateFilter,
      }),
    ]);

    const chartData = [
      { status: "Pending", count: pending },
      { status: "Approved", count: approved },
      { status: "Rejected", count: rejected },
      { status: "Completed", count: completed },
      { status: "Cancelled", count: cancelled },
    ];

    res.status(200).json({
      success: true,
      bookings: {
        pending,
        approved,
        rejected,
        completed,
        cancelled,
      },
      chartData,
      report: chartData,
      filters: (start || end) ? {
        startDate,
        endDate,
        dateBasis: bookingDateField,
      } : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSubscriptionReport = async (req, res) => {
  try {
    const { startDate, endDate, dateBasis } = req.query;
    const { start, end, error } = parseDateRange(startDate, endDate);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const subscriptionDateField = dateBasis === "createdAt" ? "createdAt" : "startDate";
    const subscriptionDateFilter = (start || end)
      ? (dateBasis === "createdAt"
          ? buildDateFilter("createdAt", start, end)
          : {
              $or: [
                { startDate: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
                { startDate: null, createdAt: { ...(start && { $gte: start }), ...(end && { $lte: end }) } },
              ],
            })
      : {};

    const [pending, active, expired, cancelled] = await Promise.all([
      Subscription.countDocuments({
        status: { $in: ["Pending", "pending"] },
        ...subscriptionDateFilter,
      }),
      Subscription.countDocuments({
        status: { $in: ["Active", "active"] },
        ...subscriptionDateFilter,
      }),
      Subscription.countDocuments({
        status: { $in: ["Expired", "expired"] },
        ...subscriptionDateFilter,
      }),
      Subscription.countDocuments({
        status: { $in: ["Cancelled", "cancelled"] },
        ...subscriptionDateFilter,
      }),
    ]);

    const chartData = [
      { status: "Active", count: active },
      { status: "Pending", count: pending },
      { status: "Expired", count: expired },
      { status: "Cancelled", count: cancelled },
    ];

    res.status(200).json({
      success: true,
      subscriptions: {
        pending,
        active,
        expired,
        cancelled,
      },
      chartData,
      report: chartData,
      filters: (start || end) ? {
        startDate,
        endDate,
        dateBasis: subscriptionDateField,
      } : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getDashboardStats,
  getAllUsers,
  getAllCenters,
  getAllBookings,
  getSingleBooking,
  getBookingsByStatus,
  getBookingsByPaymentStatus,
  getSingleUser,
  getSingleCenter,
  updateCenterStatus,
  updateUserStatus,
  getAllProviders,
  getPendingProviders,
  getSingleProvider,
  approveProvider,
  rejectProvider,
  getAllSubscriptions,
  getSingleSubscription,
  getSubscriptionsByStatus,
  getAllPayments,
  getSinglePayment,
  getPaymentsByStatus,
  getOverviewReport,
  getRevenueReport,
  getBookingReport,
  getSubscriptionReport,
};
