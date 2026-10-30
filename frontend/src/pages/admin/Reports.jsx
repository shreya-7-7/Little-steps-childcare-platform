import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Filter,
  RotateCcw,
  Info,
  CalendarRange,
  AlertTriangle,
  RefreshCw,
  Clock,
} from "lucide-react";

import Loading from "../../components/common/Loading";
import OverviewCards from "../../components/admin/reports/OverviewCards";
import RevenueChart from "../../components/admin/reports/RevenueChart";
import BookingChart from "../../components/admin/reports/BookingChart";
import SubscriptionChart from "../../components/admin/reports/SubscriptionChart";

import {
  getOverviewReport,
  getRevenueReport,
  getBookingReport,
  getSubscriptionReport,
} from "../../services/adminService";
import { useTheme } from "../../context/ThemeContext";

const Reports = () => {
  const { colors } = useTheme();
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Form input state
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [dateBasisInput, setDateBasisInput] = useState("serviceDate"); // "serviceDate" or "createdAt"

  // Applied filter state (triggers actual fetch)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    dateBasis: "serviceDate",
  });

  // Report data states
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  // Client-side date validation
  const validationError = useMemo(() => {
    if (startDateInput && endDateInput) {
      const start = new Date(startDateInput);
      const end = new Date(endDateInput);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start > end) {
        return "End date cannot be earlier than start date.";
      }
    }
    return null;
  }, [startDateInput, endDateInput]);

  const hasActiveFilters = Boolean(
    appliedFilters.startDate ||
      appliedFilters.endDate ||
      appliedFilters.dateBasis !== "serviceDate"
  );

  const fetchReports = async (filtersToUse = appliedFilters) => {
    try {
      setRefreshing(true);
      setError(null);

      const params = {};
      if (filtersToUse.startDate) params.startDate = filtersToUse.startDate;
      if (filtersToUse.endDate) params.endDate = filtersToUse.endDate;
      if (filtersToUse.dateBasis === "createdAt") {
        params.dateBasis = "createdAt";
      }

      const [overviewRes, revenueRes, bookingRes, subscriptionRes] =
        await Promise.all([
          getOverviewReport(params),
          getRevenueReport(params),
          getBookingReport(params),
          getSubscriptionReport(params),
        ]);

      setOverview(overviewRes.overview || overviewRes.report || null);
      setRevenue(revenueRes.monthlyRevenue || revenueRes.report || []);
      setBookings(bookingRes.chartData || bookingRes.report || []);
      setSubscriptions(
        subscriptionRes.chartData || subscriptionRes.report || []
      );
    } catch (err) {
      console.error("Report fetch error:", err);
      const msg = err.response?.data?.message || "Failed to load reports";
      setError(msg);
      toast.error(msg);
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(appliedFilters);
  }, [appliedFilters]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setAppliedFilters({
      startDate: startDateInput,
      endDate: endDateInput,
      dateBasis: dateBasisInput,
    });
  };

  const handleResetFilters = () => {
    setStartDateInput("");
    setEndDateInput("");
    setDateBasisInput("serviceDate");
    setAppliedFilters({
      startDate: "",
      endDate: "",
      dateBasis: "serviceDate",
    });
    toast.info("Report filters reset to all-time view");
  };

  // Quick preset helpers
  const applyPreset = (preset) => {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    let start = "";
    let end = formatDate(today);

    if (preset === "today") {
      start = formatDate(today);
    } else if (preset === "last7") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      start = formatDate(d);
    } else if (preset === "thisMonth") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      start = formatDate(d);
    } else if (preset === "last30") {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      start = formatDate(d);
    } else if (preset === "allTime") {
      handleResetFilters();
      return;
    }

    setStartDateInput(start);
    setEndDateInput(end);
    setAppliedFilters({
      startDate: start,
      endDate: end,
      dateBasis: dateBasisInput,
    });
  };

  if (initialLoading) return <Loading />;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: colors.text, fontFamily: "Fraunces, serif" }}
          >
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            Audited financial, booking, and membership analytics with custom date range filtering.
          </p>
        </div>

        <button
          onClick={() => fetchReports(appliedFilters)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-neutral-50 self-start sm:self-auto"
          style={{
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: colors.surface,
          }}
          title="Refresh current report view"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Date Filter Panel */}
      <div
        className="rounded-2xl p-6 border shadow-sm transition-all"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: colors.border }}>
          <CalendarRange className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold" style={{ color: colors.text }}>
            Filter Report Period
          </h2>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs font-semibold mr-1" style={{ color: colors.textMuted }}>
            Quick Range:
          </span>
          {[
            { id: "today", label: "Today" },
            { id: "last7", label: "Last 7 Days" },
            { id: "thisMonth", label: "This Month" },
            { id: "last30", label: "Last 30 Days" },
            { id: "allTime", label: "All Time" },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-colors hover:border-amber-400"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Date Inputs Form */}
        <form onSubmit={handleApplyFilters} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: colors.text }}>
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500"
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: colors.text }}>
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500"
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
              </div>
            </div>

            {/* Date Basis Option */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: colors.text }}>
                Date Basis (Bookings & Subscriptions)
              </label>
              <select
                value={dateBasisInput}
                onChange={(e) => setDateBasisInput(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500"
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <option value="serviceDate">Service / Start Date (Default)</option>
                <option value="createdAt">Submission / Creation Date</option>
              </select>
            </div>
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={Boolean(validationError) || refreshing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                {refreshing ? "Applying..." : "Apply Filters"}
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border hover:bg-neutral-100 transition"
                style={{
                  borderColor: colors.border,
                  color: colors.textMuted,
                  backgroundColor: colors.surface,
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Active Range Indicator Pill */}
            <div className="text-xs font-medium px-3 py-1.5 rounded-full border bg-amber-50/70 border-amber-200 text-amber-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {hasActiveFilters ? (
                  <>
                    Viewing:{" "}
                    <strong>
                      {appliedFilters.startDate || "Beginning"} → {appliedFilters.endDate || "Present"}
                    </strong>{" "}
                    ({appliedFilters.dateBasis === "createdAt" ? "Submission Date" : "Service Date"})
                  </>
                ) : (
                  <>Viewing: <strong>All-Time Cumulative Data</strong></>
                )}
              </span>
            </div>
          </div>
        </form>

        {/* Date Semantics Disclaimer Card */}
        <div
          className="mt-5 p-3.5 rounded-xl border text-xs leading-relaxed"
          style={{
            backgroundColor: "#FFF9EE",
            borderColor: "#F5E6CC",
            color: "#6B4E17",
          }}
        >
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-900">
                Audited Metric Date Semantics:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-950">
                <li>
                  <strong>Revenue</strong>: Realized on payment settlement date (<code>paidAt</code>, excluding pending/failed payments).
                </li>
                <li>
                  <strong>Bookings</strong>: Filtered by scheduled care service date (<code>bookingDate</code>) by default, or order submission date when selected. <em>Note: The childcare booking lifecycle does not track an immutable <code>completedAt</code> timestamp.</em>
                </li>
                <li>
                  <strong>Subscriptions</strong>: Filtered by membership coverage start date (<code>startDate</code>) by default, or creation date when selected.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Error state alert if API fails */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
          <button
            onClick={() => fetchReports(appliedFilters)}
            className="text-xs font-bold underline hover:text-red-950"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Reports Content */}
      <div className={`space-y-8 transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}>
        <OverviewCards data={overview} />
        <RevenueChart data={revenue} />
        <BookingChart data={bookings} />
        <SubscriptionChart data={subscriptions} />
      </div>
    </div>
  );
};

export default Reports;
