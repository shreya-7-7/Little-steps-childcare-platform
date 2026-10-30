const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export const normalizeScheduleInterval = (open, close) => {
  const [openH, openM] = open.split(":").map(Number);
  const [closeH, closeM] = close.split(":").map(Number);
  const startMin = (openH || 0) * 60 + (openM || 0);
  const closeMin = (closeH || 0) * 60 + (closeM || 0);

  const isEndingAtMidnight = close === "00:00";
  const isOvernight = !isEndingAtMidnight && closeMin < startMin;

  return {
    open,
    close,
    isOvernight,
  };
};

export const validateClientSchedule = (schedule) => {
  const errors = {};

  for (const { key, label } of DAYS_OF_WEEK) {
    const dayData = schedule?.[key];
    if (!dayData || !dayData.isOpen) continue;

    if (dayData.is24Hours) continue;

    if (!Array.isArray(dayData.intervals) || dayData.intervals.length === 0) {
      errors[key] = `${label} is marked open but has no operating intervals.`;
      continue;
    }

    const intervals = dayData.intervals;
    let dayError = null;

    for (let i = 0; i < intervals.length; i++) {
      const inv = intervals[i];
      if (!inv.open || !inv.close) {
        dayError = `Interval #${i + 1} has incomplete times.`;
        break;
      }
      if (inv.open === inv.close) {
        dayError = `Interval #${i + 1} cannot have identical open and close times (${inv.open}).`;
        break;
      }
    }

    if (dayError) {
      errors[key] = dayError;
      continue;
    }

    // Overlap validation
    const parsed = intervals.map((inv) => {
      const [oH, oM] = inv.open.split(":").map(Number);
      const [cH, cM] = inv.close.split(":").map(Number);
      const startMin = oH * 60 + oM;
      const closeMin = cH * 60 + cM;
      const endMin = inv.close === "00:00" ? 1440 : closeMin;
      const isOvernight = inv.close !== "00:00" && closeMin < startMin;
      return { ...inv, startMin, endMin, isOvernight };
    });

    parsed.sort((a, b) => a.startMin - b.startMin);

    for (let i = 0; i < parsed.length - 1; i++) {
      const curr = parsed[i];
      const next = parsed[i + 1];
      const currEnd = curr.isOvernight ? 1440 : curr.endMin;

      if (currEnd > next.startMin) {
        dayError = `Overlapping intervals: [${curr.open} - ${curr.close}] overlaps with [${next.open} - ${next.close}].`;
        break;
      }
    }

    if (dayError) {
      errors[key] = dayError;
    }
  }

  return errors;
};

export const getTodayOperatingHoursSummary = (center) => {
  if (!center) return "Hours not specified";

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayIndex = new Date().getDay();
  const todayKey = dayNames[todayIndex];

  // 1. Structured weekly schedule check
  if (
    center.weeklySchedule &&
    typeof center.weeklySchedule === "object" &&
    center.weeklySchedule[todayKey]
  ) {
    const today = center.weeklySchedule[todayKey];
    if (!today.isOpen) {
      return "Closed today";
    }
    if (today.is24Hours) {
      return "Open 24 hours today";
    }
    if (Array.isArray(today.intervals) && today.intervals.length > 0) {
      if (today.intervals.length === 1) {
        const inv = today.intervals[0];
        const isOvernight =
          inv.isOvernight || (inv.close !== "00:00" && inv.close < inv.open);
        return isOvernight
          ? `Open ${inv.open} – ${inv.close} (Overnight)`
          : `Open ${inv.open} – ${inv.close} today`;
      }
      const shifts = today.intervals
        .map((i) => `${i.open}–${i.close}`)
        .join(", ");
      return `Open today: ${shifts}`;
    }
  }

  // 2. Fallback to legacy fields
  if (center.is24Hours) {
    return "Open 24 hours today";
  }

  if (center.openingTime && center.closingTime) {
    const isOvernight =
      center.closingTime !== "00:00" && center.closingTime < center.openingTime;
    return isOvernight
      ? `Open ${center.openingTime} – ${center.closingTime} (Overnight)`
      : `Open ${center.openingTime} – ${center.closingTime} today`;
  }

  return "Operating hours not specified";
};
