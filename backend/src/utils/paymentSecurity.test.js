import assert from "assert";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Subscription from "../models/Subscription.js";
import {
  verifyRazorpaySignature,
  verifyPayment,
} from "../controllers/paymentController.js";

console.log("=== RUNNING PAYMENT SECURITY AND IDEMPOTENCY TESTS ===");

const secret = "test_razorpay_secret_key_12345";
const orderId = "order_OId987654321";
const paymentId = "pay_PId123456789";

// Calculate expected valid HMAC SHA256 signature
const expectedSignature = crypto
  .createHmac("sha256", secret)
  .update(`${orderId}|${paymentId}`)
  .digest("hex");

// -------------------------------------------------------------------------
// 1. Signature Verification: Valid signature
// -------------------------------------------------------------------------
{
  const isValid = verifyRazorpaySignature(
    orderId,
    paymentId,
    expectedSignature,
    secret,
  );
  assert.strictEqual(
    isValid,
    true,
    "Valid signature matching secret and payload should return true",
  );
  console.log("✔ Passed: Valid signature verification");
}

// -------------------------------------------------------------------------
// 2. Signature Verification: Invalid signature (same length, tampered chars)
// -------------------------------------------------------------------------
{
  const tamperedChar = expectedSignature[0] === "a" ? "b" : "a";
  const tamperedSignature = tamperedChar + expectedSignature.slice(1);
  const isValid = verifyRazorpaySignature(
    orderId,
    paymentId,
    tamperedSignature,
    secret,
  );
  assert.strictEqual(
    isValid,
    false,
    "Tampered signature with equal length must return false",
  );
  console.log(
    "✔ Passed: Invalid signature with matching buffer length returns false",
  );
}

// -------------------------------------------------------------------------
// 3. Signature Verification: Unequal buffer lengths (must NOT throw RangeError)
// -------------------------------------------------------------------------
{
  // Shorter signature
  const shorterSignature = expectedSignature.slice(0, 10);
  assert.doesNotThrow(() => {
    const isValid = verifyRazorpaySignature(
      orderId,
      paymentId,
      shorterSignature,
      secret,
    );
    assert.strictEqual(
      isValid,
      false,
      "Shorter signature must safely return false without throwing RangeError",
    );
  }, "Shorter signature should not throw");

  // Longer signature
  const longerSignature = expectedSignature + "001122";
  assert.doesNotThrow(() => {
    const isValid = verifyRazorpaySignature(
      orderId,
      paymentId,
      longerSignature,
      secret,
    );
    assert.strictEqual(
      isValid,
      false,
      "Longer signature must safely return false without throwing RangeError",
    );
  }, "Longer signature should not throw");

  // Empty signature
  assert.doesNotThrow(() => {
    const isValid = verifyRazorpaySignature(orderId, paymentId, "", secret);
    assert.strictEqual(isValid, false, "Empty signature must return false");
  }, "Empty signature should not throw");

  console.log(
    "✔ Passed: Unequal buffer lengths handled safely without RangeError",
  );
}

// -------------------------------------------------------------------------
// 4. Signature Verification: Malformed and Non-String Inputs
// -------------------------------------------------------------------------
{
  const testCases = [
    [orderId, paymentId, null, secret],
    [orderId, paymentId, undefined, secret],
    [orderId, paymentId, 12345678, secret],
    [orderId, paymentId, {}, secret],
    [orderId, paymentId, ["array"], secret],
    [null, paymentId, expectedSignature, secret],
    [orderId, null, expectedSignature, secret],
    [orderId, paymentId, expectedSignature, null],
    ["", paymentId, expectedSignature, secret],
  ];

  for (const [o, p, s, sec] of testCases) {
    assert.doesNotThrow(() => {
      const res = verifyRazorpaySignature(o, p, s, sec);
      assert.strictEqual(
        res,
        false,
        "Malformed input must return false safely",
      );
    });
  }
  console.log("✔ Passed: Malformed and non-string inputs safely rejected");
}

// -------------------------------------------------------------------------
// 5. Database Schema Uniqueness: Payment Model Indexes
// -------------------------------------------------------------------------
{
  const indexes = Payment.schema.indexes();

  // Check unique razorpayOrderId index with partialFilterExpression
  const orderIdIndex = indexes.find(
    ([fields]) => fields.razorpayOrderId === 1,
  );
  assert.ok(
    orderIdIndex,
    "Payment schema must define an index on razorpayOrderId",
  );
  assert.strictEqual(
    orderIdIndex[1].unique,
    true,
    "razorpayOrderId index must be unique",
  );
  assert.ok(
    orderIdIndex[1].partialFilterExpression,
    "razorpayOrderId index must have a partialFilterExpression for legacy document compatibility",
  );

  // Check unique partial razorpayPaymentId index
  const paymentIdIndex = indexes.find(
    ([fields]) => fields.razorpayPaymentId === 1,
  );
  assert.ok(
    paymentIdIndex,
    "Payment schema must define an index on razorpayPaymentId",
  );
  assert.strictEqual(
    paymentIdIndex[1].unique,
    true,
    "razorpayPaymentId index must be unique",
  );
  assert.ok(
    paymentIdIndex[1].partialFilterExpression,
    "razorpayPaymentId index must have a partialFilterExpression",
  );
  assert.strictEqual(
    paymentIdIndex[1].partialFilterExpression.status,
    "Success",
    "partialFilterExpression must target status: Success",
  );

  console.log(
    "✔ Passed: Payment schema defines unique orderId and partial unique paymentId indexes",
  );
}

// -------------------------------------------------------------------------
// Mock Session Helper simulating MongoDB Atlas ClientSession
// -------------------------------------------------------------------------
class MockSession {
  constructor() {
    this.state = "INITIAL"; // INITIAL -> IN_TRANSACTION -> COMMITTED / ABORTED
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

// -------------------------------------------------------------------------
// 6. Controller: Ownership Mismatch, Duplicate Keys & State Integrity Guards
// -------------------------------------------------------------------------
{
  process.env.RAZORPAY_KEY_SECRET = secret;

  const originalStartSession = mongoose.startSession;
  const originalFindOne = Payment.findOne;
  const originalFindOneAndUpdate = Payment.findOneAndUpdate;
  const originalBookingFindById = Booking.findById;
  const originalSubscriptionCreate = Subscription.create;

  try {
    let activeSession = null;
    mongoose.startSession = async () => {
      activeSession = new MockSession();
      return activeSession;
    };

    // 6A. Ownership check: User B attempts to verify User A's payment
    Payment.findOne = () => ({
      session: () => ({
        _id: "payment_123",
        parent: "user_A_id",
        status: "Pending",
        amount: 500,
        booking: "booking_abc",
      }),
    });

    const reqUserB = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: expectedSignature,
      },
      user: {
        _id: "user_B_id", // Different user!
      },
    };
    const resUserB = createMockRes();

    await verifyPayment(reqUserB, resUserB);
    assert.strictEqual(
      resUserB.statusCode,
      403,
      "Ownership mismatch must return 403 Forbidden",
    );
    assert.strictEqual(
      resUserB.body.success,
      false,
      "Unauthorized verification must fail",
    );
    assert.strictEqual(
      activeSession.state,
      "ABORTED",
      "Transaction must abort on ownership mismatch",
    );
    console.log("✔ Passed: Ownership mismatch correctly rejected with 403 & aborted");

    // 6B. Replay attack: payment already Success
    Payment.findOne = () => ({
      session: () => ({
        _id: "payment_123",
        parent: "user_A_id",
        status: "Success",
        amount: 500,
      }),
    });

    const reqReplay = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: expectedSignature,
      },
      user: {
        _id: "user_A_id",
      },
    };
    const resReplay = createMockRes();

    await verifyPayment(reqReplay, resReplay);
    assert.strictEqual(
      resReplay.statusCode,
      400,
      "Replay on already-successful payment must return 400",
    );
    assert.strictEqual(
      activeSession.state,
      "ABORTED",
      "Transaction must abort on replay attempt",
    );
    console.log("✔ Passed: Replay verification correctly rejected with 400 & aborted");

    // 6C. Duplicate payment ID on another transaction
    let findOneCallCount = 0;
    Payment.findOne = () => ({
      session: () => {
        findOneCallCount++;
        if (findOneCallCount === 1) {
          return {
            _id: "payment_123",
            parent: "user_A_id",
            status: "Pending",
            amount: 500,
          };
        }
        return {
          _id: "payment_DIFFERENT_456",
          parent: "user_C_id",
          status: "Success",
          razorpayPaymentId: paymentId,
        };
      },
    });

    const reqDupId = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: expectedSignature,
      },
      user: {
        _id: "user_A_id",
      },
    };
    const resDupId = createMockRes();

    await verifyPayment(reqDupId, resDupId);
    assert.strictEqual(
      resDupId.statusCode,
      400,
      "Reusing payment ID from another successful transaction must return 400",
    );
    assert.ok(
      resDupId.body.message.includes("already been recorded"),
      "Message must note payment ID already recorded",
    );
    assert.strictEqual(
      activeSession.state,
      "ABORTED",
      "Transaction must abort on duplicate payment ID check",
    );
    console.log(
      "✔ Passed: Duplicate payment ID reuse across transactions rejected with 400 & aborted",
    );

    // 6D. Concurrent duplicate key collision (E11000)
    Payment.findOne = () => ({
      session: () => ({
        _id: "payment_123",
        parent: "user_A_id",
        status: "Pending",
        amount: 500,
      }),
    });

    Payment.findOneAndUpdate = async () => {
      const err = new Error(
        "E11000 duplicate key error collection: test.payments index: razorpayPaymentId_1 dup key: { razorpayPaymentId: 'pay_PId123456789' }",
      );
      err.code = 11000;
      throw err;
    };

    const reqCollision = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: expectedSignature,
      },
      user: {
        _id: "user_A_id",
      },
    };
    const resCollision = createMockRes();

    await verifyPayment(reqCollision, resCollision);
    assert.strictEqual(
      resCollision.statusCode,
      400,
      "Duplicate key error (code 11000) must return 400",
    );
    assert.strictEqual(
      resCollision.body.success,
      false,
      "Duplicate key collision must return success: false",
    );
    assert.strictEqual(
      activeSession.state,
      "ABORTED",
      "Transaction must abort on duplicate key collision",
    );
    console.log(
      "✔ Passed: E11000 duplicate key collision caught safely and returned as 400",
    );

    // -------------------------------------------------------------------------
    // 7. Atomic Transaction: Payment succeeds and booking becomes Paid
    // -------------------------------------------------------------------------
    let bookingSaved = false;
    let paymentDoc = {
      _id: "payment_booking_1",
      parent: "user_A_id",
      status: "Pending",
      booking: "booking_valid_123",
    };

    Payment.findOne = () => ({
      session: () => paymentDoc,
    });

    Payment.findOneAndUpdate = async () => {
      paymentDoc.status = "Success";
      paymentDoc.razorpayPaymentId = paymentId;
      return paymentDoc;
    };

    Booking.findById = () => ({
      session: async () => ({
        _id: "booking_valid_123",
        paymentStatus: "Pending",
        save: async () => {
          bookingSaved = true;
        },
      }),
    });

    const reqBookingSuccess = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: expectedSignature,
      },
      user: { _id: "user_A_id" },
    };
    const resBookingSuccess = createMockRes();

    await verifyPayment(reqBookingSuccess, resBookingSuccess);
    assert.strictEqual(resBookingSuccess.statusCode, 200);
    assert.strictEqual(resBookingSuccess.body.success, true);
    assert.strictEqual(bookingSaved, true, "Booking must be saved as Paid");
    assert.strictEqual(
      activeSession.state,
      "COMMITTED",
      "Transaction must commit when both payment and booking succeed",
    );
    console.log("✔ Passed: Payment succeeds and booking becomes Paid in committed transaction");

    // -------------------------------------------------------------------------
    // 8. Atomic Transaction: Payment succeeds and subscription is created
    // -------------------------------------------------------------------------
    let subscriptionCreated = false;
    let paymentSubDoc = {
      _id: "payment_sub_1",
      parent: "user_A_id",
      status: "Pending",
      subscriptionData: {
        center: "center_123",
        planType: "Monthly",
        startDate: new Date(),
        endDate: new Date(),
      },
      amount: 1500,
      save: async () => {},
    };

    Payment.findOne = () => ({
      session: () => paymentSubDoc,
    });

    Payment.findOneAndUpdate = async () => {
      paymentSubDoc.status = "Success";
      paymentSubDoc.razorpayPaymentId = paymentId;
      return paymentSubDoc;
    };

    Subscription.create = async ([subData]) => {
      subscriptionCreated = true;
      return [{ _id: "sub_new_789", ...subData }];
    };

    const reqSubSuccess = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: expectedSignature,
      },
      user: { _id: "user_A_id" },
    };
    const resSubSuccess = createMockRes();

    await verifyPayment(reqSubSuccess, resSubSuccess);
    assert.strictEqual(resSubSuccess.statusCode, 200);
    assert.strictEqual(resSubSuccess.body.success, true);
    assert.strictEqual(subscriptionCreated, true, "Subscription must be created");
    assert.strictEqual(
      activeSession.state,
      "COMMITTED",
      "Transaction must commit when payment and subscription succeed",
    );
    console.log("✔ Passed: Payment succeeds and subscription is created in committed transaction");

    // -------------------------------------------------------------------------
    // 9. Atomic Rollback: Booking update failure rolls back Payment Success
    // -------------------------------------------------------------------------
    let paymentRollbackDoc = {
      _id: "payment_booking_2",
      parent: "user_A_id",
      status: "Pending",
      booking: "booking_fail_123",
    };

    Payment.findOne = () => ({
      session: () => paymentRollbackDoc,
    });

    Payment.findOneAndUpdate = async () => {
      paymentRollbackDoc.status = "Success";
      return paymentRollbackDoc;
    };

    Booking.findById = () => ({
      session: async () => ({
        _id: "booking_fail_123",
        save: async () => {
          throw new Error("Disk write error during booking update");
        },
      }),
    });

    const reqBookingFail = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: expectedSignature,
      },
      user: { _id: "user_A_id" },
    };
    const resBookingFail = createMockRes();

    await verifyPayment(reqBookingFail, resBookingFail);
    assert.strictEqual(resBookingFail.statusCode, 500);
    assert.strictEqual(
      activeSession.state,
      "ABORTED",
      "Transaction must abort when booking update fails",
    );
    console.log("✔ Passed: Booking update failure rolls back transaction cleanly");

    // -------------------------------------------------------------------------
    // 10. Atomic Rollback: Subscription creation failure rolls back Payment
    // -------------------------------------------------------------------------
    let paymentSubRollbackDoc = {
      _id: "payment_sub_2",
      parent: "user_A_id",
      status: "Pending",
      subscriptionData: {
        center: "center_123",
        planType: "Monthly",
      },
      amount: 1500,
      save: async () => {},
    };

    Payment.findOne = () => ({
      session: () => paymentSubRollbackDoc,
    });

    Payment.findOneAndUpdate = async () => {
      paymentSubRollbackDoc.status = "Success";
      return paymentSubRollbackDoc;
    };

    Subscription.create = async () => {
      throw new Error("Subscription schema validation failed");
    };

    const reqSubFail = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: expectedSignature,
      },
      user: { _id: "user_A_id" },
    };
    const resSubFail = createMockRes();

    await verifyPayment(reqSubFail, resSubFail);
    assert.strictEqual(resSubFail.statusCode, 500);
    assert.strictEqual(
      activeSession.state,
      "ABORTED",
      "Transaction must abort when subscription creation fails",
    );
    console.log("✔ Passed: Subscription creation failure rolls back transaction cleanly");

    // -------------------------------------------------------------------------
    // 11. Unsupported Transactions: Fail Closed with 503
    // -------------------------------------------------------------------------
    mongoose.startSession = async () => {
      throw new Error("Transaction numbers are only allowed on a replica set member or mongos");
    };

    let paymentExecuted = false;
    Payment.findOne = () => {
      paymentExecuted = true;
      return null;
    };

    const reqNoTx = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: expectedSignature,
      },
      user: { _id: "user_A_id" },
    };
    const resNoTx = createMockRes();

    await verifyPayment(reqNoTx, resNoTx);
    assert.strictEqual(
      resNoTx.statusCode,
      503,
      "Unsupported transactions must return HTTP 503",
    );
    assert.strictEqual(
      paymentExecuted,
      false,
      "Payment operations must NOT execute when transactions are unsupported",
    );
    console.log("✔ Passed: Unsupported transactions fail closed with 503 without executing operations");
  } finally {
    // Restore mocks
    mongoose.startSession = originalStartSession;
    Payment.findOne = originalFindOne;
    Payment.findOneAndUpdate = originalFindOneAndUpdate;
    Booking.findById = originalBookingFindById;
    Subscription.create = originalSubscriptionCreate;
  }
}

console.log("=== ALL PAYMENT SECURITY AND IDEMPOTENCY TESTS PASSED ===");
