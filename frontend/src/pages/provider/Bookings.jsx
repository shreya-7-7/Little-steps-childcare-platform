import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, X, Filter } from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import ProviderBookingTable from "@/components/provider/booking/ProviderBookingTable";

import { getProviderBookings } from "@/services/bookingService";
import { useTheme } from "../../context/ThemeContext";

const filterOptions = ["All", "Pending", "Approved", "Completed", "Rejected"];

const Bookings = () => {
  const { colors } = useTheme();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBookings = async () => {
    try {
      const data = await getProviderBookings();
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const counts = useMemo(() => {
    const res = {
      All: bookings.length,
      Pending: 0,
      Approved: 0,
      Completed: 0,
      Rejected: 0,
    };
    bookings.forEach((b) => {
      const s = b.status?.toLowerCase();
      if (s === "pending") res.Pending++;
      else if (s === "approved") res.Approved++;
      else if (s === "completed") res.Completed++;
      else if (s === "rejected") res.Rejected++;
    });
    return res;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const statusMatch =
        statusFilter === "All" ||
        b.status?.toLowerCase() === statusFilter.toLowerCase();

      const q = searchTerm.trim().toLowerCase();
      const childName = (b.childName || "").toLowerCase();
      const parentName = (b.parent?.name || "").toLowerCase();
      const searchMatch = !q || childName.includes(q) || parentName.includes(q);

      return statusMatch && searchMatch;
    });
  }, [bookings, statusFilter, searchTerm]);

  if (loading) return <Loading />;

  const pendingCount = counts.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: colors.text, fontFamily: "Fraunces, serif" }}
          >
            Booking management
          </h1>
          <p style={{ color: colors.textMuted }}>
            Manage all booking requests for your centers.
          </p>
        </div>

        {bookings.length > 0 && (
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {bookings.length} total ·{" "}
            <span style={{ color: colors.text, fontWeight: 600 }}>
              {pendingCount} awaiting response
            </span>
          </p>
        )}
      </div>

      {bookings.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed py-16 text-center"
          style={{ borderColor: colors.border }}
        >
          <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
            No bookings yet
          </h2>
          <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
            New requests from families will show up here as soon as they come in.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls: Search & Filter Tabs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: colors.textMuted }}
              />
              <input
                type="text"
                placeholder="Search child or parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border py-2.5 pl-10 pr-9 text-sm transition-colors focus:border-orange-500 focus:outline-none"
                style={{
                  background: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div
              className="flex flex-wrap gap-1.5 rounded-2xl border p-1"
              style={{
                background: colors.surface,
                borderColor: colors.border,
              }}
            >
              {filterOptions.map((opt) => {
                const isActive = statusFilter === opt;
                const count = counts[opt] ?? 0;

                return (
                  <button
                    key={opt}
                    onClick={() => setStatusFilter(opt)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F] shadow-sm"
                        : "text-[#6B5D45] hover:bg-orange-50/50 dark:text-[#C9B896] dark:hover:bg-white/5"
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive
                          ? "bg-black/15 text-[#241C0F]"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtered Results Table or No Match Empty State */}
          {filteredBookings.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed py-14 text-center"
              style={{ borderColor: colors.border }}
            >
              <Filter className="mx-auto mb-3 h-8 w-8 text-orange-500 opacity-70" />
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                No matching bookings
              </h3>
              <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
                No bookings match your current filter ({statusFilter})
                {searchTerm ? ` or search term "${searchTerm}"` : ""}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("All");
                  setSearchTerm("");
                }}
                className="mt-4 inline-flex items-center rounded-xl bg-orange-100 px-4 py-2 text-xs font-semibold text-orange-800 transition-colors hover:bg-orange-200 dark:bg-orange-950/40 dark:text-orange-300"
              >
                Reset Filters & Search
              </button>
            </div>
          ) : (
            <ProviderBookingTable
              bookings={filteredBookings}
              refreshBookings={fetchBookings}
            />
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Bookings;
