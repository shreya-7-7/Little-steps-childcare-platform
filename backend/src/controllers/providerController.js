import Provider from "../models/Provider.js";
import Booking from "../models/Booking.js";
import Center from "../models/Center.js";
import Caregiver from "../models/Caregiver.js";

const createProviderProfile = async (req, res) => {
  try {
    const { phone, address, qualification, experience } = req.body;

    if (!phone || !address || !qualification || !experience) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingProvider = await Provider.findOne({
      user: req.user._id,
    });

    if (existingProvider) {
      return res.status(409).json({
        success: false,
        message: "Provider profile already exists",
      });
    }

    const provider = await Provider.create({
      user: req.user._id,
      phone,
      address,
      qualification,
      experience,
    });

    res.status(201).json({
      success: true,
      message: "Provider profile created successfully",
      provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    }).populate("user", "-password");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
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

const updateProviderProfile = async (req, res) => {
  try {
    // Prevent providers from self-verifying or reassigning account
    delete req.body.verificationStatus;
    delete req.body.user;

    const provider = await Provider.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Provider profile updated successfully",
      provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProviderDashboard = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const centers = await Center.find({
      provider: provider._id,
    }).select("_id");

    if (!centers.length) {
      return res.status(200).json({
        success: true,
        dashboard: {
          totalBookings: 0,
          pendingBookings: 0,
          approvedBookings: 0,
          totalRevenue: 0,
          totalCaregivers: 0,
        },
      });
    }

    const centerIds = centers.map((c) => c._id);

    const totalBookings = await Booking.countDocuments({
      center: { $in: centerIds },
    });

    const pendingBookings = await Booking.countDocuments({
      center: { $in: centerIds },
      status: "Pending",
    });

    const approvedBookings = await Booking.countDocuments({
      center: { $in: centerIds },
      status: "Approved",
    });

    const completedBookings = await Booking.find({
      center: { $in: centerIds },
      paymentStatus: "Paid",
    });

    const totalRevenue = completedBookings.reduce(
      (sum, booking) => sum + booking.amount,
      0,
    );

    const totalCaregivers = await Caregiver.countDocuments({
      center: { $in: centerIds },
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalBookings,
        pendingBookings,
        approvedBookings,
        totalRevenue,
        totalCaregivers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    })
      .select("_id")
      .lean();

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Get all centers belonging to this provider
    const centers = await Center.find({
      provider: provider._id,
    })
      .select("_id")
      .lean();

    if (!centers.length) {
      return res.status(200).json({
        success: true,
        stats: {
          totalCenters: 0,
          totalBookings: 0,
          pendingBookings: 0,
          approvedBookings: 0,
          rejectedBookings: 0,
          completedBookings: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalCaregivers: 0,
        },
      });
    }

    const centerIds = centers.map((center) => center._id);

    // Parallel fetch with lean projection for fast response
    const [bookings, totalCaregivers] = await Promise.all([
      Booking.find({
        center: { $in: centerIds },
      })
        .select("status paymentStatus amount createdAt")
        .lean(),
      Caregiver.countDocuments({
        center: { $in: centerIds },
      }),
    ]);

    const totalBookings = bookings.length;
    let pendingBookings = 0;
    let approvedBookings = 0;
    let rejectedBookings = 0;
    let completedBookings = 0;
    let totalRevenue = 0;
    let monthlyRevenue = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (let i = 0; i < bookings.length; i++) {
      const b = bookings[i];
      const statusLower = b.status?.toLowerCase();
      if (statusLower === "pending") pendingBookings++;
      else if (statusLower === "approved") approvedBookings++;
      else if (statusLower === "rejected") rejectedBookings++;
      else if (statusLower === "completed") completedBookings++;

      if (b.paymentStatus === "Paid" && b.amount) {
        totalRevenue += b.amount;
        if (b.createdAt) {
          const d = new Date(b.createdAt);
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            monthlyRevenue += b.amount;
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalCenters: centers.length,
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        completedBookings,
        totalRevenue,
        monthlyRevenue,
        totalCaregivers,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRecentBookings = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const centers = await Center.find({
      provider: provider._id,
    }).select("_id");

    if (!centers.length) {
      return res.status(200).json({
        success: true,
        total: 0,
        bookings: [],
      });
    }

    const centerIds = centers.map((c) => c._id);

    const bookings = await Booking.find({
      center: { $in: centerIds },
    })
      .populate("parent", "name email")
      .populate("center", "centerName")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("GET RECENT BOOKINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMonthlyRevenue = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const centers = await Center.find({
      provider: provider._id,
    }).select("_id");

    if (!centers.length) {
      return res.status(200).json({
        success: true,
        revenue: [
          { month: "Jan", revenue: 0 },
          { month: "Feb", revenue: 0 },
          { month: "Mar", revenue: 0 },
          { month: "Apr", revenue: 0 },
          { month: "May", revenue: 0 },
          { month: "Jun", revenue: 0 },
          { month: "Jul", revenue: 0 },
          { month: "Aug", revenue: 0 },
          { month: "Sep", revenue: 0 },
          { month: "Oct", revenue: 0 },
          { month: "Nov", revenue: 0 },
          { month: "Dec", revenue: 0 },
        ],
      });
    }

    const centerIds = centers.map((c) => c._id);

    const bookings = await Booking.find({
      center: { $in: centerIds },
      paymentStatus: "Paid",
    });

    const revenue = Array(12).fill(0);

    bookings.forEach((booking) => {
      const month = new Date(booking.createdAt).getMonth();

      revenue[month] += booking.amount;
    });

    res.status(200).json({
      success: true,
      revenue: [
        { month: "Jan", revenue: revenue[0] },
        { month: "Feb", revenue: revenue[1] },
        { month: "Mar", revenue: revenue[2] },
        { month: "Apr", revenue: revenue[3] },
        { month: "May", revenue: revenue[4] },
        { month: "Jun", revenue: revenue[5] },
        { month: "Jul", revenue: revenue[6] },
        { month: "Aug", revenue: revenue[7] },
        { month: "Sep", revenue: revenue[8] },
        { month: "Oct", revenue: revenue[9] },
        { month: "Nov", revenue: revenue[10] },
        { month: "Dec", revenue: revenue[11] },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDashboardNotifications = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const centers = await Center.find({
      provider: provider._id,
    }).select("_id");

    if (!centers.length) {
      return res.status(200).json({
        success: true,
        notifications: {
          pendingBookings: 0,
          unpaidBookings: 0,
          todaysBookings: 0,
        },
      });
    }

    const centerIds = centers.map((c) => c._id);

    // Pending bookings
    const pendingBookings = await Booking.countDocuments({
      center: { $in: centerIds },
      status: { $in: ["Pending", "pending"] },
    });

    // Approved but unpaid
    const unpaidBookings = await Booking.countDocuments({
      center: { $in: centerIds },
      status: { $in: ["Approved", "approved"] },
      paymentStatus: { $in: ["Pending", "pending", "unpaid"] },
    });

    // Today's bookings
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todaysBookings = await Booking.countDocuments({
      center: { $in: centerIds },
      bookingDate: {
        $gte: start,
        $lte: end,
      },
    });

    res.status(200).json({
      success: true,
      notifications: {
        pendingBookings,
        unpaidBookings,
        todaysBookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createProviderProfile,
  getProviderProfile,
  updateProviderProfile,
  getDashboardNotifications,
  getProviderDashboard,
  getDashboardStats,
  getRecentBookings,
  getMonthlyRevenue,
};
