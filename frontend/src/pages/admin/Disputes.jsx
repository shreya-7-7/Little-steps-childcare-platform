import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  X,
  FileText,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { getAdminDisputes, updateDisputeStatus } from "@/services/disputeService";

const STATUS_OPTIONS = ["All", "Open", "UnderReview", "Resolved", "Rejected"];
const CATEGORY_OPTIONS = [
  "All",
  "Safety",
  "Facility",
  "Staff Behavior",
  "Billing/Pricing",
  "Cancellation/Schedule",
  "Other",
];

const STATUS_BADGES = {
  Open: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  UnderReview: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  Resolved: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

const AdminDisputes = () => {
  const { colors } = useTheme();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Review modal state
  const [activeDispute, setActiveDispute] = useState(null);
  const [newStatus, setNewStatus] = useState("Open");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter, categoryFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (categoryFilter !== "All") params.category = categoryFilter;

      const data = await getAdminDisputes(params);
      setDisputes(data.disputes || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (dispute) => {
    setActiveDispute(dispute);
    setNewStatus(dispute.status);
    setResolutionNotes(dispute.resolutionNotes || "");
    setInternalNotes(dispute.internalNotes || dispute.adminNotes || "");
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!activeDispute) return;

    try {
      setSaving(true);
      await updateDisputeStatus(activeDispute._id, {
        status: newStatus,
        resolutionNotes: resolutionNotes.trim(),
        internalNotes: internalNotes.trim(),
      });

      toast.success("Dispute status and resolution notes updated successfully");
      setActiveDispute(null);
      fetchDisputes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update dispute status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: colors.text, fontFamily: "Fraunces, serif" }}
        >
          Dispute Management
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
          Review, investigate, and record official resolutions for parent booking concerns.
        </p>
      </div>

      {/* Filters Bar */}
      <div
        className="flex flex-wrap items-center gap-4 rounded-2xl border p-4 shadow-sm"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#FF9500]" />
          <span className="text-xs font-semibold" style={{ color: colors.text }}>
            Filters:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: colors.textMuted }}>
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#F0E1BE] bg-white px-2.5 py-1.5 text-xs focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#2A2210]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: colors.textMuted }}>
            Category:
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-[#F0E1BE] bg-white px-2.5 py-1.5 text-xs focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#2A2210]"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Disputes Table */}
      {loading ? (
        <Loading />
      ) : disputes.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-3 text-lg font-bold" style={{ color: colors.text }}>
            No Disputes Found
          </h2>
          <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            There are no disputes matching the selected status and category filters.
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl border shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className="border-b uppercase text-[11px] font-semibold"
                style={{
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.border,
                  color: colors.textMuted,
                }}
              >
                <tr>
                  <th className="px-4 py-3">Dispute / Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3">Center</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: colors.border }}>
                {disputes.map((d) => (
                  <tr
                    key={d._id}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold" style={{ color: colors.text }}>
                      <div className="truncate max-w-[200px]" title={d.title}>
                        {d.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {d.category}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.text }}>
                      <div>{d.parent?.name || "Parent"}</div>
                      <div className="text-[10px]" style={{ color: colors.textMuted }}>
                        {d.parent?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.text }}>
                      {d.center?.centerName || "Center"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 font-semibold text-[11px] ${
                          STATUS_BADGES[d.status] || STATUS_BADGES.Open
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px]" style={{ color: colors.textMuted }}>
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReviewModal(d)}
                        className="h-8 gap-1.5 text-xs font-semibold"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Resolution Modal */}
      <AnimatePresence>
        {activeDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl border bg-white p-6 shadow-2xl dark:bg-[#211B10]"
              style={{ borderColor: colors.border }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#FF9500]" />
                  <h3 className="font-bold text-base" style={{ color: colors.text }}>
                    Review Dispute: {activeDispute.category}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDispute(null)}
                  className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <h4 className="font-bold text-sm" style={{ color: colors.text }}>
                    {activeDispute.title}
                  </h4>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl whitespace-pre-wrap">
                    {activeDispute.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50/50 dark:bg-gray-900/20 p-3 rounded-xl">
                  <div>
                    <span className="text-gray-500">Parent:</span>{" "}
                    <strong>{activeDispute.parent?.name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Center:</span>{" "}
                    <strong>{activeDispute.center?.centerName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Child:</span>{" "}
                    <strong>{activeDispute.booking?.childName || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Booking Plan:</span>{" "}
                    <strong>{activeDispute.booking?.planType || "N/A"}</strong>
                  </div>
                </div>

                <form onSubmit={handleSaveResolution} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold" style={{ color: colors.text }}>
                      Update Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#F0E1BE] bg-white p-2 text-xs focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D]"
                    >
                      <option value="Open">Open</option>
                      <option value="UnderReview">UnderReview</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Official Resolution Note (Visible to Parent)
                    </label>
                    <textarea
                      rows={2}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Communicated directly to parent upon status update..."
                      maxLength={2000}
                      className="mt-1 w-full rounded-xl border border-blue-200 bg-white p-2.5 text-xs focus:border-[#FF9500] focus:outline-none dark:border-blue-900 dark:bg-[#1A150D]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      <Lock className="h-3 w-3" />
                      Internal Staff Notes (Admin Only - Confidential)
                    </label>
                    <textarea
                      rows={2}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Confidential investigation findings, phone logs, or internal audit remarks..."
                      maxLength={2000}
                      className="mt-1 w-full rounded-xl border border-amber-200 bg-white p-2.5 text-xs focus:border-[#FF9500] focus:outline-none dark:border-amber-900 dark:bg-[#1A150D]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveDispute(null)}
                      className="text-xs h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F] text-xs h-9 font-semibold"
                    >
                      {saving ? "Saving..." : "Save Resolution"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDisputes;
