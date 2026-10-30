import assert from "assert";
import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Center from "../models/Center.js";
import Provider from "../models/Provider.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import {
  createOrder,
  verifyDemoPayment,
  failDemoPayment,
} from "../controllers/paymentController.js";
import { getAllPayments } from "../controllers/adminController.js";

async function runDemoPaymentTests() {
  console.log("=== RUNNING DEMO PAYMENT TEST SUITE ===");
  await mongoose.connect(process.env.MONGODB_URI);

  const parent = await User.findOne({ role: "parent" });
  const otherParent = await User.findOne({ role: "parent", _id: { $ne: parent._id } });
  const center = await Center.findOne({ status: "active" }).populate({
    path: "provider",
    populate: { path: "user" },
  });
  const admin = await User.findOne({ role: "admin", status: { $ne: "blocked" } });

  assert.ok(parent, "Parent user must exist");
  assert.ok(center, "Active center must exist");
  assert.ok(center.provider?.user, "Provider user must exist");
  assert.ok(admin, "Admin user must exist");

  const testBooking = await Booking.create({
    parent: parent._id,
    center: center._id,
    childName: "DemoTestChild",
    childAge: 4,
    bookingDate: new Date("2026-12-28"),
    startTime: "10:00",
    endTime: "13:00",
    planType: "Hourly",
    status: "Approved",
    amount: 350,
  });

  try {
    // -------------------------------------------------------------
    // Test 1: Demo Order Creation with server-calculated amount
    // -------------------------------------------------------------
    process.env.ALLOW_DEMO_PAYMENT = "true";
    delete process.env.NODE_ENV;

    let orderData = null;
    let orderStatus = null;
    const reqCreate = {
      user: { _id: parent._id, role: "parent" },
      body: {
        bookingId: testBooking._id.toString(),
        amount: 1, // Tampered client amount! Server must ignore this!
      },
    };
    const resCreate = {
      status: (code) => {
        orderStatus = code;
        return {
          json: (data) => {
            orderData = data;
          },
        };
      },
    };

    await createOrder(reqCreate, resCreate);
    assert.strictEqual(orderStatus, 201, "Demo order creation must return 201");
    assert.ok(orderData.isDemo, "Order must be flagged as demo");
    assert.ok(orderData.order.id.startsWith("demo_order_"), "Order ID must start with demo_order_");
    assert.strictEqual(orderData.payment.amount, 350, "Server must enforce authoritative booking amount (350), not tampered amount (1)");
    assert.strictEqual(orderData.payment.paymentMethod, "Demo Simulation", "Payment method must be Demo Simulation");
    console.log("✔ Passed: Demo order created with authoritative server amount");

    const demoOrderId = orderData.order.id;

    // -------------------------------------------------------------
    // Test 2: Ownership Check - unauthorized parent cannot verify
    // -------------------------------------------------------------
    if (otherParent) {
      let unauthStatus = null;
      let unauthData = null;
      const reqUnauth = {
        user: { _id: otherParent._id, role: "parent" },
        body: { orderId: demoOrderId },
      };
      const resUnauth = {
        status: (code) => {
          unauthStatus = code;
          return { json: (d) => { unauthData = d; } };
        },
      };
      await verifyDemoPayment(reqUnauth, resUnauth);
      assert.strictEqual(unauthStatus, 403, "Other parent must be rejected with 403");
      console.log("✔ Passed: Ownership check rejected unauthorized parent with 403");
    }

    // -------------------------------------------------------------
    // Test 3: Demo Payment Failure Simulation & Retryability
    // -------------------------------------------------------------
    let failStatus = null;
    let failData = null;
    const reqFail = {
      user: { _id: parent._id, role: "parent" },
      body: { orderId: demoOrderId, reason: "Simulation Declined" },
    };
    const resFail = {
      status: (code) => {
        failStatus = code;
        return { json: (d) => { failData = d; } };
      },
    };
    await failDemoPayment(reqFail, resFail);
    assert.strictEqual(failStatus, 200, "Failure simulation must return 200");
    assert.strictEqual(failData.payment.status, "Failed", "Payment status must be Failed");

    // Booking must remain unpaid!
    const bookingAfterFail = await Booking.findById(testBooking._id);
    assert.strictEqual(bookingAfterFail.paymentStatus, "Pending", "Booking paymentStatus must remain Pending after failure");
    console.log("✔ Passed: Demo payment failure marks payment Failed while keeping booking unpaid");

    // -------------------------------------------------------------
    // Test 4: Demo Payment Success Verification
    // -------------------------------------------------------------
    // Reset payment to Pending to simulate retry
    await Payment.updateOne({ razorpayOrderId: demoOrderId }, { $set: { status: "Pending" } });

    let verifyStatus = null;
    let verifyData = null;
    const reqVerify = {
      user: { _id: parent._id, role: "parent" },
      body: { orderId: demoOrderId },
    };
    const resVerify = {
      status: (code) => {
        verifyStatus = code;
        return { json: (d) => { verifyData = d; } };
      },
    };
    await verifyDemoPayment(reqVerify, resVerify);
    assert.strictEqual(verifyStatus, 200, "Demo verify must return 200");
    assert.strictEqual(verifyData.payment.status, "Success", "Payment status must become Success");
    assert.ok(verifyData.payment.razorpayPaymentId.startsWith("demo_pay_"), "Payment ID must start with demo_pay_");

    // Booking status must be Paid!
    const bookingAfterSuccess = await Booking.findById(testBooking._id);
    assert.strictEqual(bookingAfterSuccess.paymentStatus, "Paid", "Booking paymentStatus must become Paid");
    console.log("✔ Passed: Demo payment success transitioned booking to Paid");

    // -------------------------------------------------------------
    // Test 5: Replay / Duplicate Payment Rejection
    // -------------------------------------------------------------
    let replayStatus = null;
    const resReplay = {
      status: (code) => {
        replayStatus = code;
        return { json: () => {} };
      },
    };
    await verifyDemoPayment(reqVerify, resReplay);
    assert.strictEqual(replayStatus, 400, "Replay verification must return 400");
    console.log("✔ Passed: Replay verification rejected with 400");

    // -------------------------------------------------------------
    // Test 6: Multi-Role Notifications Dispatched
    // -------------------------------------------------------------
    const notifs = await Notification.find({ "relatedEntity.id": verifyData.payment._id });
    const hasParentNotif = notifs.some(n => n.recipient.toString() === parent._id.toString() && n.title === "Payment Successful");
    const hasProviderNotif = notifs.some(n => n.recipient.toString() === center.provider.user._id.toString() && n.title === "Payment Received");
    const hasAdminNotif = notifs.some(n => n.recipient.toString() === admin._id.toString() && n.title === "Payment Received");

    assert.ok(hasParentNotif, "Parent must receive Payment Successful notification");
    assert.ok(hasProviderNotif, "Provider must receive Payment Received notification");
    assert.ok(hasAdminNotif, "Admin must receive Payment Received notification");
    console.log("✔ Passed: Multi-role notifications dispatched to Parent, Provider, and Admin");

    // -------------------------------------------------------------
    // Test 7: Admin Payments View displays Demo Simulation
    // -------------------------------------------------------------
    let adminPayments = null;
    const resAdmin = {
      status: () => ({
        json: (d) => { adminPayments = d.payments; },
      }),
    };
    await getAllPayments({}, resAdmin);
    const adminRecord = adminPayments.find(p => p.razorpayOrderId === demoOrderId);
    assert.ok(adminRecord, "Demo payment must appear in Admin Payments");
    assert.strictEqual(adminRecord.paymentMethod, "Demo Simulation", "Admin paymentMethod must be Demo Simulation");
    assert.strictEqual(adminRecord.booking.center.centerName, center.centerName, "Center name must be deep-populated");
    assert.strictEqual(adminRecord.booking.childName, "DemoTestChild", "Child name must be populated");
    console.log("✔ Passed: Admin Payments dashboard displays Demo Simulation with accurate details");

    // -------------------------------------------------------------
    // Test 8: Production Rejection Guard
    // -------------------------------------------------------------
    process.env.NODE_ENV = "production";
    let prodStatus = null;
    const resProd = {
      status: (code) => {
        prodStatus = code;
        return { json: () => {} };
      },
    };
    await verifyDemoPayment(reqVerify, resProd);
    assert.strictEqual(prodStatus, 403, "Production environment must strictly reject demo verification with 403");

    process.env.NODE_ENV = "development";
    process.env.ALLOW_DEMO_PAYMENT = "false";
    let disabledStatus = null;
    const resDisabled = {
      status: (code) => {
        disabledStatus = code;
        return { json: () => {} };
      },
    };
    await verifyDemoPayment(reqVerify, resDisabled);
    assert.strictEqual(disabledStatus, 403, "ALLOW_DEMO_PAYMENT=false must strictly reject demo verification with 403");
    console.log("✔ Passed: Production and disabled-flag security gates strictly reject demo payments (403)");

  } finally {
    // Cleanup
    process.env.ALLOW_DEMO_PAYMENT = "true";
    delete process.env.NODE_ENV;
    const payment = await Payment.findOne({ booking: testBooking._id });
    if (payment) {
      await Notification.deleteMany({ "relatedEntity.id": payment._id });
      await Payment.deleteOne({ _id: payment._id });
    }
    await Booking.deleteOne({ _id: testBooking._id });
    await mongoose.disconnect();
    console.log("Cleanup: deleted test booking, payment, and notifications.");
  }

  console.log("=== ALL DEMO PAYMENT TESTS PASSED SUCCESSFULLY! ===");
}

runDemoPaymentTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
