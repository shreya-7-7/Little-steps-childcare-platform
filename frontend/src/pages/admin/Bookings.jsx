import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Search, X, Filter } from "lucide-react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";

import BookingTable from "../../components/admin/bookings/BookingTable";
import BookingDetailsDialog from "../../components/admin/bookings/BookingDetailsDialog";

import { getAllBookings } from "../../services/adminService";

import { Input } from "@/components/ui/input";

import { useTheme } from "../../context/ThemeContext";

const filterOptions = ["All", "Pending", "Approved", "Completed", "Rejected"];

const Bookings = () => {
  const { colors } = useTheme();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await getAllBookings();

      const bookingData = response.bookings || [];

      setBookings(bookingData);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

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
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const statusMatch =
        statusFilter === "All" ||
        booking.status?.toLowerCase() === statusFilter.toLowerCase();

      const parentName = booking.parent?.name?.toLowerCase() || "";
      const parentEmail = booking.parent?.email?.toLowerCase() || "";
      const centerName = booking.center?.centerName?.toLowerCase() || "";
      const childName = booking.childName?.toLowerCase() || "";

      const searchMatch =
        !query ||
        parentName.includes(query) ||
        parentEmail.includes(query) ||
        centerName.includes(query) ||
        childName.includes(query);

      return statusMatch && searchMatch;
    });
  }, [bookings, search, statusFilter]);

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setOpen(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #FF9500, #FFC300)",
                color: "#241C0F",
              }}
            >
              <CalendarCheck className="h-5 w-5" />
            </div>

            <div>
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{
                  color: colors.text,
                  fontFamily: "Fraunces, serif",
                }}
              >
                Bookings
              </h1>

              <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
                Manage and review all platform bookings across all childcare centers.
              </p>
            </div>
          </div>
        </div>

        {/* Total Stats Summary */}
        <div
          className="rounded-xl border px-4 py-3"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <p
            className="text-xs font-medium"
            style={{ color: colors.textMuted }}
          >
            Total Bookings
          </p>

          <p
            className="mt-0.5 text-xl font-bold"
            style={{ color: colors.text }}
          >
            {bookings.length}
          </p>
        </div>
      </div>

      {/* Search / Filter Toolbar */}
      <div
        className="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="relative w-full sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: colors.textMuted }}
          />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by parent, child or center..."
            className="h-11 rounded-xl pl-10 pr-9 shadow-none"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div
          className="flex flex-wrap gap-1.5 rounded-2xl border p-1"
          style={{
            backgroundColor: colors.bg,
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

      {/* Filter summary count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Showing{" "}
          <span className="font-semibold" style={{ color: colors.text }}>
            {filteredBookings.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold" style={{ color: colors.text }}>
            {bookings.length}
          </span>{" "}
          bookings
          {statusFilter !== "All" && (
            <span> · Filter: <strong className="text-orange-600 dark:text-orange-400">{statusFilter}</strong></span>
          )}
        </p>

        {(statusFilter !== "All" || search) && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter("All");
              setSearch("");
            }}
            className="text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table or Empty Filter State */}
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
            No bookings match your current status filter ({statusFilter})
            {search ? ` or search query "${search}"` : ""}.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("All");
              setSearch("");
            }}
            className="mt-4 inline-flex items-center rounded-xl bg-orange-100 px-4 py-2 text-xs font-semibold text-orange-800 transition-colors hover:bg-orange-200 dark:bg-orange-950/40 dark:text-orange-300"
          >
            Reset Filters & Search
          </button>
        </div>
      ) : (
        <BookingTable bookings={filteredBookings} onView={handleView} />
      )}

      {/* Details Dialog */}
      <BookingDetailsDialog
        open={open}
        onOpenChange={setOpen}
        booking={selectedBooking}
      />
    </motion.section>
  );
};

export default Bookings;
