import assert from "assert";
import mongoose from "mongoose";
import Center from "../models/Center.js";
import {
  validateWeeklySchedule,
  getEffectiveWeeklySchedule,
  isBookingWithinCenterSchedule,
} from "./scheduleHelper.js";

console.log("=== RUNNING FOCUSED WEEKLY SCHEDULE EDGE-CASE TESTS ===");

// -------------------------------------------------------------------------
// 1. Overnight interval: Friday 20:00 to Saturday 06:00 (Task 2 & 3)
// -------------------------------------------------------------------------
const overnightSchedule = {
  friday: {
    isOpen: true,
    is24Hours: false,
    intervals: [{ open: "20:00", close: "06:00" }],
  },
  saturday: {
    isOpen: false, // Saturday itself has no separate daytime hours
  },
  sunday: {
    isOpen: false,
  },
};

const normRes = validateWeeklySchedule(overnightSchedule);
assert.strictEqual(normRes.isValid, true, "Overnight schedule should be valid");
assert.strictEqual(
  normRes.normalizedSchedule.friday.intervals[0].isOvernight,
  true,
  "Friday interval should be flagged as overnight"
);

const centerOvernight = {
  weeklySchedule: normRes.normalizedSchedule,
  is24Hours: false,
};

// 2026-10-30 is Friday, 2026-10-31 is Saturday.
// 1A. Friday 21:00 - 23:00 (within evening opening before midnight)
const testFriEvening = isBookingWithinCenterSchedule(centerOvernight, "2026-10-30", "21:00", "23:00");
assert.strictEqual(testFriEvening.allowed, true, "Friday 21:00-23:00 should be allowed");

// 1B. Saturday 01:00 - 05:00 (covered by Friday overnight interval into Saturday morning)
const testSatMorning = isBookingWithinCenterSchedule(centerOvernight, "2026-10-31", "01:00", "05:00");
assert.strictEqual(testSatMorning.allowed, true, "Saturday 01:00-05:00 should be allowed via Friday overnight");

// 1C. Exact closing boundary: Saturday 01:00 - 06:00
const testSatClosingExact = isBookingWithinCenterSchedule(centerOvernight, "2026-10-31", "01:00", "06:00");
assert.strictEqual(testSatClosingExact.allowed, true, "Saturday 01:00-06:00 at exact closing boundary should be allowed");

// 1D. Ending after closing: Saturday 01:00 - 06:01
const testSatAfterClosing = isBookingWithinCenterSchedule(centerOvernight, "2026-10-31", "01:00", "06:01");
assert.strictEqual(testSatAfterClosing.allowed, false, "Saturday 01:00-06:01 ending after closing should be rejected");

// 1E. Starting at closing: Saturday 06:00 - 07:00
const testSatAtClosing = isBookingWithinCenterSchedule(centerOvernight, "2026-10-31", "06:00", "07:00");
assert.strictEqual(testSatAtClosing.allowed, false, "Saturday 06:00-07:00 starting at closing must not be available");

// 1F. Starting before opening on Friday: Friday 19:00 - 23:00
const testFriBeforeOpen = isBookingWithinCenterSchedule(centerOvernight, "2026-10-30", "19:00", "23:00");
assert.strictEqual(testFriBeforeOpen.allowed, false, "Friday 19:00-23:00 starting before opening must be rejected");

// 1G. Overnight booking within bounds: Friday 21:00 - Saturday 05:00
const testOvernightWithin = isBookingWithinCenterSchedule(centerOvernight, "2026-10-30", "21:00", "05:00");
assert.strictEqual(testOvernightWithin.allowed, true, "Friday 21:00 - Saturday 05:00 should be allowed");

// 1H. Overnight booking at exact bounds: Friday 20:00 - Saturday 06:00
const testOvernightExact = isBookingWithinCenterSchedule(centerOvernight, "2026-10-30", "20:00", "06:00");
assert.strictEqual(testOvernightExact.allowed, true, "Friday 20:00 - Saturday 06:00 at exact bounds should be allowed");

// 1I. Overnight booking starting before opening: Friday 19:00 - Saturday 05:00
const testOvernightEarly = isBookingWithinCenterSchedule(centerOvernight, "2026-10-30", "19:00", "05:00");
assert.strictEqual(testOvernightEarly.allowed, false, "Overnight booking starting before opening must be rejected");

// 1J. Overnight booking extending beyond closing: Friday 21:00 - Saturday 07:00
const testOvernightLate = isBookingWithinCenterSchedule(centerOvernight, "2026-10-30", "21:00", "07:00");
assert.strictEqual(testOvernightLate.allowed, false, "Overnight booking extending beyond closing must be rejected");

console.log("✓ Task 2 & 3: Overnight, boundary, and previous-day shift tests passed!");

// -------------------------------------------------------------------------
// 2. Contradictory schedule configurations (Task 4)
// -------------------------------------------------------------------------

// 2A. Closed day marked as 24 hours
const badClosedAnd24 = validateWeeklySchedule({
  monday: { isOpen: false, is24Hours: true },
});
assert.strictEqual(badClosedAnd24.isValid, false);
assert.ok(badClosedAnd24.message.includes("cannot be marked closed and 24 hours simultaneously"));

// 2B. Closed day with intervals
const badClosedWithIntervals = validateWeeklySchedule({
  monday: { isOpen: false, intervals: [{ open: "08:00", close: "17:00" }] },
});
assert.strictEqual(badClosedWithIntervals.isValid, false);
assert.ok(badClosedWithIntervals.message.includes("marked as closed but contains operating intervals"));

// 2C. 24-hour day with custom non-full-day intervals
const bad24WithCustomIntervals = validateWeeklySchedule({
  monday: { isOpen: true, is24Hours: true, intervals: [{ open: "08:00", close: "17:00" }] },
});
assert.strictEqual(bad24WithCustomIntervals.isValid, false);
assert.ok(bad24WithCustomIntervals.message.includes("cannot specify custom operating intervals when marked as 24 hours"));

// 2D. Open day with empty intervals
const badOpenEmpty = validateWeeklySchedule({
  monday: { isOpen: true, is24Hours: false, intervals: [] },
});
assert.strictEqual(badOpenEmpty.isValid, false);
assert.ok(badOpenEmpty.message.includes("marked as open but has no operating intervals"));

console.log("✓ Task 4: Contradictory schedule configuration validation tests passed!");

// -------------------------------------------------------------------------
// 3. Zero-length vs overnight & 00:00 midnight (Task 5)
// -------------------------------------------------------------------------

// 3A. Equal open/close 10:00-10:00: invalid zero-length
const zeroLengthDay = validateWeeklySchedule({
  monday: { isOpen: true, intervals: [{ open: "10:00", close: "10:00" }] },
});
assert.strictEqual(zeroLengthDay.isValid, false);
assert.ok(zeroLengthDay.message.includes("cannot have identical open and close time"));

// 3B. Equal open/close 00:00-00:00: invalid zero-length (must not be confused with overnight)
const zeroLengthMidnight = validateWeeklySchedule({
  monday: { isOpen: true, intervals: [{ open: "00:00", close: "00:00" }] },
});
assert.strictEqual(zeroLengthMidnight.isValid, false);
assert.ok(zeroLengthMidnight.message.includes("cannot have identical open and close time"));

// 3C. Valid interval ending at 00:00 (midnight of that day)
const endingAtMidnight = validateWeeklySchedule({
  friday: { isOpen: true, intervals: [{ open: "18:00", close: "00:00" }] },
});
assert.strictEqual(endingAtMidnight.isValid, true);
assert.strictEqual(endingAtMidnight.normalizedSchedule.friday.intervals[0].close, "00:00");
assert.strictEqual(endingAtMidnight.normalizedSchedule.friday.intervals[0].isOvernight, false);

const centerEndingMidnight = {
  weeklySchedule: endingAtMidnight.normalizedSchedule,
  is24Hours: false,
};

// Booking 20:00 - 00:00 (ending at midnight) should be allowed
const bookToMidnight = isBookingWithinCenterSchedule(centerEndingMidnight, "2026-10-30", "20:00", "00:00");
assert.strictEqual(bookToMidnight.allowed, true, "Booking ending at midnight should be allowed");

// Booking 20:00 - 01:00 should be rejected because center closed at midnight
const bookPastMidnight = isBookingWithinCenterSchedule(centerEndingMidnight, "2026-10-30", "20:00", "01:00");
assert.strictEqual(bookPastMidnight.allowed, false, "Booking extending past midnight should be rejected");

// 3D. Adjacent intervals (08:00-12:00 and 12:00-17:00) should be allowed
const adjacentIntervals = validateWeeklySchedule({
  monday: {
    isOpen: true,
    intervals: [
      { open: "08:00", close: "12:00" },
      { open: "12:00", close: "17:00" },
    ],
  },
});
assert.strictEqual(adjacentIntervals.isValid, true, "Adjacent intervals sharing boundary should be valid");

// 3E. Overlapping intervals (08:00-12:01 and 12:00-17:00) should be rejected
const overlappingIntervals = validateWeeklySchedule({
  monday: {
    isOpen: true,
    intervals: [
      { open: "08:00", close: "12:01" },
      { open: "12:00", close: "17:00" },
    ],
  },
});
assert.strictEqual(overlappingIntervals.isValid, false);
assert.ok(overlappingIntervals.message.includes("Overlapping intervals detected"));

console.log("✓ Task 5: Midnight closing, zero-length rejection, and adjacent interval tests passed!");

// -------------------------------------------------------------------------
// 4. Legacy-center fallback tests (Task 6)
// -------------------------------------------------------------------------
const legacyCenter1 = {
  openingTime: "08:00",
  closingTime: "18:00",
  is24Hours: false,
};
const eff1 = getEffectiveWeeklySchedule(legacyCenter1);
assert.strictEqual(eff1.monday.isOpen, true);
assert.strictEqual(eff1.monday.intervals[0].open, "08:00");
assert.strictEqual(eff1.monday.intervals[0].close, "18:00");
assert.strictEqual(eff1.monday.intervals[0].isOvernight, false);

const legacyCenter2 = {
  is24Hours: true,
};
const eff2 = getEffectiveWeeklySchedule(legacyCenter2);
assert.strictEqual(eff2.monday.is24Hours, true);
assert.strictEqual(eff2.sunday.is24Hours, true);

console.log("✓ Task 6: Legacy center fallback tests passed!");

// -------------------------------------------------------------------------
// 5. Mongoose Center Model Validation Integration Tests (Task 4)
// -------------------------------------------------------------------------
const baseCenterData = {
  provider: new mongoose.Types.ObjectId(),
  centerName: "Test Center",
  slug: "test-center-" + Date.now(),
  description: "Description",
  address: "Address",
  city: "City",
  state: "State",
  pincode: "123456",
  ageGroup: "0-5",
  capacity: 25,
  monthlyFee: 5000,
  pricePerDay: 500,
  openingTime: "08:00",
  closingTime: "18:00",
  is24Hours: false,
};

// 5A. Legacy center without weeklySchedule must be valid
const legacyModelDoc = new Center({ ...baseCenterData });
let legacyValidationErr;
try {
  await legacyModelDoc.validate();
} catch (err) {
  legacyValidationErr = err;
}
assert.strictEqual(
  legacyValidationErr,
  undefined,
  "Legacy center without weeklySchedule should have zero validation errors"
);

// 5B. Center with valid weeklySchedule must be valid
const validModelDoc = new Center({
  ...baseCenterData,
  slug: "valid-center-" + Date.now(),
  weeklySchedule: {
    monday: {
      isOpen: true,
      intervals: [{ open: "08:00", close: "17:00" }],
    },
  },
});
let validValidationErr;
try {
  await validModelDoc.validate();
} catch (err) {
  validValidationErr = err;
}
assert.strictEqual(
  validValidationErr,
  undefined,
  "Center with valid weeklySchedule should have zero validation errors"
);

// 5C. Center with invalid weeklySchedule (closed with intervals) must fail Mongoose validation
const invalidModelDoc = new Center({
  ...baseCenterData,
  slug: "invalid-center-" + Date.now(),
  weeklySchedule: {
    monday: {
      isOpen: false,
      intervals: [{ open: "08:00", close: "17:00" }],
    },
  },
});
let invalidValidationErr;
try {
  await invalidModelDoc.validate();
} catch (err) {
  invalidValidationErr = err;
}
assert.ok(
  invalidValidationErr && invalidValidationErr.errors.weeklySchedule,
  "Center with invalid weeklySchedule must fail Mongoose validation"
);
assert.ok(
  invalidValidationErr.errors.weeklySchedule.message.includes("marked as closed but contains operating intervals"),
  "Mongoose error message must describe contradictory configuration"
);

console.log("✓ Task 4: Mongoose Center model weeklySchedule validation tests passed!");

// -------------------------------------------------------------------------
// 6. Booking Creation Schedule Enforcement Integration Tests
// -------------------------------------------------------------------------
console.log("\n=== RUNNING BOOKING SCHEDULE ENFORCEMENT TESTS ===");

const structuredCenter = {
  weeklySchedule: {
    monday: {
      isOpen: true,
      is24Hours: false,
      intervals: [
        { open: "08:00", close: "12:00", isOvernight: false },
        { open: "14:00", close: "18:00", isOvernight: false },
      ],
    },
    friday: {
      isOpen: true,
      is24Hours: false,
      intervals: [{ open: "20:00", close: "06:00", isOvernight: true }],
    },
    saturday: {
      isOpen: true,
      is24Hours: true,
      intervals: [{ open: "00:00", close: "23:59", isOvernight: false }],
    },
    sunday: {
      isOpen: false,
      is24Hours: false,
      intervals: [],
    },
  },
};

// 6A. Booking within a normal interval (Monday 09:00–11:00)
const resNormal = isBookingWithinCenterSchedule(structuredCenter, "2026-11-02", "09:00", "11:00"); // Monday
assert.strictEqual(resNormal.allowed, true, "Booking within normal interval must be allowed");
console.log("✓ Test 6A: Booking within a normal operating interval is allowed.");

// 6B. Booking outside operating hours (Monday 07:00–10:00)
const resOutside = isBookingWithinCenterSchedule(structuredCenter, "2026-11-02", "07:00", "10:00");
assert.strictEqual(resOutside.allowed, false, "Booking starting before opening must be rejected");
assert.ok(resOutside.reason.includes("outside operating hours"));
console.log("✓ Test 6B: Booking outside operating hours is rejected.");

// 6C. Booking during a closed day (Sunday 10:00–12:00)
const resClosed = isBookingWithinCenterSchedule(structuredCenter, "2026-11-08", "10:00", "12:00"); // Sunday
assert.strictEqual(resClosed.allowed, false, "Booking on closed day must be rejected");
assert.ok(resClosed.reason.includes("closed on Sunday"));
console.log("✓ Test 6C: Booking during a closed day is rejected with clear message.");

// 6D. Booking during an overnight interval after midnight (Saturday 01:00–05:00 from Friday night)
const resOvernightMorning = isBookingWithinCenterSchedule(structuredCenter, "2026-11-07", "01:00", "05:00"); // Saturday
assert.strictEqual(resOvernightMorning.allowed, true, "Saturday morning covered by Friday overnight must be allowed");
console.log("✓ Test 6D: Booking during an overnight interval after midnight is allowed.");

// 6E. Booking across an invalid interval gap (Monday 11:00–15:00 across 12:00-14:00 gap)
const resGap = isBookingWithinCenterSchedule(structuredCenter, "2026-11-02", "11:00", "15:00");
assert.strictEqual(resGap.allowed, false, "Booking spanning across closed gap must be rejected");
console.log("✓ Test 6E: Booking across an invalid interval gap is rejected.");

// 6F. Legacy centers without weekly schedules (fallback to openingTime: 08:00, closingTime: 18:00)
const legacyCenterObj = {
  openingTime: "08:00",
  closingTime: "18:00",
  is24Hours: false,
};
const resLegacyAllowed = isBookingWithinCenterSchedule(legacyCenterObj, "2026-11-02", "09:00", "17:00");
assert.strictEqual(resLegacyAllowed.allowed, true, "Legacy center within hours must be allowed");
const resLegacyRejected = isBookingWithinCenterSchedule(legacyCenterObj, "2026-11-02", "07:00", "12:00");
assert.strictEqual(resLegacyRejected.allowed, false, "Legacy center outside hours must be rejected");
console.log("✓ Test 6F: Legacy centers without weekly schedules correctly validate hours.");

// 6G. Daily and Monthly bookings semantics
// Daily booking on a closed Sunday must be rejected
const resDailyClosed = isBookingWithinCenterSchedule(structuredCenter, "2026-11-08", "08:00", "17:00");
assert.strictEqual(resDailyClosed.allowed, false, "Daily booking on a closed day must be rejected");
// Daily booking within operating hours on Monday must be allowed
const resDailyOpen = isBookingWithinCenterSchedule(structuredCenter, "2026-11-02", "09:00", "11:30");
assert.strictEqual(resDailyOpen.allowed, true, "Daily booking within hours must be allowed");
// Monthly booking starting on a closed Sunday must be rejected
const resMonthlyClosed = isBookingWithinCenterSchedule(structuredCenter, "2026-11-08", "09:00", "17:00");
assert.strictEqual(resMonthlyClosed.allowed, false, "Monthly booking starting on a closed day must be rejected");
console.log("✓ Test 6G: Daily and Monthly bookings correctly enforce operating days and hours.");

console.log("\nALL FOCUSED SCHEDULE EDGE-CASE & BOOKING ENFORCEMENT TESTS PASSED SUCCESSFULLY! (100% verified)");
