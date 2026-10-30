import assert from "assert";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Subscription from "../models/Subscription.js";
import Notification from "../models/Notification.js";
import {
  verifyPayment,
  verifyRazorpaySignature,
} from "../controllers/paymentController.js";

console.log("=== RUNNING PAYMENT NOTIFICATION AND DUPLICATE PREVENTION TESTS ===");

const secret = "test_razorpay_secret_key_999";
const orderId = "order_NotifTestOrder123";
const paymentId = "pay_NotifTestPay123";

const validSignature = crypto
  .createHmac("sha256", secret)
  .update(`${orderId}|${paymentId}`)
  .digest("hex");

class MockSession {
  constructor() {
    this.state = "INITIAL";
    this.ended = false;
  }
  startTransaction() {
    assert.strictEqual(this.state, "INITIAL");
    this.state = "IN_TRANSACTION";
  }
  async commitTransaction() {
    assert.strictEqual(this.state, "IN_TRANSACTION");
    this.state = "COMMITTED";
  }
  async abortTransaction() {
    assert.strictEqual(this.state, "IN_TRANSACTION");
    this.state = "ABORTED";
  }
  inTransaction() {
    return this.state === "IN_TRANSACTION";
  }
  async endSession() {
    this.ended = true;
  }
}

const createMockRes = () => {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
};

const runTests = async () => {
  process.env.RAZORPAY_KEY_SECRET = secret;

  const originalStartSession = mongoose.startSession;
  const originalPaymentFindOne = Payment.findOne;
  const originalPaymentFindOneAndUpdate = Payment.findOneAndUpdate;
  const originalBookingFindById = Booking.findById;
  const originalSubscriptionFindById = Subscription.findById;
  const originalSubscriptionCreate = Subscription.create;
  const originalNotificationCreate = Notification.create;

  const capturedNotifications = [];

  try {
    mongoose.startSession = async () => new MockSession();

    Notification.create = async (payload) => {
      capturedNotifications.push(payload);
      return {
        _id: new mongoose.Types.ObjectId(),
        ...payload,
        createdAt: new Date(),
      };
    };

    // -----------------------------------------------------------------------
    // Test 1: Successful booking payment dispatches parent & provider notifications
    // -----------------------------------------------------------------------
    {
      capturedNotifications.length = 0;
      const parentUserId = new mongoose.Types.ObjectId().toString();
      const providerUserId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();
      const paymentDocId = new mongoose.Types.ObjectId().toString();

      let findOneCallCount = 0;
      Payment.findOne = () => ({
        session: () => {
          findOneCallCount++;
          if (findOneCallCount === 1) {
            return {
              _id: paymentDocId,
              razorpayOrderId: orderId,
              parent: parentUserId,
              status: "Pending",
              amount: 1200,
              booking: bookingId,
            };
          }
          return null; // No duplicate razorpayPaymentId
        },
      });

      Payment.findOneAndUpdate = async () => ({
        _id: paymentDocId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        parent: parentUserId,
        status: "Success",
        amount: 1200,
        booking: bookingId,
      });

      Booking.findById = (id) => {
        return {
          session: () => ({
            _id: id,
            paymentStatus: "Pending",
            save: async () => {},
          }),
          populate: () => ({
            lean: async () => ({
              _id: id,
              center: {
                centerName: "Little Blossoms Center",
                provider: {
                  user: providerUserId,
                },
              },
            }),
          }),
        };
      };

      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        },
        user: { _id: parentUserId },
      };
      const res = createMockRes();

      await verifyPayment(req, res);

      assert.strictEqual(res.statusCode, 200, "Should verify payment successfully");
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(
        capturedNotifications.length,
        2,
        "Should dispatch exactly 2 notifications (parent and provider)"
      );

      // Verify Parent Notification
      const parentNotif = capturedNotifications.find(
        (n) => n.recipient.toString() === parentUserId
      );
      assert.ok(parentNotif, "Parent notification must be created");
      assert.strictEqual(parentNotif.type, "payment");
      assert.strictEqual(parentNotif.title, "Payment Successful");
      assert.ok(
        parentNotif.message.includes("₹1200"),
        "Parent message must include amount"
      );
      assert.ok(
        parentNotif.message.includes("Little Blossoms Center"),
        "Parent message must include center name"
      );

      // Verify Provider Notification
      const providerNotif = capturedNotifications.find(
        (n) => n.recipient.toString() === providerUserId
      );
      assert.ok(providerNotif, "Provider notification must be created");
      assert.strictEqual(providerNotif.type, "payment");
      assert.strictEqual(providerNotif.title, "Payment Received");
      assert.ok(
        providerNotif.message.includes("₹1200"),
        "Provider message must include amount"
      );
      assert.ok(
        providerNotif.message.includes("Little Blossoms Center"),
        "Provider message must include center name"
      );

      console.log(
        "✔ Passed: Booking payment verification created notifications for parent and provider"
      );
    }

    // -----------------------------------------------------------------------
    // Test 2: Successful subscription payment dispatches parent & provider notifications
    // -----------------------------------------------------------------------
    {
      capturedNotifications.length = 0;
      const parentUserId = new mongoose.Types.ObjectId().toString();
      const providerUserId = new mongoose.Types.ObjectId().toString();
      const subscriptionId = new mongoose.Types.ObjectId().toString();
      const paymentDocId = new mongoose.Types.ObjectId().toString();

      let findOneCallCount = 0;
      Payment.findOne = () => ({
        session: () => {
          findOneCallCount++;
          if (findOneCallCount === 1) {
            return {
              _id: paymentDocId,
              razorpayOrderId: orderId,
              parent: parentUserId,
              status: "Pending",
              amount: 5500,
              subscriptionData: {
                center: new mongoose.Types.ObjectId(),
                planType: "Monthly",
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            };
          }
          return null;
        },
      });

      Subscription.create = async () => [{ _id: subscriptionId }];

      Payment.findOneAndUpdate = async () => ({
        _id: paymentDocId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        parent: parentUserId,
        status: "Success",
        amount: 5500,
        subscription: subscriptionId,
        save: async () => {},
      });

      Subscription.findById = (id) => ({
        populate: () => ({
          lean: async () => ({
            _id: id,
            center: {
              centerName: "Sunrise Daycare Academy",
              provider: {
                user: providerUserId,
              },
            },
          }),
        }),
      });

      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        },
        user: { _id: parentUserId },
      };
      const res = createMockRes();

      await verifyPayment(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(capturedNotifications.length, 2);

      const parentNotif = capturedNotifications.find(
        (n) => n.recipient.toString() === parentUserId
      );
      assert.strictEqual(parentNotif.title, "Subscription Payment Confirmed");
      assert.ok(parentNotif.message.includes("₹5500"));

      const providerNotif = capturedNotifications.find(
        (n) => n.recipient.toString() === providerUserId
      );
      assert.strictEqual(providerNotif.title, "Subscription Payment Received");
      assert.ok(providerNotif.message.includes("Sunrise Daycare Academy"));

      console.log(
        "✔ Passed: Subscription payment verification created notifications for parent and provider"
      );
    }

    // -----------------------------------------------------------------------
    // Test 3: Replay / Retry verification (Payment already Success) sends NO duplicate notifications
    // -----------------------------------------------------------------------
    {
      capturedNotifications.length = 0;
      const parentUserId = new mongoose.Types.ObjectId().toString();
      const paymentDocId = new mongoose.Types.ObjectId().toString();

      Payment.findOne = () => ({
        session: () => ({
          _id: paymentDocId,
          razorpayOrderId: orderId,
          parent: parentUserId,
          status: "Success", // Already verified!
          amount: 1000,
        }),
      });

      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        },
        user: { _id: parentUserId },
      };
      const res = createMockRes();

      await verifyPayment(req, res);

      assert.strictEqual(
        res.statusCode,
        400,
        "Replay verification must be rejected with 400"
      );
      assert.strictEqual(
        capturedNotifications.length,
        0,
        "Zero notifications must be dispatched on replay / retry"
      );
      console.log(
        "✔ Passed: Replay verification rejected with 400 and dispatched zero notifications"
      );
    }

    // -----------------------------------------------------------------------
    // Test 4: Invalid signature sends NO notifications
    // -----------------------------------------------------------------------
    {
      capturedNotifications.length = 0;
      const parentUserId = new mongoose.Types.ObjectId().toString();

      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: "tampered_bad_signature_value",
        },
        user: { _id: parentUserId },
      };
      const res = createMockRes();

      await verifyPayment(req, res);

      assert.strictEqual(
        res.statusCode,
        400,
        "Invalid signature must be rejected with 400"
      );
      assert.strictEqual(
        capturedNotifications.length,
        0,
        "Zero notifications must be dispatched on invalid signature"
      );
      console.log(
        "✔ Passed: Invalid signature rejected with 400 and dispatched zero notifications"
      );
    }

    // -----------------------------------------------------------------------
    // Test 5: Transaction failure or abort sends NO notifications
    // -----------------------------------------------------------------------
    {
      capturedNotifications.length = 0;
      const parentUserId = new mongoose.Types.ObjectId().toString();
      const paymentDocId = new mongoose.Types.ObjectId().toString();

      Payment.findOne = () => ({
        session: () => ({
          _id: paymentDocId,
          razorpayOrderId: orderId,
          parent: parentUserId,
          status: "Pending",
          amount: 1000,
        }),
      });

      // Simulate OCC collision / concurrent update
      Payment.findOneAndUpdate = async () => null;

      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        },
        user: { _id: parentUserId },
      };
      const res = createMockRes();

      await verifyPayment(req, res);

      assert.strictEqual(
        res.statusCode,
        400,
        "Concurrent update collision must fail"
      );
      assert.strictEqual(
        capturedNotifications.length,
        0,
        "Zero notifications must be dispatched on transaction abort"
      );
      console.log(
        "✔ Passed: Transaction failure aborted and dispatched zero notifications"
      );
    }

    console.log("\nALL PAYMENT NOTIFICATION TESTS PASSED SUCCESSFULLY! ✔✔✔");
  } finally {
    mongoose.startSession = originalStartSession;
    Payment.findOne = originalPaymentFindOne;
    Payment.findOneAndUpdate = originalPaymentFindOneAndUpdate;
    Booking.findById = originalBookingFindById;
    Subscription.findById = originalSubscriptionFindById;
    Subscription.create = originalSubscriptionCreate;
    Notification.create = originalNotificationCreate;
  }
};

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
