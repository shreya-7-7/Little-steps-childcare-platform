import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import { createInAppNotification } from "./notificationController.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import Center from "../models/Center.js";
import Provider from "../models/Provider.js";
import User from "../models/User.js";
import { runInTransaction } from "../utils/capacityHelper.js";
import {
  calculatePackagePrice,
  getPackageBenefits,
  isValidTier,
  isValidPlanType,
} from "../config/subscriptionPackages.js";

/**
 * Safely verify Razorpay HMAC SHA256 signature in constant time.
 * Guards against unequal buffer lengths, non-string inputs, and RangeError.
 * Never leaks secrets or raw signatures in error messages or logs.
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string" ||
    typeof secret !== "string" ||
    !orderId ||
    !paymentId ||
    !signature ||
    !secret
  ) {
    return false;
  }

  try {
    const payload = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const genBuf = Buffer.from(generatedSignature, "utf-8");
    const sigBuf = Buffer.from(signature, "utf-8");

    if (genBuf.length !== sigBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(genBuf, sigBuf);
  } catch {
    return false;
  }
};

const createOrder = async (req, res) => {
  try {
    const { bookingId, planType, tier, center, startDate, endDate } = req.body;

    // 1. Guard: Check Razorpay Initialization or Demo Mode Allowance
    const isDemoAllowed =
      process.env.NODE_ENV !== "production" &&
      (process.env.ALLOW_DEMO_PAYMENT === "true" || !razorpay);

    if (!razorpay && !isDemoAllowed) {
      return res.status(503).json({
        success: false,
        message: "Payment gateway service is uninitialized. Razorpay credentials are not configured.",
      });
    }

    // 2. Validate request
    if (!bookingId && !planType) {
      return res.status(400).json({
        success: false,
        message: "Booking or Subscription details are required",
      });
    }

    let amount = 0;
    let booking = null;

    // ============================
    // Booking Payment
    // ============================
    if (bookingId) {
      booking = await Booking.findById(bookingId).populate({
        path: "center",
        populate: { path: "provider" },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (booking.parent.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized booking access",
        });
      }

      if (booking.status !== "Approved") {
        return res.status(400).json({
          success: false,
          message: "Booking must be approved by the provider before payment",
        });
      }

      if (!booking.center || booking.center.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "The center for this booking is inactive and cannot accept payments",
        });
      }

      if (
        !booking.center.provider ||
        booking.center.provider.verificationStatus !== "approved"
      ) {
        return res.status(400).json({
          success: false,
          message: "This center's provider is pending verification and cannot accept payments",
        });
      }

      if (booking.paymentStatus === "Paid") {
        return res.status(400).json({
          success: false,
          message: "Booking has already been paid",
        });
      }

      const completedPayment = await Payment.findOne({
        booking: bookingId,
        status: "Success",
      });

      if (completedPayment) {
        return res.status(400).json({
          success: false,
          message: "Payment has already been completed for this booking",
        });
      }

      if (
        booking.amount === undefined ||
        booking.amount === null ||
        booking.amount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking amount",
        });
      }

      // Clean up any stale unverified pending payment for this booking
      await Payment.deleteMany({
        booking: bookingId,
        parent: req.user._id,
        status: "Pending",
      });

      // Authoritative amount from booking
      amount = Number(booking.amount);
    }

    // ============================
    // Subscription Payment
    // ============================
    if (planType) {
      if (!center || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Incomplete subscription information. Center, startDate, and endDate are required.",
        });
      }

      const centerData = await Center.findById(center).populate("provider");
      if (!centerData) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      if (centerData.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "This center is currently inactive and cannot accept subscription payments.",
        });
      }

      if (
        !centerData.provider ||
        centerData.provider.verificationStatus !== "approved"
      ) {
        return res.status(400).json({
          success: false,
          message: "This center's provider is pending verification and cannot accept subscription payments.",
        });
      }

      if (tier && !isValidTier(tier)) {
        return res.status(400).json({
          success: false,
          message: "Invalid package tier. Must be Basic, Standard, or Premium.",
        });
      }

      if (!isValidPlanType(planType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid plan type. Must be Monthly, Quarterly, or Yearly",
        });
      }

      // Authoritative subscription calculation (never trust client amounts)
      amount = calculatePackagePrice(centerData.monthlyFee, planType, tier || null);

      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription amount configured for this center",
        });
      }
    }

    let order;
    let paymentMethod = "Razorpay";

    if (razorpay) {
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
      order = await razorpay.orders.create(options);
    } else {
      // Development-only simulated demo order
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      order = {
        id: `demo_order_${Date.now()}_${randomSuffix}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `demo_receipt_${Date.now()}`,
        status: "created",
        isDemo: true,
      };
      paymentMethod = "Demo Simulation";
    }

    const verifiedBenefits = planType ? getPackageBenefits(tier || null) : [];

    const payment = await Payment.create({
      parent: req.user._id,
      booking: bookingId || null,
      subscription: null,
      subscriptionData: planType
        ? {
            center,
            planType,
            tier: tier || null,
            benefits: verifiedBenefits,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        : null,
      razorpayOrderId: order.id,
      amount,
      currency: order.currency || "INR",
      paymentMethod,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: paymentMethod === "Demo Simulation"
        ? "Demo payment order created successfully"
        : "Payment order created successfully",
      order,
      payment,
      isDemo: paymentMethod === "Demo Simulation",
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // 1. Validate Request parameters
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing or invalid payment verification parameters (order ID, payment ID, or signature)",
      });
    }

    // 2. Guard: Verify Secret Configuration
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({
        success: false,
        message:
          "Payment verification cannot proceed: Razorpay secret is not configured on the server",
      });
    }

    // 3. Cryptographic Constant-Time Signature Comparison
    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid cryptographic signature",
      });
    }

    // 4. Atomic verification within a database transaction
    const updatedPayment = await runInTransaction(async (session) => {
      // Find Payment Record by Order ID within session
      const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
      }).session(session);

      if (!payment) {
        const err = new Error("Payment record not found for this order");
        err.statusCode = 404;
        throw err;
      }

      // User Ownership Check (Order cannot be reused across accounts)
      if (payment.parent.toString() !== req.user._id.toString()) {
        const err = new Error(
          "Unauthorized: Payment does not belong to the authenticated user"
        );
        err.statusCode = 403;
        throw err;
      }

      // Duplicate Verification & Replay Protection
      if (payment.status === "Success") {
        const err = new Error("Payment has already been verified and processed");
        err.statusCode = 400;
        throw err;
      }

      const existingPaymentWithId = await Payment.findOne({
        razorpayPaymentId: razorpay_payment_id,
        status: "Success",
      }).session(session);

      if (
        existingPaymentWithId &&
        existingPaymentWithId._id.toString() !== payment._id.toString()
      ) {
        const err = new Error(
          "This Razorpay payment ID has already been recorded for another transaction"
        );
        err.statusCode = 400;
        throw err;
      }

      // Atomic Conditional Update on Payment document within session
      const result = await Payment.findOneAndUpdate(
        {
          _id: payment._id,
          parent: req.user._id,
          status: "Pending",
        },
        {
          $set: {
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: "Success",
            paidAt: new Date(),
          },
        },
        { new: true, session }
      );

      if (!result) {
        const err = new Error(
          "Payment has already been processed or status is no longer pending"
        );
        err.statusCode = 400;
        throw err;
      }

      // Update Booking Payment Status (if booking exists)
      if (result.booking) {
        const booking = await Booking.findById(result.booking).session(session);
        if (booking) {
          booking.paymentStatus = "Paid";
          await booking.save({ session });
        }
      }

      // Activate Subscription (if subscriptionData exists and is valid)
      if (result.subscriptionData?.center && result.subscriptionData?.planType) {
        const [subscription] = await Subscription.create(
          [
            {
              parent: result.parent,
              center: result.subscriptionData.center,
              tier: result.subscriptionData.tier || null,
              benefits: result.subscriptionData.benefits || [],
              planType: result.subscriptionData.planType,
              startDate: result.subscriptionData.startDate,
              endDate: result.subscriptionData.endDate,
              amount: result.amount,
              status: "Active",
            },
          ],
          { session }
        );

        result.subscription = subscription._id;
        result.subscriptionData = null;
        await result.save({ session });
      }

      return result;
    });

    // 5. Post-commit: Dispatch in-app notifications to parent and provider safely
    try {
      let centerName = "Childcare Center";
      let providerUserId = null;

      if (updatedPayment.booking) {
        const query = Booking.findById(updatedPayment.booking);
        const booking =
          typeof query?.populate === "function"
            ? await query
                .populate({
                  path: "center",
                  select: "centerName provider",
                  populate: { path: "provider", select: "user" },
                })
                .lean()
            : await query;

        if (booking?.center) {
          centerName = booking.center.centerName || centerName;
          providerUserId =
            booking.center.provider?.user?._id ||
            booking.center.provider?.user ||
            null;
        }
      } else if (updatedPayment.subscription) {
        const query = Subscription.findById(updatedPayment.subscription);
        const subscription =
          typeof query?.populate === "function"
            ? await query
                .populate({
                  path: "center",
                  select: "centerName provider",
                  populate: { path: "provider", select: "user" },
                })
                .lean()
            : await query;

        if (subscription?.center) {
          centerName = subscription.center.centerName || centerName;
          providerUserId =
            subscription.center.provider?.user?._id ||
            subscription.center.provider?.user ||
            null;
        }
      }

      const isSub = Boolean(updatedPayment.subscription);

      // In-app notification for Parent
      await createInAppNotification({
        recipient: updatedPayment.parent,
        type: "payment",
        title: isSub ? "Subscription Payment Confirmed" : "Payment Successful",
        message: isSub
          ? `Your subscription payment of ₹${updatedPayment.amount} for ${centerName} was completed successfully.`
          : `Your payment of ₹${updatedPayment.amount} for booking at ${centerName} was completed successfully.`,
        relatedEntity: {
          id: updatedPayment._id,
          modelName: "Payment",
        },
      });

      // In-app notification for Provider (if found)
      if (providerUserId) {
        await createInAppNotification({
          recipient: providerUserId,
          type: "payment",
          title: isSub ? "Subscription Payment Received" : "Payment Received",
          message: isSub
            ? `Subscription payment of ₹${updatedPayment.amount} received for ${centerName}.`
            : `Payment of ₹${updatedPayment.amount} received for booking at ${centerName}.`,
          relatedEntity: {
            id: updatedPayment._id,
            modelName: "Payment",
          },
        });
      }

      // In-app notification for Platform Administrators
      try {
        if (mongoose.connection?.readyState === 1) {
          const activeAdmins = await User.find({
            role: "admin",
            status: { $ne: "blocked" },
          }).select("_id");

          for (const admin of activeAdmins) {
            await createInAppNotification({
              recipient: admin._id,
              type: "payment",
              title: "Payment Received",
              message: isSub
                ? `Subscription payment of ₹${updatedPayment.amount} received for ${centerName}.`
                : `Payment of ₹${updatedPayment.amount} received for booking at ${centerName}.`,
              relatedEntity: {
                id: updatedPayment._id,
                modelName: "Payment",
              },
            });
          }
        }
      } catch (adminNotifErr) {
        console.warn(
          `[ADMIN_PAYMENT_NOTIF_ERROR] Could not dispatch admin payment notice: ${adminNotifErr.message}`
        );
      }
    } catch (notifErr) {
      console.warn(
        "Payment verified but failed to dispatch post-verification notification:",
        notifErr.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.code === 11000 ||
      (error.message && error.message.includes("E11000"))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification failed: Duplicate payment reference detected",
      });
    }

    if (error.code === "TRANSACTION_UNAVAILABLE" || error.statusCode === 503) {
      return res.status(503).json({
        success: false,
        message: error.message,
      });
    }

    // Never log secret keys or signatures
    console.error("VERIFY PAYMENT ERROR:", error.message || "Unknown error");
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      parent: req.user._id,
    })
      .populate({
        path: "booking",
        select: "childName bookingDate planType status paymentStatus center",
        populate: {
          path: "center",
          select: "centerName city",
        },
      })
      .populate({
        path: "subscription",
        select: "planType startDate endDate amount status center",
        populate: {
          path: "center",
          select: "centerName city",
        },
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      total: payments.length,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: "booking",
        populate: {
          path: "center",
          select: "centerName city monthlyFee",
        },
      })
      .populate({
        path: "subscription",
        populate: {
          path: "center",
          select: "centerName city monthlyFee",
        },
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Development-only simulated payment verification.
 * Strictly blocked in production environments.
 */
const verifyDemoPayment = async (req, res) => {
  try {
    // 1. Strict Environment Guard
    const isDemoAllowed =
      process.env.NODE_ENV !== "production" &&
      (process.env.ALLOW_DEMO_PAYMENT === "true" || !razorpay);

    if (!isDemoAllowed) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Demo payments are disabled in production environments.",
      });
    }

    const { orderId } = req.body;
    if (!orderId || typeof orderId !== "string" || !orderId.startsWith("demo_order_")) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing demo order reference.",
      });
    }

    // 2. Atomic verification within database transaction
    const updatedPayment = await runInTransaction(async (session) => {
      const payment = await Payment.findOne({
        razorpayOrderId: orderId,
      }).session(session);

      if (!payment) {
        const err = new Error("Payment record not found for this demo order");
        err.statusCode = 404;
        throw err;
      }

      // User Ownership Check
      if (payment.parent.toString() !== req.user._id.toString()) {
        const err = new Error("Unauthorized: Payment does not belong to authenticated user");
        err.statusCode = 403;
        throw err;
      }

      // Replay Protection
      if (payment.status === "Success") {
        const err = new Error("Payment has already been verified and processed");
        err.statusCode = 400;
        throw err;
      }

      const demoPaymentId = `demo_pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Atomic Conditional Update
      const result = await Payment.findOneAndUpdate(
        {
          _id: payment._id,
          parent: req.user._id,
          status: "Pending",
        },
        {
          $set: {
            razorpayPaymentId: demoPaymentId,
            paymentMethod: "Demo Simulation",
            status: "Success",
            paidAt: new Date(),
          },
        },
        { new: true, session }
      );

      if (!result) {
        const err = new Error("Payment has already been processed or status is no longer pending");
        err.statusCode = 400;
        throw err;
      }

      // Update Booking Payment Status
      if (result.booking) {
        const booking = await Booking.findById(result.booking).session(session);
        if (booking) {
          booking.paymentStatus = "Paid";
          await booking.save({ session });
        }
      }

      // Activate Subscription if applicable
      if (result.subscriptionData?.center && result.subscriptionData?.planType) {
        const [subscription] = await Subscription.create(
          [
            {
              parent: result.parent,
              center: result.subscriptionData.center,
              tier: result.subscriptionData.tier || null,
              benefits: result.subscriptionData.benefits || [],
              planType: result.subscriptionData.planType,
              startDate: result.subscriptionData.startDate,
              endDate: result.subscriptionData.endDate,
              amount: result.amount,
              status: "Active",
            },
          ],
          { session }
        );
        result.subscription = subscription._id;
        result.subscriptionData = null;
        await result.save({ session });
      }

      return result;
    });

    // 3. Post-commit notifications
    try {
      let centerName = "Childcare Center";
      let providerUserId = null;

      if (updatedPayment.booking) {
        const booking = await Booking.findById(updatedPayment.booking)
          .populate({
            path: "center",
            select: "centerName provider",
            populate: { path: "provider", select: "user" },
          })
          .lean();

        if (booking?.center) {
          centerName = booking.center.centerName || centerName;
          providerUserId = booking.center.provider?.user?._id || booking.center.provider?.user || null;
        }
      } else if (updatedPayment.subscription) {
        const subscription = await Subscription.findById(updatedPayment.subscription)
          .populate({
            path: "center",
            select: "centerName provider",
            populate: { path: "provider", select: "user" },
          })
          .lean();

        if (subscription?.center) {
          centerName = subscription.center.centerName || centerName;
          providerUserId = subscription.center.provider?.user?._id || subscription.center.provider?.user || null;
        }
      }

      const isSub = Boolean(updatedPayment.subscription);

      // Parent notification
      await createInAppNotification({
        recipient: updatedPayment.parent,
        type: "payment",
        title: isSub ? "Subscription Payment Confirmed" : "Payment Successful",
        message: isSub
          ? `Your subscription payment of ₹${updatedPayment.amount} for ${centerName} was completed successfully. [Demo Simulation]`
          : `Your payment of ₹${updatedPayment.amount} for booking at ${centerName} was completed successfully. [Demo Simulation]`,
        relatedEntity: {
          id: updatedPayment._id,
          modelName: "Payment",
        },
      });

      // Provider notification
      if (providerUserId) {
        await createInAppNotification({
          recipient: providerUserId,
          type: "payment",
          title: isSub ? "Subscription Payment Received" : "Payment Received",
          message: isSub
            ? `Subscription payment of ₹${updatedPayment.amount} received for ${centerName}. [Demo Simulation]`
            : `Payment of ₹${updatedPayment.amount} received for booking at ${centerName}. [Demo Simulation]`,
          relatedEntity: {
            id: updatedPayment._id,
            modelName: "Payment",
          },
        });
      }

      // Administrator notification
      if (mongoose.connection?.readyState === 1) {
        const activeAdmins = await User.find({
          role: "admin",
          status: { $ne: "blocked" },
        }).select("_id");

        for (const admin of activeAdmins) {
          await createInAppNotification({
            recipient: admin._id,
            type: "payment",
            title: "Payment Received",
            message: isSub
              ? `Subscription payment of ₹${updatedPayment.amount} received for ${centerName}. [Demo Simulation]`
              : `Payment of ₹${updatedPayment.amount} received for booking at ${centerName}. [Demo Simulation]`,
            relatedEntity: {
              id: updatedPayment._id,
              modelName: "Payment",
            },
          });
        }
      }
    } catch (notifErr) {
      console.warn("[DEMO_PAYMENT_NOTIF_ERROR] Failed to dispatch notifications:", notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Demo payment verified and completed successfully",
      payment: updatedPayment,
      isDemo: true,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process demo payment verification",
    });
  }
};

/**
 * Development-only simulated payment failure.
 */
const failDemoPayment = async (req, res) => {
  try {
    const isDemoAllowed =
      process.env.NODE_ENV !== "production" &&
      (process.env.ALLOW_DEMO_PAYMENT === "true" || !razorpay);

    if (!isDemoAllowed) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Demo payments are disabled in production environments.",
      });
    }

    const { orderId, reason } = req.body;
    if (!orderId || typeof orderId !== "string" || !orderId.startsWith("demo_order_")) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing demo order reference.",
      });
    }

    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (payment.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Payment does not belong to authenticated user",
      });
    }

    if (payment.status === "Success") {
      return res.status(400).json({
        success: false,
        message: "Cannot fail a payment that has already succeeded",
      });
    }

    payment.status = "Failed";
    payment.paymentMethod = "Demo Simulation";
    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment simulation marked as failed. You can retry payment.",
      payment,
      isDemo: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process demo payment failure",
    });
  }
};

export {
  createOrder,
  verifyPayment,
  getMyPayments,
  getPaymentDetails,
  verifyDemoPayment,
  failDemoPayment,
};
