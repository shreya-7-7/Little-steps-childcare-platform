import { useMemo } from "react";
import { Plus, Trash2, Clock, Moon, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "../../context/ThemeContext";
import {
  normalizeScheduleInterval,
  validateClientSchedule,
} from "../../utils/scheduleValidation";

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const WeeklyScheduleEditor = ({ schedule, onChange, isLegacyFallback = false }) => {
  const { colors } = useTheme();

  const validationErrors = useMemo(() => {
    return validateClientSchedule(schedule);
  }, [schedule]);

  const handleToggleOpen = (dayKey) => {
    const current = schedule?.[dayKey] || { isOpen: false, is24Hours: false, intervals: [] };
    const nextIsOpen = !current.isOpen;

    onChange({
      ...schedule,
      [dayKey]: {
        isOpen: nextIsOpen,
        is24Hours: false,
        intervals: nextIsOpen
          ? current.intervals?.length > 0
            ? current.intervals
            : [{ open: "08:00", close: "18:00", isOvernight: false }]
          : [],
      },
    });
  };

  const handleToggle24Hours = (dayKey) => {
    const current = schedule?.[dayKey] || { isOpen: true, is24Hours: false, intervals: [] };
    const nextIs24 = !current.is24Hours;

    onChange({
      ...schedule,
      [dayKey]: {
        isOpen: true,
        is24Hours: nextIs24,
        intervals: nextIs24
          ? [{ open: "00:00", close: "23:59", isOvernight: false }]
          : [{ open: "08:00", close: "18:00", isOvernight: false }],
      },
    });
  };

  const handleIntervalChange = (dayKey, index, field, value) => {
    const current = schedule?.[dayKey];
    if (!current || !Array.isArray(current.intervals)) return;

    const newIntervals = current.intervals.map((inv, idx) => {
      if (idx !== index) return inv;
      const updated = { ...inv, [field]: value };
      const normalized = normalizeScheduleInterval(updated.open, updated.close);
      return { ...updated, isOvernight: normalized.isOvernight };
    });

    onChange({
      ...schedule,
      [dayKey]: {
        ...current,
        intervals: newIntervals,
      },
    });
  };

  const handleAddInterval = (dayKey) => {
    const current = schedule?.[dayKey] || { isOpen: true, is24Hours: false, intervals: [] };
    const intervals = current.intervals || [];

    let nextOpen = "13:00";
    let nextClose = "17:00";
    if (intervals.length > 0) {
      const last = intervals[intervals.length - 1];
      if (last.close !== "00:00" && last.close < "22:00") {
        nextOpen = last.close;
        const [h, m] = last.close.split(":").map(Number);
        const endH = Math.min(23, h + 4);
        nextClose = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      }
    }

    onChange({
      ...schedule,
      [dayKey]: {
        ...current,
        isOpen: true,
        is24Hours: false,
        intervals: [...intervals, { open: nextOpen, close: nextClose, isOvernight: false }],
      },
    });
  };

  const handleRemoveInterval = (dayKey, index) => {
    const current = schedule?.[dayKey];
    if (!current || !Array.isArray(current.intervals)) return;

    const remaining = current.intervals.filter((_, idx) => idx !== index);

    onChange({
      ...schedule,
      [dayKey]: {
        ...current,
        isOpen: remaining.length > 0,
        intervals: remaining,
      },
    });
  };

  const handleCopyMondayToWeekdays = () => {
    const mondayData = schedule?.monday || {
      isOpen: true,
      is24Hours: false,
      intervals: [{ open: "08:00", close: "18:00", isOvernight: false }],
    };

    const updated = { ...schedule };
    ["tuesday", "wednesday", "thursday", "friday"].forEach((d) => {
      updated[d] = JSON.parse(JSON.stringify(mondayData));
    });
    onChange(updated);
  };

  const handleCloseWeekends = () => {
    onChange({
      ...schedule,
      saturday: { isOpen: false, is24Hours: false, intervals: [] },
      sunday: { isOpen: false, is24Hours: false, intervals: [] },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Presets */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
              Weekly Operating Schedule
            </h3>
            {isLegacyFallback ? (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500 border border-amber-500/20">
                Populated from General Hours
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500 border border-emerald-500/20">
                Custom Schedule Active
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure each day independently, including multiple daily intervals and overnight operating hours.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyMondayToWeekdays}
            className="text-xs h-8"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy Mon to Weekdays
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCloseWeekends}
            className="text-xs h-8"
          >
            Close Weekends
          </Button>
        </div>
      </div>

      {/* Global Validation Banner if any day has error */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Schedule conflicts detected:</span>
            <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
              {Object.entries(validationErrors).map(([day, msg]) => (
                <li key={day}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Day by Day Cards */}
      <div className="grid gap-3.5">
        {DAYS_OF_WEEK.map(({ key, label }) => {
          const dayData = schedule?.[key] || { isOpen: false, is24Hours: false, intervals: [] };
          const errorMsg = validationErrors[key];

          return (
            <div
              key={key}
              className={`rounded-xl border p-4 transition-colors ${
                errorMsg
                  ? "border-destructive/60 bg-destructive/5"
                  : dayData.isOpen
                  ? "border-border bg-card"
                  : "border-border/60 bg-muted/20 opacity-80"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Day Label and Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-28 text-sm font-semibold capitalize" style={{ color: colors.text }}>
                    {label}
                  </span>

                  {/* Open / Closed Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleOpen(key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      dayData.isOpen
                        ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {dayData.isOpen ? (
                      <>
                        <Check className="h-3 w-3" />
                        Open
                      </>
                    ) : (
                      "Closed"
                    )}
                  </button>

                  {/* 24-Hours Toggle */}
                  {dayData.isOpen && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(dayData.is24Hours)}
                        onChange={() => handleToggle24Hours(key)}
                        className="rounded border-input text-primary h-3.5 w-3.5"
                      />
                      <span className="font-medium text-muted-foreground">Open 24 Hours</span>
                    </label>
                  )}
                </div>

                {/* Add Interval Action if open and not 24h */}
                {dayData.isOpen && !dayData.is24Hours && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddInterval(key)}
                    className="h-7 text-xs px-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Interval
                  </Button>
                )}
              </div>

              {/* Intervals Content */}
              {dayData.isOpen && !dayData.is24Hours && (
                <div className="mt-3.5 space-y-2.5 pt-3 border-t border-border/40">
                  {dayData.intervals?.map((interval, idx) => {
                    const isOvernight = interval.isOvernight;

                    return (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center gap-2.5 bg-background/50 p-2 rounded-lg border border-border/60"
                      >
                        <span className="text-xs font-medium text-muted-foreground w-16">
                          Shift {idx + 1}:
                        </span>

                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={interval.open}
                            onChange={(e) => handleIntervalChange(key, idx, "open", e.target.value)}
                            className="rounded-md border border-input bg-background px-2 py-1 text-xs font-mono shadow-sm"
                            required
                          />
                          <span className="text-xs text-muted-foreground">to</span>
                          <input
                            type="time"
                            value={interval.close}
                            onChange={(e) => handleIntervalChange(key, idx, "close", e.target.value)}
                            className="rounded-md border border-input bg-background px-2 py-1 text-xs font-mono shadow-sm"
                            required
                          />
                        </div>

                        {/* Overnight Indicator Badge */}
                        {isOvernight && (
                          <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-500 border border-indigo-500/20">
                            <Moon className="h-2.5 w-2.5" />
                            Overnight (next day)
                          </span>
                        )}

                        {/* Midnight Notice Badge */}
                        {interval.close === "00:00" && (
                          <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-500 border border-sky-500/20">
                            Midnight closing
                          </span>
                        )}

                        {/* Remove interval button */}
                        {dayData.intervals.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveInterval(key, idx)}
                            className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive"
                            title="Remove interval"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 24-Hour Day Notice */}
              {dayData.isOpen && dayData.is24Hours && (
                <div className="mt-2 pt-2 border-t border-border/30 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Continuous 24-hour childcare availability (00:00 – 23:59).
                </div>
              )}

              {/* Day Error Feedback */}
              {errorMsg && (
                <p className="mt-2 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errorMsg}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyScheduleEditor;
