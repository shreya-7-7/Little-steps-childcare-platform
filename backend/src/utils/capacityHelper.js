/**
 * Capacity and Minute-Exact Half-Open Interval Helper Utilities for Little Steps Childcare Centers
 */
import mongoose from "mongoose";
import CenterCapacity from "../models/CenterCapacity.js";
import Booking from "../models/Booking.js";

/**
 * Parses "HH:mm" into minutes from start of day [0..1440].
 * If isEnd is true and timeStr is "00:00", converts to 1440 (midnight).
 */
export const timeToMinutes = (timeStr, isEnd = false) => {
  if (isEnd && timeStr === "00:00") return 1440;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Returns whether a booking spans across midnight into the following morning.
 */
export const isOvernightBooking = (startTime, endTime, planType) => {
  if (planType !== "Hourly") return false;
  if (!startTime || !endTime) return false;
  if (endTime === "00:00") return false; // "00:00" is midnight ending on same day

  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  return endMin < startMin;
};

/**
 * Calculates next date string YYYY-MM-DD from given date string.
 */
export const getNextDateString = (dateStr) => {
  const date = new Date(dateStr + "T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split("T")[0];
};

/**
 * Returns half-open interval(s) [startMin, endMin) for a booking on a given date.
 * Daily and Monthly bookings reserve the entire 24-hour day [0, 1440).
 * Overnight hourly bookings return Day 1 interval [startMin, 1440) and Day 2 interval [0, endMin).
 */
export const getBookingIntervals = (startTime, endTime, planType) => {
  if (planType === "Daily" || planType === "Monthly") {
    return {
      isOvernight: false,
      day1: { startMin: 0, endMin: 1440, planType },
    };
  }

  const startMin = timeToMinutes(startTime);
  const isOvernight = isOvernightBooking(startTime, endTime, planType);

  if (!isOvernight) {
    const endMin = timeToMinutes(endTime, true);
    return {
      isOvernight: false,
      day1: { startMin, endMin, planType },
    };
  } else {
    const endMin = timeToMinutes(endTime);
    return {
      isOvernight: true,
      day1: { startMin, endMin: 1440, planType },
      day2: { startMin: 0, endMin, planType },
    };
  }
};

/**
 * Calculates the maximum concurrent overlapping active bookings for candidate [newStart, newEnd)
 * against an existing set of half-open intervals [startMin, endMin).
 * Accurately processes adjacent intervals without overlap (e.g. 08:00-08:30 and 08:30-09:00).
 */
export const calculateMaxOverlap = (existingIntervals, newStart, newEnd) => {
  const overlapping = [];
  for (const inv of existingIntervals || []) {
    // Two half-open intervals [A, B) and [C, D) overlap iff max(A, C) < min(B, D)
    if (Math.max(inv.startMin, newStart) < Math.min(inv.endMin, newEnd)) {
      overlapping.push(inv);
    }
  }

  if (overlapping.length === 0) return 0;

  // Build events for sweep-line algorithm within the intersection window
  const events = [];
  for (const inv of overlapping) {
    events.push({ time: Math.max(inv.startMin, newStart), type: +1 });
    events.push({ time: Math.min(inv.endMin, newEnd), type: -1 });
  }

  // Sort events: primary by time ascending.
  // Secondary: departures (-1) before arrivals (+1) to honor half-open [start, end)
  events.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    return a.type - b.type;
  });

  let currentCount = 0;
  let maxCount = 0;
  for (const ev of events) {
    currentCount += ev.type;
    if (currentCount > maxCount) {
      maxCount = currentCount;
    }
  }

  return maxCount;
};

/**
 * Ensures a CenterCapacity tracking document exists for (centerId, dateStr)
 * and accurately synchronizes intervals from existing active bookings.
 */
export const getOrSyncCenterCapacity = async (centerId, dateStr, parsedDate, session = null) => {
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const findOptions = session ? { session } : {};
    let capacityDoc = await CenterCapacity.findOne({ center: centerId, date: dateStr }, null, findOptions);
    if (capacityDoc && Array.isArray(capacityDoc.intervals)) {
      return capacityDoc;
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Retrieve all active bookings starting on this date
    const bookingQuery = Booking.find({
      center: centerId,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["Pending", "pending", "Approved", "approved"] },
    });
    if (session) bookingQuery.session(session);
    const activeBookings = await bookingQuery;

    // Also check for overnight bookings from previous day extending into today
    const prevDay = new Date(startOfDay);
    prevDay.setUTCDate(prevDay.getUTCDate() - 1);
    const prevStart = new Date(prevDay);
    prevStart.setUTCHours(0, 0, 0, 0);
    const prevEnd = new Date(prevDay);
    prevEnd.setUTCHours(23, 59, 59, 999);

    const prevQuery = Booking.find({
      center: centerId,
      bookingDate: { $gte: prevStart, $lte: prevEnd },
      status: { $in: ["Pending", "pending", "Approved", "approved"] },
      planType: "Hourly",
    });
    if (session) prevQuery.session(session);
    const prevOvernightBookings = await prevQuery;

    const initialIntervals = [];

    for (const b of activeBookings) {
      const { day1 } = getBookingIntervals(b.startTime, b.endTime, b.planType);
      initialIntervals.push({
        bookingId: b._id,
        startMin: day1.startMin,
        endMin: day1.endMin,
        planType: b.planType,
      });
    }

    for (const b of prevOvernightBookings) {
      if (isOvernightBooking(b.startTime, b.endTime, b.planType)) {
        const { day2 } = getBookingIntervals(b.startTime, b.endTime, b.planType);
        if (day2) {
          initialIntervals.push({
            bookingId: b._id,
            startMin: day2.startMin,
            endMin: day2.endMin,
            planType: b.planType,
          });
        }
      }
    }

    try {
      const upsertOptions = { upsert: true, new: true };
      if (session) upsertOptions.session = session;

      capacityDoc = await CenterCapacity.findOneAndUpdate(
        { center: centerId, date: dateStr },
        {
          $setOnInsert: {
            center: centerId,
            date: dateStr,
            version: 0,
            bookedCount: initialIntervals.length,
            intervals: initialIntervals,
            slots: new Array(24).fill(0),
          },
        },
        upsertOptions
      );
      if (capacityDoc) return capacityDoc;
    } catch (err) {
      if (err.code === 11000 || (err.message && err.message.includes("E11000"))) {
        capacityDoc = await CenterCapacity.findOne({ center: centerId, date: dateStr }, null, findOptions);
        if (capacityDoc) return capacityDoc;
      } else {
        throw err;
      }
    }
  }
  return await CenterCapacity.findOne({ center: centerId, date: dateStr }, null, session ? { session } : {});
};

/**
 * Atomically reserves capacity for [startMin, endMin) using Optimistic Concurrency Control (OCC).
 * Serializes concurrent requests without race conditions and supports transactional sessions.
 */
export const reserveIntervalSlots = async (
  centerId,
  dateStr,
  parsedDate,
  startMin,
  endMin,
  planType,
  capacity,
  bookingId = null,
  session = null
) => {
  const maxRetries = 5;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const capacityDoc = await getOrSyncCenterCapacity(centerId, dateStr, parsedDate, session);

    const currentIntervals = capacityDoc.intervals || [];
    const maxOverlap = calculateMaxOverlap(currentIntervals, startMin, endMin);

    if (maxOverlap >= capacity) {
      return {
        success: false,
        message: `Center has reached maximum capacity (${capacity} children) during the requested time on ${dateStr}.`,
      };
    }

    const currentVersion = capacityDoc.version || 0;
    const newInterval = {
      bookingId: bookingId || null,
      startMin,
      endMin,
      planType,
    };

    const updateOptions = { new: true };
    if (session) updateOptions.session = session;

    const updated = await CenterCapacity.findOneAndUpdate(
      {
        center: centerId,
        date: dateStr,
        version: currentVersion,
      },
      {
        $push: { intervals: newInterval },
        $inc: { version: 1, bookedCount: 1 },
      },
      updateOptions
    );

    if (updated) {
      return { success: true, dateStr, startMin, endMin };
    }
    // Concurrent update detected, retry loop
  }

  return {
    success: false,
    message: "High concurrency reservation conflict. Please try again.",
  };
};

/**
 * Atomically releases an interval reservation on a date.
 */
export const releaseIntervalSlots = async (
  centerId,
  dateStr,
  startMin,
  endMin,
  reason,
  bookingId = null,
  session = null
) => {
  const pullCondition = bookingId
    ? { $or: [{ bookingId }, { startMin, endMin }] }
    : { startMin, endMin };

  const query = {
    center: centerId,
    date: dateStr,
    intervals: { $elemMatch: pullCondition },
    bookedCount: { $gt: 0 },
  };

  const updateOptions = { new: true };
  if (session) updateOptions.session = session;

  try {
    const updated = await CenterCapacity.findOneAndUpdate(
      query,
      {
        $pull: { intervals: pullCondition },
        $inc: { version: 1, bookedCount: -1 },
      },
      updateOptions
    );
    return Boolean(updated);
  } catch (err) {
    console.error(
      `[CAPACITY_RELEASE_ERROR] Failed to release interval for center ${centerId} on ${dateStr}. Reason: ${reason}. Error: ${err.message}`
    );
    return false;
  }
};

/**
 * Full atomic reservation for a booking (handles daytime, daily/monthly, and overnight spans).
 */
export const reserveBookingCapacity = async (
  centerId,
  dateStr,
  parsedDate,
  startTime,
  endTime,
  planType,
  capacity,
  bookingId = null,
  session = null
) => {
  const intervals = getBookingIntervals(startTime, endTime, planType);

  if (!intervals.isOvernight) {
    const { startMin, endMin } = intervals.day1;
    return await reserveIntervalSlots(
      centerId,
      dateStr,
      parsedDate,
      startMin,
      endMin,
      planType,
      capacity,
      bookingId,
      session
    );
  } else {
    // Overnight: Day 1 and Day 2
    const { startMin: start1, endMin: end1 } = intervals.day1;
    const { startMin: start2, endMin: end2 } = intervals.day2;

    const dateStrDay2 = getNextDateString(dateStr);
    const parsedDateDay2 = new Date(parsedDate);
    parsedDateDay2.setUTCDate(parsedDateDay2.getUTCDate() + 1);

    // Reserve Day 1
    const res1 = await reserveIntervalSlots(
      centerId,
      dateStr,
      parsedDate,
      start1,
      end1,
      planType,
      capacity,
      bookingId,
      session
    );
    if (!res1.success) {
      return res1;
    }

    // Reserve Day 2
    const res2 = await reserveIntervalSlots(
      centerId,
      dateStrDay2,
      parsedDateDay2,
      start2,
      end2,
      planType,
      capacity,
      bookingId,
      session
    );
    if (!res2.success) {
      // In non-transactional fallback, manually release Day 1
      if (!session) {
        await releaseIntervalSlots(centerId, dateStr, start1, end1, "rollback_overnight_day2_full", bookingId);
      }
      return res2;
    }

    return {
      success: true,
      isOvernight: true,
      day1: { dateStr, startMin: start1, endMin: end1 },
      day2: { dateStr: dateStrDay2, startMin: start2, endMin: end2 },
    };
  }
};

/**
 * Full atomic release for a booking.
 */
export const releaseBookingCapacity = async (
  centerId,
  dateStr,
  startTime,
  endTime,
  planType,
  reason,
  bookingId = null,
  session = null
) => {
  const intervals = getBookingIntervals(startTime, endTime, planType);

  if (!intervals.isOvernight) {
    const { startMin, endMin } = intervals.day1;
    return await releaseIntervalSlots(
      centerId,
      dateStr,
      startMin,
      endMin,
      reason,
      bookingId,
      session
    );
  } else {
    const { startMin: start1, endMin: end1 } = intervals.day1;
    const { startMin: start2, endMin: end2 } = intervals.day2;
    const dateStrDay2 = getNextDateString(dateStr);

    const rel1 = await releaseIntervalSlots(centerId, dateStr, start1, end1, reason, bookingId, session);
    const rel2 = await releaseIntervalSlots(centerId, dateStrDay2, start2, end2, reason, bookingId, session);
    return rel1 && rel2;
  }
};

/**
 * Runs an action strictly within an Atlas-compatible MongoDB transaction session.
 * Fails closed: if transactions are unavailable or startTransaction fails,
 * throws an explicit error without executing the callback.
 */
export const runInTransaction = async (workFn) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    if (!session || typeof session.startTransaction !== "function") {
      const err = new Error(
        "Database transactions are unavailable. Operation aborted to protect data integrity."
      );
      err.statusCode = 503;
      err.code = "TRANSACTION_UNAVAILABLE";
      throw err;
    }
  } catch (startErr) {
    if (startErr.code === "TRANSACTION_UNAVAILABLE") throw startErr;
    const err = new Error(
      `Database transaction session could not be established: ${startErr.message}. Operation aborted to protect data integrity.`
    );
    err.statusCode = 503;
    err.code = "TRANSACTION_UNAVAILABLE";
    throw err;
  }

  try {
    session.startTransaction();
  } catch (startTxErr) {
    try {
      await session.endSession();
    } catch (_) {}
    const err = new Error(
      `Failed to start database transaction: ${startTxErr.message}. Operation aborted to protect data integrity.`
    );
    err.statusCode = 503;
    err.code = "TRANSACTION_UNAVAILABLE";
    throw err;
  }

  try {
    const result = await workFn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session.inTransaction && session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        console.error("[TRANSACTION_ABORT_ERROR] Failed to abort transaction cleanly:", abortErr);
      }
    }
    throw error;
  } finally {
    try {
      await session.endSession();
    } catch (_) {}
  }
};
