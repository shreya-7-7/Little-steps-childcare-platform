import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";
import { getMyDisputes } from "../../services/disputeService";
import { useTheme } from "../../context/ThemeContext";

const STATUS_BADGES = {
  Open: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  UnderReview: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  Resolved: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

const MyDisputes = () => {
  const { colors } = useTheme();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const data = await getMyDisputes();
      setDisputes(data.disputes || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
          My Disputes & Inquiries
        </h1>
        <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
          Track formal concerns and investigation status regarding your childcare bookings.
        </p>
      </div>

      {/* Disputes List */}
      {disputes.length === 0 ? (
        <div
          className="rounded-3xl p-12 text-center"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borderAccent}`,
          }}
        >
          <ShieldAlert className="mx-auto h-12 w-12 text-[#FF9500]/60" />
          <h2 className="mt-4 text-xl font-bold" style={{ color: colors.text }}>
            No Active Disputes
          </h2>
          <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
            You haven't filed any disputes. If an issue occurs with a booking, you can submit a concern directly from that booking's detail page.
          </p>
          <div className="mt-6">
            <Link
              to="/parent/my-bookings"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF9500] to-[#FFC300] px-5 text-sm font-semibold text-[#241C0F]"
            >
              View My Bookings
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          {disputes.map((d) => {
            const displayNote = d.resolutionNotes || d.adminNotes;
            return (
              <motion.div
                key={d._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[#F0E1BE] bg-white p-5 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0E1BE]/60 pb-3 dark:border-[#3A2E17]/60">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {d.category || "Concern"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_BADGES[d.status] || STATUS_BADGES.Open
                      }`}
                    >
                      {d.status || "Open"}
                    </span>
                  </div>
                  <span className="text-xs text-[#8C7A5E] dark:text-[#A8987E]">
                    Submitted: {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <h3 className="text-lg font-bold text-[#241C0F] dark:text-[#FFF6E2]">
                    {d.title}
                  </h3>

                  <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
                    Center: <strong>{d.center?.centerName || "Childcare Center"}</strong>
                    {d.booking?.childName && (
                      <span> • Child: {d.booking.childName}</span>
                    )}
                    {d.booking?.planType && (
                      <span> • Plan: {d.booking.planType}</span>
                    )}
                    {d.booking?.bookingDate && (
                      <span> • Service Date: {new Date(d.booking.bookingDate).toLocaleDateString()}</span>
                    )}
                  </p>

                  <p className="text-sm text-[#4A3E2C] dark:text-[#D6C7A8] whitespace-pre-wrap">
                    {d.description}
                  </p>

                  {displayNote && (
                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200">
                      <p className="font-semibold">Official Resolution Note:</p>
                      <p className="mt-1">{displayNote}</p>
                      {d.resolvedAt && (
                        <p className="mt-1 text-[11px] opacity-75">
                          Resolved on {new Date(d.resolvedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDisputes;
