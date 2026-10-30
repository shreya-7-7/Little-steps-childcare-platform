/**
 * Weekly Schedule Helper Utilities for Little Steps Childcare Centers
 */

const VALID_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validates and normalizes structured weekly schedule data.
 * - Ensures zero-padded HH:mm times.
 * - Enforces consistency between isOpen, is24Hours, and intervals.
 * - Rejects contradictory configurations (e.g. closed with intervals, 24h with custom intervals).
 * - Distinguishes invalid zero-length intervals (open === close) from valid overnight intervals.
 * - Supports intervals ending at "00:00" (midnight) and permits adjacent intervals without overlap.
 */
export const validateWeeklySchedule = (schedule) => {
  if (!schedule || typeof schedule !== "object") {
    return { isValid: false, message: "Weekly schedule must be an object." };
  }

  const normalized = {};

  // Check for invalid day keys
  for (const day of Object.keys(schedule)) {
    const lowerDay = day.toLowerCase();
    if (!VALID_DAYS.includes(lowerDay)) {
      return {
        isValid: false,
        message: `Invalid day name '${day}'. Must be one of: ${VALID_DAYS.join(", ")}.`,
      };
    }
  }

  for (const day of VALID_DAYS) {
    // Check both lowercase and capitalized keys
    const dayData =
      schedule[day] !== undefined
        ? schedule[day]
        : schedule[day.charAt(0).toUpperCase() + day.slice(1)];

    if (!dayData) {
      continue; // Days are optional in schedule definition
    }

    if (typeof dayData !== "object") {
      return {
        isValid: false,
        message: `Schedule for ${day} must be an object with { isOpen, is24Hours, intervals }.`,
      };
    }

    const isOpen = dayData.isOpen === true || dayData.isOpen === "true";
    const is24Hours = dayData.is24Hours === true || dayData.is24Hours === "true";

    // 1. Validation for Closed Day:
    // Reject contradictory combinations (e.g. closed but 24h, or closed with intervals)
    if (!isOpen) {
      if (is24Hours) {
        return {
          isValid: false,
          message: `${day} cannot be marked closed and 24 hours simultaneously.`,
        };
      }
      if (Array.isArray(dayData.intervals) && dayData.intervals.length > 0) {
        return {
          isValid: false,
          message: `${day} is marked as closed but contains operating intervals.`,
        };
      }
      normalized[day] = {
        isOpen: false,
        is24Hours: false,
        intervals: [],
      };
      continue;
    }

    // 2. Validation for 24-Hour Day:
    // Reject contradictory custom operating intervals
    if (is24Hours) {
      if (Array.isArray(dayData.intervals) && dayData.intervals.length > 0) {
        const isStandardFullDay =
          dayData.intervals.length === 1 &&
          dayData.intervals[0].open === "00:00" &&
          (dayData.intervals[0].close === "23:59" ||
            dayData.intervals[0].close === "24:00" ||
            dayData.intervals[0].close === "00:00");

        if (!isStandardFullDay) {
          return {
            isValid: false,
            message: `${day} cannot specify custom operating intervals when marked as 24 hours.`,
          };
        }
      }

      normalized[day] = {
        isOpen: true,
        is24Hours: true,
        intervals: [
          {
            open: "00:00",
            close: "23:59",
            isOvernight: false,
          },
        ],
      };
      continue;
    }

    // 3. Open Day (not 24 Hours): Must have operating intervals
    if (!Array.isArray(dayData.intervals) || dayData.intervals.length === 0) {
      return {
        isValid: false,
        message: `${day} is marked as open but has no operating intervals.`,
      };
    }

    const parsedIntervals = [];

    for (let i = 0; i < dayData.intervals.length; i++) {
      const interval = dayData.intervals[i];
      if (!interval || typeof interval !== "object") {
        return {
          isValid: false,
          message: `Invalid interval at index ${i} for ${day}.`,
        };
      }

      const open = typeof interval.open === "string" ? interval.open.trim() : "";
      const close = typeof interval.close === "string" ? interval.close.trim() : "";

      if (!TIME_REGEX.test(open) || !TIME_REGEX.test(close)) {
        return {
          isValid: false,
          message: `Invalid time format '${open}' or '${close}' for ${day}. Times must be zero-padded HH:mm (24-hour).`,
        };
      }

      // Check equal open and close time: always an invalid zero-length interval
      if (open === close) {
        return {
          isValid: false,
          message: `Interval for ${day} cannot have identical open and close time (${open}).`,
        };
      }

      const [openH, openM] = open.split(":").map(Number);
      const [closeH, closeM] = close.split(":").map(Number);
      const startMin = openH * 60 + openM;
      const closeMin = closeH * 60 + closeM;

      // An interval closing at "00:00" ends at midnight of the same day (1440 min)
      // An interval is overnight if closeMin < startMin and close is not "00:00"
      const isEndingAtMidnight = close === "00:00";
      const endMin = isEndingAtMidnight ? 1440 : closeMin;
      const isOvernight = !isEndingAtMidnight && closeMin < startMin;

      parsedIntervals.push({
        open,
        close,
        startMin,
        endMin,
        isOvernight,
      });
    }

    // Overlap validation within the day:
    // Sort intervals by startMin
    parsedIntervals.sort((a, b) => a.startMin - b.startMin);

    for (let i = 0; i < parsedIntervals.length - 1; i++) {
      const current = parsedIntervals[i];
      const next = parsedIntervals[i + 1];

      // If current interval is overnight, it runs until midnight (1440 min) on the starting day
      const currentEndOnThisDay = current.isOvernight ? 1440 : current.endMin;

      // Strict '>' allows adjacent intervals (e.g. 08:00-12:00 and 12:00-17:00), rejects overlapping
      if (currentEndOnThisDay > next.startMin) {
        return {
          isValid: false,
          message: `Overlapping intervals detected on ${day}: [${current.open} - ${current.close}] overlaps with [${next.open} - ${next.close}].`,
        };
      }
    }

    normalized[day] = {
      isOpen: true,
      is24Hours: false,
      intervals: parsedIntervals.map(({ open, close, isOvernight }) => ({
        open,
        close,
        isOvernight,
      })),
    };
  }

  return { isValid: true, normalizedSchedule: normalized };
};

/**
 * Returns the effective weekly schedule for a center, falling back to legacy
 * openingTime, closingTime, and is24Hours if no structured weekly schedule exists.
 */
export const getEffectiveWeeklySchedule = (center) => {
  if (!center) return null;

  const scheduleObj =
    typeof center.weeklySchedule?.toObject === "function"
      ? center.weeklySchedule.toObject()
      : center.weeklySchedule;

  if (scheduleObj && Object.keys(scheduleObj).length > 0) {
    return scheduleObj;
  }

  const is24Hours = Boolean(center.is24Hours);
  const open = center.openingTime || "00:00";
  const close = center.closingTime || "23:59";

  const [openH, openM] = open.split(":").map(Number);
  const [closeH, closeM] = close.split(":").map(Number);
  const startMin = (openH || 0) * 60 + (openM || 0);
  const closeMin = (closeH || 0) * 60 + (closeM || 0);
  const isOvernight = is24Hours ? false : close !== "00:00" && closeMin < startMin;

  const fallbackDay = is24Hours
    ? {
        isOpen: true,
        is24Hours: true,
        intervals: [{ open: "00:00", close: "23:59", isOvernight: false }],
      }
    : {
        isOpen: true,
        is24Hours: false,
        intervals: [{ open, close, isOvernight }],
      };

  return {
    monday: fallbackDay,
    tuesday: fallbackDay,
    wednesday: fallbackDay,
    thursday: fallbackDay,
    friday: fallbackDay,
    saturday: fallbackDay,
    sunday: fallbackDay,
  };
};

/**
 * Checks whether a requested service booking time falls within center opening schedule.
 * Correctly accounts for:
 * - Same-day bookings on the center's schedule.
 * - Previous day's overnight interval extending into today's early morning hours.
 * - Overnight bookings spanning from today's evening into tomorrow morning.
 * - Strict closing boundary enforcement (requests ending after closing are rejected).
 */
export const isBookingWithinCenterSchedule = (
  center,
  bookingDate,
  startTime,
  endTime
) => {
  if (!center) return { allowed: false, reason: "Center not found." };

  if (center.is24Hours) {
    return { allowed: true };
  }

  const effectiveSchedule = getEffectiveWeeklySchedule(center);
  if (!effectiveSchedule) {
    return { allowed: true }; // Permissive fallback if unconfigured
  }

  const dateObj = new Date(bookingDate);
  if (isNaN(dateObj.getTime())) {
    return { allowed: false, reason: "Invalid booking date format." };
  }

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayIndex = dateObj.getDay();
  const dayKey = dayNames[dayIndex];
  const prevDayIndex = (dayIndex + 6) % 7;
  const prevDayKey = dayNames[prevDayIndex];

  const daySchedule = effectiveSchedule[dayKey];
  const prevDaySchedule = effectiveSchedule[prevDayKey];

  const [reqStartH, reqStartM] = startTime.split(":").map(Number);
  const [reqEndH, reqEndM] = endTime.split(":").map(Number);
  const reqStartMin = reqStartH * 60 + reqStartM;
  const reqEndMin = reqEndH * 60 + reqEndM;

  // Determine if the requested booking spans across midnight
  const isEndingAtMidnight = endTime === "00:00" && startTime !== "00:00";
  const effectiveReqEndMin = isEndingAtMidnight ? 1440 : reqEndMin;
  const isReqOvernight = !isEndingAtMidnight && reqEndMin < reqStartMin;

  // =========================================================================
  // Case 1: Same-Day Booking (not overnight, e.g. Friday 21:00-23:00, or Saturday 01:00-05:00)
  // =========================================================================
  if (!isReqOvernight) {
    // 1A. Check if current day's schedule covers it
    if (daySchedule && daySchedule.isOpen) {
      if (daySchedule.is24Hours) {
        return { allowed: true };
      }

      for (const interval of daySchedule.intervals || []) {
        const [intOpenH, intOpenM] = interval.open.split(":").map(Number);
        const [intCloseH, intCloseM] = interval.close.split(":").map(Number);
        const intOpenMin = intOpenH * 60 + intOpenM;
        const intCloseMin = interval.close === "00:00" ? 1440 : intCloseH * 60 + intCloseM;

        if (!interval.isOvernight) {
          // Standard daytime interval
          if (reqStartMin >= intOpenMin && effectiveReqEndMin <= intCloseMin) {
            return { allowed: true };
          }
        } else {
          // Current day has an overnight interval (e.g. opens 20:00, runs until midnight and beyond)
          // On the current day, it covers from intOpenMin up to midnight (1440)
          if (reqStartMin >= intOpenMin && effectiveReqEndMin <= 1440) {
            return { allowed: true };
          }
        }
      }
    }

    // 1B. Check if the PREVIOUS day's overnight interval covers this morning booking!
    // (e.g. Friday overnight 20:00 - Saturday 06:00 covers Saturday 01:00 - 05:00)
    if (prevDaySchedule && prevDaySchedule.isOpen) {
      for (const prevInterval of prevDaySchedule.intervals || []) {
        if (prevInterval.isOvernight) {
          const [prevCloseH, prevCloseM] = prevInterval.close.split(":").map(Number);
          const prevCloseMin = prevCloseH * 60 + prevCloseM;

          // The overnight interval covers today from 00:00 (0 min) up to prevCloseMin.
          // Booking must start before closing and end at or before closing.
          if (reqStartMin < prevCloseMin && effectiveReqEndMin <= prevCloseMin) {
            return { allowed: true };
          }

          // Contiguous transition check: booking starts in previous day's overnight interval
          // and extends into today's morning schedule if contiguous
          if (reqStartMin < prevCloseMin && effectiveReqEndMin > prevCloseMin) {
            if (daySchedule && daySchedule.isOpen) {
              if (daySchedule.is24Hours) {
                return { allowed: true };
              }
              for (const dayInt of daySchedule.intervals || []) {
                const [dOpenH, dOpenM] = dayInt.open.split(":").map(Number);
                const [dCloseH, dCloseM] = dayInt.close.split(":").map(Number);
                const dOpenMin = dOpenH * 60 + dOpenM;
                const dCloseMin =
                  dayInt.close === "00:00"
                    ? 1440
                    : dayInt.isOvernight
                    ? 1440
                    : dCloseH * 60 + dCloseM;

                if (dOpenMin <= prevCloseMin && effectiveReqEndMin <= dCloseMin) {
                  return { allowed: true };
                }
              }
            }
          }
        }
      }
    }

    const formattedDay = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
    if (!daySchedule || !daySchedule.isOpen) {
      return {
        allowed: false,
        reason: `Center is closed on ${formattedDay}.`,
      };
    }

    return {
      allowed: false,
      reason: `Requested time ${startTime} - ${endTime} is outside operating hours for ${formattedDay}.`,
    };
  }

  // =========================================================================
  // Case 2: Overnight Booking (e.g. Friday 21:00 to Saturday 05:00)
  // =========================================================================
  if (isReqOvernight) {
    if (!daySchedule || !daySchedule.isOpen) {
      const formattedDay = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
      return {
        allowed: false,
        reason: `Center is closed on ${formattedDay}.`,
      };
    }

    // Check if current day has an overnight interval that covers this request
    for (const interval of daySchedule.intervals || []) {
      if (interval.isOvernight) {
        const [intOpenH, intOpenM] = interval.open.split(":").map(Number);
        const [intCloseH, intCloseM] = interval.close.split(":").map(Number);
        const intOpenMin = intOpenH * 60 + intOpenM;
        const intCloseMin = intCloseH * 60 + intCloseM;

        // Must start at or after opening on Day 1, and end at or before closing on Day 2
        if (reqStartMin >= intOpenMin && reqEndMin <= intCloseMin) {
          return { allowed: true };
        }
      }
    }

    // Also check if current day and next day together form a 24-hour / contiguous span
    const nextDayIndex = (dayIndex + 1) % 7;
    const nextDayKey = dayNames[nextDayIndex];
    const nextDaySchedule = effectiveSchedule[nextDayKey];

    if (daySchedule.is24Hours) {
      if (nextDaySchedule && nextDaySchedule.isOpen) {
        if (nextDaySchedule.is24Hours) {
          return { allowed: true };
        }
        for (const nextInt of nextDaySchedule.intervals || []) {
          const [nOpenH, nOpenM] = nextInt.open.split(":").map(Number);
          const [nCloseH, nCloseM] = nextInt.close.split(":").map(Number);
          const nOpenMin = nOpenH * 60 + nOpenM;
          const nCloseMin =
            nextInt.close === "00:00"
              ? 1440
              : nextInt.isOvernight
              ? 1440
              : nCloseH * 60 + nCloseM;
          if (nOpenMin === 0 && reqEndMin <= nCloseMin) {
            return { allowed: true };
          }
        }
      }
    }

    const formattedDay = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
    return {
      allowed: false,
      reason: `Requested overnight time ${startTime} - ${endTime} is outside operating hours for ${formattedDay}.`,
    };
  }

  return { allowed: false, reason: "Unable to validate schedule." };
};
