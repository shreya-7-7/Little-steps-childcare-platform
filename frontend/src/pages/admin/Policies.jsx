import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Filter,
  CheckCircle2,
  Edit,
  Trash2,
  Globe,
  FileCode,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import {
  getAdminPolicies,
  createPolicy,
  updatePolicy,
  togglePolicyPublication,
  deletePolicy,
} from "@/services/policyService";

const CATEGORIES = ["Safety", "Terms", "Privacy", "Guidelines", "General"];
const STATUS_OPTIONS = ["All", "published", "draft"];

const AdminPolicies = () => {
  const { colors } = useTheme();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Safety",
    status: "draft",
    summary: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter, categoryFilter]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (categoryFilter !== "All") params.category = categoryFilter;

      const data = await getAdminPolicies(params);
      setPolicies(data.policies || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPolicy(null);
    setFormData({
      title: "",
      slug: "",
      category: "Safety",
      status: "draft",
      summary: "",
      content: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      slug: policy.slug,
      category: policy.category || "Safety",
      status: policy.status || "draft",
      summary: policy.summary || "",
      content: policy.content,
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (!editingPolicy) {
      // Auto-slugify on title input if creating new
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, title: val, slug: autoSlug }));
    } else {
      setFormData((prev) => ({ ...prev, title: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || formData.title.trim().length < 3) {
      toast.error("Title must be at least 3 characters.");
      return;
    }
    if (!formData.content || formData.content.trim().length < 10) {
      toast.error("Content must be at least 10 characters.");
      return;
    }

    try {
      setSaving(true);
      if (editingPolicy) {
        await updatePolicy(editingPolicy._id, formData);
        toast.success("Policy updated successfully.");
      } else {
        await createPolicy(formData);
        toast.success("Policy created successfully.");
      }
      setIsModalOpen(false);
      fetchPolicies();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save policy.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (policy) => {
    try {
      const nextStatus = policy.status === "published" ? "draft" : "published";
      await togglePolicyPublication(policy._id, nextStatus);
      toast.success(
        nextStatus === "published" ? "Policy published live." : "Policy moved to draft."
      );
      fetchPolicies();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await deletePolicy(id);
      toast.success("Policy deleted successfully.");
      setDeletingId(null);
      fetchPolicies();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete policy.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: colors.text, fontFamily: "Fraunces, serif" }}
          >
            Safety & Platform Policies
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            Manage safety standards, community guidelines, terms, and published content pages.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="gap-2 bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F]"
        >
          <Plus className="h-4 w-4" />
          Create Policy
        </Button>
      </div>

      {/* Filter Bar */}
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
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Policies Table */}
      {loading ? (
        <Loading />
      ) : policies.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <FileText className="mx-auto h-12 w-12 text-amber-500/60" />
          <h2 className="mt-3 text-lg font-bold" style={{ color: colors.text }}>
            No Policies Found
          </h2>
          <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            Create your first safety policy or guideline to publish it on the platform.
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
                  <th className="px-4 py-3">Title & Slug</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: colors.border }}>
                {policies.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3" style={{ color: colors.text }}>
                      <div className="font-semibold text-sm">{p.title}</div>
                      <div className="font-mono text-[11px] text-[#8C7A5E] dark:text-[#A8987E]">
                        /policies/{p.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-semibold text-[11px] ${
                          p.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px]" style={{ color: colors.textMuted }}>
                      <div>{new Date(p.updatedAt).toLocaleDateString()}</div>
                      {p.updatedBy?.name && (
                        <div className="text-[10px]">by {p.updatedBy.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePublish(p)}
                          className="h-8 gap-1 text-[11px] font-semibold"
                          title={p.status === "published" ? "Unpublish" : "Publish"}
                        >
                          <Globe className="h-3 w-3" />
                          {p.status === "published" ? "Unpublish" : "Publish"}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(p)}
                          className="h-8 gap-1 text-[11px] font-semibold"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>

                        {deletingId === p._id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteConfirm(p._id)}
                              className="h-8 text-[11px] px-2"
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingId(null)}
                              className="h-8 text-[11px] px-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingId(p._id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            title="Delete policy"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-2xl dark:bg-[#211B10]"
              style={{ borderColor: colors.border }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: colors.border }}>
                <h3 className="font-bold text-base" style={{ color: colors.text }}>
                  {editingPolicy ? "Edit Policy" : "Create New Policy"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold" style={{ color: colors.text }}>
                      Policy Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={handleTitleChange}
                      placeholder="e.g. 24/7 Childcare Safety Protocol"
                      maxLength={200}
                      required
                      className="mt-1 w-full rounded-xl border border-[#F0E1BE] bg-white p-2.5 text-xs focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold" style={{ color: colors.text }}>
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        }))
                      }
                      placeholder="e.g. safety-protocol"
                      required
                      className="mt-1 w-full rounded-xl border border-[#F0E1BE] bg-white p-2.5 text-xs font-mono focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold" style={{ color: colors.text }}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[#F0E1BE] bg-white p-2.5 text-xs focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold" style={{ color: colors.text }}>
                      Publication Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[#F0E1BE] bg-white p-2.5 text-xs focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D]"
                    >
                      <option value="draft">Draft (Internal Only)</option>
                      <option value="published">Published (Live to Public)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold" style={{ color: colors.text }}>
                    Summary / Overview (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.summary}
                    onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief 1-2 sentence description shown in policy feeds..."
                    maxLength={500}
                    className="mt-1 w-full rounded-xl border border-[#F0E1BE] bg-white p-2.5 text-xs focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold" style={{ color: colors.text }}>
                    Policy Content / Body *
                  </label>
                  <textarea
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Full policy text, safety requirements, verification procedures..."
                    required
                    className="mt-1 w-full rounded-xl border border-[#F0E1BE] bg-white p-2.5 text-xs font-sans leading-relaxed focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: colors.border }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F] text-xs h-9 font-semibold"
                  >
                    {saving ? "Saving..." : editingPolicy ? "Save Changes" : "Create Policy"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPolicies;
