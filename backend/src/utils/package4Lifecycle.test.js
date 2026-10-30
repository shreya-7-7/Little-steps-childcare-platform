import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
dotenv.config({ path: ".env" });
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Center from "../models/Center.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import CenterCapacity from "../models/CenterCapacity.js";
import {
  createBooking,
  approveBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  calculateBookingEndDateTime,
} from "../controllers/bookingController.js";
import { createReview } from "../controllers/reviewController.js";

// Exact implementation from frontend/src/services/bookingService.js
const isBookingServiceEnded = (booking) => {
  if (!booking?.bookingDate) return false;
  try {
    const [endH, endM] = (booking.endTime || "18:00").split(":").map(Number);
    const [startH, startM] = (booking.startTime || "09:00").split(":").map(Number);
    const isOvernight = (endH * 60 + endM) < (startH * 60 + startM);

    const baseDate = new Date(booking.bookingDate);
    const year = baseDate.getUTCFullYear();
    const month = baseDate.getUTCMonth();
    const day = baseDate.getUTCDate();

    let targetYear = year;
    let targetMonth = month;
    let targetDay = day;

    if (booking.planType === "Monthly") {
      targetMonth += 1;
      if (isOvernight) targetDay += 1;
    } else if (isOvernight) {
      targetDay += 1;
    }

    const endDateTime = new Date(Date.UTC(targetYear, targetMonth, targetDay, endH, endM, 0, 0));
    return Date.now() >= endDateTime.getTime();
  } catch (err) {
    return false;
  }
};

const createMockRes = () => ({
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
});

const run = async () => {
  console.log("=== RUNNING PACKAGE 4 LIFECYCLE & CAPACITY INTEGRATION TESTS ===");
  await connectDB();
  console.log("Connected to MongoDB.");

  // 1. Verify isBookingServiceEnded helper logic
  console.log("\n--- Testing isBookingServiceEnded helper logic ---");
  const pastBooking = {
    bookingDate: new Date(Date.now() - 86400000).toISOString(),
    startTime: "09:00",
    endTime: "10:00",
    planType: "Hourly",
  };
  assert.strictEqual(isBookingServiceEnded(pastBooking), true, "Past booking must be identified as ended");

  const futureBooking = {
    bookingDate: new Date(Date.now() + 86400000).toISOString(),
    startTime: "09:00",
    endTime: "18:00",
    planType: "Hourly",
  };
  assert.strictEqual(isBookingServiceEnded(futureBooking), false, "Future booking must NOT be identified as ended");
  console.log("✓ isBookingServiceEnded correctly differentiates past and future scheduled service times.");

  // Fetch test provider and center
  const center = await Center.findOne({ status: "active" });
  if (!center) {
    console.log("No active center found in database, exiting test.");
    process.exit(1);
  }
  let providerProfile = await Provider.findById(center.provider);
  if (!providerProfile) {
    console.log("No provider profile found for center, exiting test.");
    process.exit(1);
  }
  let providerUser = await User.findById(providerProfile.user);
  if (!providerUser) {
    console.log("No provider user found for provider profile, exiting test.");
    process.exit(1);
  }

  // Find or create test parent user
  let parentUser = await User.findOne({ role: "parent" });
  if (!parentUser) {
    parentUser = await User.create({
      name: "Package 4 Test Parent",
      email: `pkg4_parent_${Date.now()}@test.com`,
      password: "HashedPassword123",
      role: "parent",
      isEmailVerified: true,
    });
  }

  console.log(`Using Center: ${center.centerName} (${center._id})`);
  console.log(`Using Parent: ${parentUser.email}`);
  console.log(`Using Provider: ${providerUser?.email || "mocked"}`);

  // Test 1: Create a Pending booking
  console.log("\n--- Test 1: Create a Pending Booking ---");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const dateStr = tomorrow.toISOString().split("T")[0];

  const reqCreate = {
    user: parentUser,
    body: {
      center: center._id.toString(),
      childName: "Lifecycle Test Baby",
      childAge: 3,
      bookingDate: dateStr,
      startTime: "10:00",
      endTime: "11:00",
      planType: "Hourly",
    },
  };
  const resCreate = createMockRes();
  await createBooking(reqCreate, resCreate);
  assert.strictEqual(resCreate.statusCode, 201, "Booking creation must succeed with 201");
  const booking1 = resCreate.body.booking;
  assert.strictEqual(booking1.status, "Pending", "Initial status must be Pending");
  console.log(`✓ Booking created with ID: ${booking1._id}, status: ${booking1.status}`);

  // Test 2: Attempt to complete a Pending booking (Must fail 400)
  console.log("\n--- Test 2: Cannot complete Pending booking ---");
  const reqCompletePending = {
    user: providerUser,
    params: { id: booking1._id.toString() },
  };
  const resCompletePending = createMockRes();
  await completeBooking(reqCompletePending, resCompletePending);
  assert.strictEqual(resCompletePending.statusCode, 400, "Cannot complete pending booking");
  console.log("✓ Expected rejection: Cannot complete a pending booking. Must be approved first.");

  // Test 3: Attempt to review a Pending booking (Must fail 400)
  console.log("\n--- Test 3: Cannot review Pending booking ---");
  const reqReviewPending = {
    user: parentUser,
    body: {
      bookingId: booking1._id.toString(),
      rating: 5,
      comment: "Premature review should be blocked",
    },
  };
  const resReviewPending = createMockRes();
  await createReview(reqReviewPending, resReviewPending);
  assert.strictEqual(resReviewPending.statusCode, 400, "Reviewing pending booking must fail");
  console.log("✓ Expected rejection: Reviews can only be submitted for completed bookings.");

  // Test 4: Parent cancels Pending booking
  console.log("\n--- Test 4: Parent cancels Pending booking ---");
  const reqCancel = {
    user: parentUser,
    params: { id: booking1._id.toString() },
  };
  const resCancel = createMockRes();
  await cancelBooking(reqCancel, resCancel);
  assert.strictEqual(resCancel.statusCode, 200, "Cancelling pending booking must succeed");
  const cancelledBooking = await Booking.findById(booking1._id);
  assert.strictEqual(cancelledBooking.status, "Cancelled", "Booking status must be Cancelled");
  console.log("✓ Pending booking cancelled successfully.");

  // Test 5: Attempt to complete a Cancelled booking (Must fail 400)
  console.log("\n--- Test 5: Cannot complete Cancelled booking ---");
  const resCompleteCancelled = createMockRes();
  await completeBooking(reqCompletePending, resCompleteCancelled);
  assert.strictEqual(resCompleteCancelled.statusCode, 400, "Cannot complete cancelled booking");
  console.log("✓ Expected rejection: Cannot complete a cancelled booking.");

  // Test 6: Create Booking 2 for full Approval -> Completion -> Review lifecycle
  console.log("\n--- Test 6: Booking 2 lifecycle (Pending -> Approved -> Completed -> Review) ---");
  const reqCreate2 = {
    user: parentUser,
    body: {
      center: center._id.toString(),
      childName: "Lifecycle Test Baby 2",
      childAge: 4,
      bookingDate: dateStr,
      startTime: "11:00",
      endTime: "12:00",
      planType: "Hourly",
    },
  };
  const resCreate2 = createMockRes();
  await createBooking(reqCreate2, resCreate2);
  assert.strictEqual(resCreate2.statusCode, 201);
  const booking2 = resCreate2.body.booking;

  // Provider approves Booking 2
  const reqApprove = {
    user: providerUser,
    params: { id: booking2._id.toString() },
  };
  const resApprove = createMockRes();
  await approveBooking(reqApprove, resApprove);
  assert.strictEqual(resApprove.statusCode, 200, "Provider approval must succeed");
  const approvedBooking = await Booking.findById(booking2._id);
  assert.strictEqual(approvedBooking.status, "Approved", "Status must be Approved");
  console.log("✓ Provider approved booking.");

  // Test 7: Parent cannot cancel an Approved booking through cancelBooking
  console.log("\n--- Test 7: Approved booking cannot be cancelled via Pending-only endpoint ---");
  const reqCancelApproved = {
    user: parentUser,
    params: { id: booking2._id.toString() },
  };
  const resCancelApproved = createMockRes();
  await cancelBooking(reqCancelApproved, resCancelApproved);
  assert.strictEqual(resCancelApproved.statusCode, 400, "Cancelling approved booking via pending cancel must fail");
  console.log("✓ Expected rejection: Only Pending bookings can be cancelled.");

  // Test 8: Cannot complete booking before scheduled end time has arrived
  console.log("\n--- Test 8: Cannot complete booking before scheduled end time ---");
  const reqCompleteFuture = {
    user: providerUser,
    params: { id: booking2._id.toString() },
  };
  const resCompleteFuture = createMockRes();
  await completeBooking(reqCompleteFuture, resCompleteFuture);
  assert.strictEqual(resCompleteFuture.statusCode, 400, "Premature completion must fail");
  assert(resCompleteFuture.body.message.includes("scheduled childcare service has not ended yet"));
  console.log(`✓ Expected rejection: ${resCompleteFuture.body.message}`);

  // Test 9: Complete booking whose end time has passed
  console.log("\n--- Test 9: Complete booking whose scheduled service end time has elapsed ---");
  // Set bookingDate to yesterday so endDateTime is in the past
  const yesterday = new Date(Date.now() - 86400000);
  await Booking.findByIdAndUpdate(booking2._id, {
    bookingDate: yesterday,
    startTime: "09:00",
    endTime: "10:00",
  });
  const resCompletePassed = createMockRes();
  await completeBooking(reqCompleteFuture, resCompletePassed);
  assert.strictEqual(resCompletePassed.statusCode, 200, "Completion must succeed when service time has elapsed");
  const completedBooking = await Booking.findById(booking2._id);
  assert.strictEqual(completedBooking.status, "Completed", "Booking status must be Completed");
  console.log("✓ Provider successfully completed booking whose service time has elapsed.");

  // Test 10: Parent can now submit verified Review
  console.log("\n--- Test 10: Parent submits verified review on Completed booking ---");
  const reqReview = {
    user: parentUser,
    body: {
      bookingId: booking2._id.toString(),
      centerId: center._id.toString(),
      rating: 5,
      comment: "Exceptional childcare service! Staff was attentive and communicative.",
    },
  };
  const resReview = createMockRes();
  await createReview(reqReview, resReview);
  assert.strictEqual(resReview.statusCode, 201, "Review creation must return 201");
  console.log("✓ Parent successfully submitted verified review on completed booking.");

  // Test 11: Duplicate review is rejected
  console.log("\n--- Test 11: Duplicate review on same booking is rejected ---");
  const resDuplicateReview = createMockRes();
  await createReview(reqReview, resDuplicateReview);
  assert.strictEqual(resDuplicateReview.statusCode, 409, "Duplicate review must fail with 409 Conflict");
  console.log("✓ Expected rejection: You have already reviewed this booking.");

  // Test 12: Booking 3 - Provider Rejection and inability to complete
  console.log("\n--- Test 12: Provider Reject and inability to complete Rejected booking ---");
  const reqCreate3 = {
    user: parentUser,
    body: {
      center: center._id.toString(),
      childName: "Lifecycle Test Baby 3",
      childAge: 2,
      bookingDate: dateStr,
      startTime: "14:00",
      endTime: "15:00",
      planType: "Hourly",
    },
  };
  const resCreate3 = createMockRes();
  await createBooking(reqCreate3, resCreate3);
  const booking3 = resCreate3.body.booking;

  const reqReject = {
    user: providerUser,
    params: { id: booking3._id.toString() },
  };
  const resReject = createMockRes();
  await rejectBooking(reqReject, resReject);
  assert.strictEqual(resReject.statusCode, 200, "Provider reject must succeed");
  const rejectedBooking = await Booking.findById(booking3._id);
  assert.strictEqual(rejectedBooking.status, "Rejected", "Status must be Rejected");

  const resCompleteRejected = createMockRes();
  await completeBooking({ user: providerUser, params: { id: booking3._id.toString() } }, resCompleteRejected);
  assert.strictEqual(resCompleteRejected.statusCode, 400, "Cannot complete rejected booking");
  console.log("✓ Provider rejected booking, and rejected booking cannot be completed.");

  // Clean up test bookings and review to leave DB clean
  await Review.deleteMany({ booking: booking2._id });
  await Booking.deleteMany({ _id: { $in: [booking1._id, booking2._id, booking3._id] } });
  console.log("\n✓ Cleaned up test booking records.");

  console.log("\n=======================================================");
  console.log("ALL 12 PACKAGE 4 LIFECYCLE & INTEGRATION TESTS PASSED!");
  console.log("=======================================================");
  process.exit(0);
};

run().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
