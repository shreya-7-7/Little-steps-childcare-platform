import { Clock, Moon, Check, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const getDisplaySchedule = (center) => {
  if (!center) return null;

  if (center.weeklySchedule && Object.keys(center.weeklySchedule).length > 0) {
    return { schedule: center.weeklySchedule, isCustom: true };
  }

  const is24 = Boolean(center.is24Hours);
  const openTime = center.openingTime || "08:00";
  const closeTime = center.closingTime || "18:00";
  const [oH, oM] = openTime.split(":").map(Number);
  const [cH, cM] = closeTime.split(":").map(Number);
  const isOvernight =
    is24 ? false : closeTime !== "00:00" && (cH * 60 + cM) < (oH * 60 + oM);

  const defaultDay = is24
    ? {
        isOpen: true,
        is24Hours: true,
        intervals: [{ open: "00:00", close: "23:59", isOvernight: false }],
      }
    : {
        isOpen: true,
        is24Hours: false,
        intervals: [{ open: openTime, close: closeTime, isOvernight }],
      };

  return {
    schedule: {
      monday: { ...defaultDay, intervals: [...defaultDay.intervals] },
      tuesday: { ...defaultDay, intervals: [...defaultDay.intervals] },
      wednesday: { ...defaultDay, intervals: [...defaultDay.intervals] },
      thursday: { ...defaultDay, intervals: [...defaultDay.intervals] },
      friday: { ...defaultDay, intervals: [...defaultDay.intervals] },
      saturday: is24
        ? { ...defaultDay, intervals: [...defaultDay.intervals] }
        : { isOpen: false, is24Hours: false, intervals: [] },
      sunday: is24
        ? { ...defaultDay, intervals: [...defaultDay.intervals] }
        : { isOpen: false, is24Hours: false, intervals: [] },
    },
    isCustom: false,
  };
};

const WeeklyScheduleDisplay = ({ center }) => {
  const { colors } = useTheme();
  const displayData = getDisplaySchedule(center);

  if (!displayData) return null;
  const { schedule, isCustom } = displayData;

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: colors.surface,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          <h3 className="font-bold text-lg" style={{ color: colors.text }}>
            Weekly Operating Schedule
          </h3>
        </div>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            isCustom
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          {isCustom ? "Custom Schedule" : "General Hours"}
        </span>
      </div>

      <div className="divide-y divide-border/40">
        {DAYS.map(({ key, label }) => {
          const day = schedule[key] || { isOpen: false, is24Hours: false, intervals: [] };

          return (
            <div
              key={key}
              className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm"
            >
              <div className="flex items-center gap-2.5 w-32">
                <span className="font-medium capitalize" style={{ color: colors.text }}>
                  {label}
                </span>
              </div>

              <div className="flex-1 flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                {day.isOpen ? (
                  day.is24Hours ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <Check className="h-3 w-3" />
                      24 Hours Open
                    </span>
                  ) : day.intervals && day.intervals.length > 0 ? (
                    day.intervals.map((inv, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs font-mono bg-muted/60 px-2 py-0.5 rounded border border-border/50"
                        style={{ color: colors.text }}
                      >
                        {inv.open} – {inv.close}
                        {inv.isOvernight && (
                          <span
                            className="inline-flex items-center text-[10px] text-indigo-500 font-sans ml-1"
                            title="Closes next day"
                          >
                            <Moon className="h-2.5 w-2.5 mr-0.5" />
                            Overnight
                          </span>
                        )}
                        {inv.close === "00:00" && (
                          <span className="text-[10px] text-sky-500 font-sans ml-1">
                            (Midnight)
                          </span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No hours set</span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                    <X className="h-3 w-3" />
                    Closed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyScheduleDisplay;
