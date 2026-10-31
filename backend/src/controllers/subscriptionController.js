import Subscription from "../models/Subscription.js";
import Center from "../models/Center.js";
import Provider from "../models/Provider.js";
import { processSubscriptionExpirations } from "../utils/subscriptionExpiryHelper.js";
import {
  calculatePackagePrice,
  getPackageBenefits,
  isValidTier,
  isValidPlanType,
  SUBSCRIPTION_TIERS,
  TIER_BENEFITS,
} from "../config/subscriptionPackages.js";

// Helper: Calculate authoritative subscription amount with tier support
const calculateSubscriptionAmount = (center, planType, tier = null) => {
  const baseMonthly = Number(center.monthlyFee) || 0;
  return calculatePackagePrice(baseMonthly, planType, tier);
};

// Helper: Calculate authoritative end date from start date
const calculateEndDate = (startDate, planType) => {
  const date = new Date(startDate);
  switch (planType) {
    case "Monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "Quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "Yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  return date;
};

const createSubscription = async (req, res) => {
  try {
    const { center, planType, tier, startDate, endDate } = req.body;

    // 1. Validate Required Fields
    if (!center || !planType || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Center, plan type, and start date are required",
      });
    }

    // 2. Validate Supported Plan Type
    if (!isValidPlanType(planType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type. Must be Monthly, Quarterly, or Yearly.",
      });
    }

    // 2b. Validate Tier if provided
    if (tier && !isValidTier(tier)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package tier. Must be Basic, Standard, or Premium.",
      });
    }

    // 3. Validate Start Date
    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date format",
      });
    }

    // 4. Verify Center Existence, Status & Provider Approval
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
        message: "This center is currently inactive and cannot accept subscriptions.",
      });
    }

    if (
      !centerExists.provider ||
      centerExists.provider.verificationStatus !== "approved"
    ) {
      return res.status(400).json({
        success: false,
        message: "This center's provider is pending verification and cannot accept subscriptions.",
      });
    }

    // 5. Authoritative Pricing & Date Calculation (Never trust client-supplied amount or benefits)
    const authoritativeAmount = calculateSubscriptionAmount(centerExists, planType, tier || null);
    const verifiedBenefits = getPackageBenefits(tier || null);
    const authoritativeEndDate = endDate && !isNaN(new Date(endDate).getTime())
      ? new Date(endDate)
      : calculateEndDate(parsedStartDate, planType);

    if (authoritativeEndDate <= parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "Subscription end date must be after the start date.",
      });
    }

    // 6. Create Subscription (status defaults to Pending until payment verification)
    const subscription = await Subscription.create({
      parent: req.user._id,
      center: centerExists._id,
      tier: tier || null,
      benefits: verifiedBenefits,
      planType,
      startDate: parsedStartDate,
      endDate: authoritativeEndDate,
      amount: authoritativeAmount,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscription,
    });
  } catch (error) {
    console.error("CREATE SUBSCRIPTION ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMySubscriptions = async (req, res) => {
  try {
    // Auto-expire any active subscriptions whose end date has passed
    const now = new Date();
    await Subscription.updateMany(
      {
        parent: req.user._id,
        status: "Active",
        endDate: { $lt: now },
      },
      { $set: { status: "Expired" } }
    );

    const subscriptions = await Subscription.find({
      parent: req.user._id,
    })
      .populate("center", "centerName city slug address monthlyFee")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error("GET MY SUBSCRIPTIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSubscriptionDetails = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate(
      "center",
      "centerName city slug monthlyFee address",
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (subscription.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Check expiry
    if (subscription.status === "Active" && new Date(subscription.endDate) < new Date()) {
      subscription.status = "Expired";
      await subscription.save();
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

const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Ownership Check
    if (subscription.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Already Cancelled
    if (subscription.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Subscription is already cancelled",
      });
    }

    // Expired Check
    if (subscription.status === "Expired") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel an expired subscription",
      });
    }

    // Allow cancelling Active or Pending subscriptions
    if (subscription.status !== "Active" && subscription.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only active or pending subscriptions can be cancelled",
      });
    }

    subscription.status = "Cancelled";
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProviderSubscriptions = async (req, res) => {
  try {
    // Find Provider
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    // Find all centers owned by provider
    const centers = await Center.find({
      provider: provider._id,
    });

    if (!centers.length) {
      return res.status(200).json({
        success: true,
        total: 0,
        subscriptions: [],
      });
    }

    const centerIds = centers.map((c) => c._id);

    // Auto-expire active subscriptions whose end date has passed
    const now = new Date();
    await Subscription.updateMany(
      {
        center: { $in: centerIds },
        status: "Active",
        endDate: { $lt: now },
      },
      { $set: { status: "Expired" } }
    );

    // Fetch Subscriptions across provider's centers
    const subscriptions = await Subscription.find({
      center: { $in: centerIds },
    })
      .populate("parent", "name email")
      .populate("center", "centerName city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error("GET PROVIDER SUBSCRIPTIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProviderSubscriptionAnalytics = async (req, res) => {
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

    const centers = await Center.find({
      provider: provider._id,
    });

    if (!centers.length) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          cancelledSubscriptions: 0,
          expiredSubscriptions: 0,
          totalRevenue: 0,
        },
      });
    }

    const centerIds = centers.map((c) => c._id);

    // Auto-expire
    const now = new Date();
    await Subscription.updateMany(
      {
        center: { $in: centerIds },
        status: "Active",
        endDate: { $lt: now },
      },
      { $set: { status: "Expired" } }
    );

    const subscriptions = await Subscription.find({
      center: { $in: centerIds },
    });

    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter((s) => s.status === "Active").length;
    const cancelledSubscriptions = subscriptions.filter((s) => s.status === "Cancelled").length;
    const expiredSubscriptions = subscriptions.filter((s) => s.status === "Expired").length;
    const totalRevenue = subscriptions
      .filter((s) => s.status === "Active")
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    res.status(200).json({
      success: true,
      analytics: {
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        expiredSubscriptions,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Protected endpoint for external cron schedulers (Vercel Cron, external runner)
 * or authenticated platform administrators to trigger subscription lifecycle processing.
 * Never runs unauthenticated.
 */
const processSubscriptionExpiryJob = async (req, res) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers?.authorization;

    const isCronAuthorized =
      cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isAdminAuthorized = req.user && req.user.role === "admin";

    if (!isCronAuthorized && !isAdminAuthorized) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized: Invalid or missing authorization credentials for lifecycle job",
      });
    }

    const result = await processSubscriptionExpirations();

    return res.status(200).json({
      success: true,
      message: "Subscription lifecycle check completed successfully",
      ...result,
    });
  } catch (error) {
    console.error("SUBSCRIPTION LIFECYCLE JOB ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process subscription lifecycle",
    });
  }
};

export {
  createSubscription,
  getMySubscriptions,
  getSubscriptionDetails,
  cancelSubscription,
  getProviderSubscriptions,
  getProviderSubscriptionAnalytics,
  processSubscriptionExpiryJob,
};
