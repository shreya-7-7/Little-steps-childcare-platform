import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Search, CreditCard, X } from "lucide-react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";

import SubscriptionTable from "../../components/admin/subscriptions/SubscriptionTable";
import SubscriptionDetailsDialog from "../../components/admin/subscriptions/SubscriptionDetailsDialog";

import { getAllSubscriptions } from "../../services/adminService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "../../context/ThemeContext";

const Subscriptions = () => {
  const { colors } = useTheme();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchSubscriptions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAllSubscriptions();
      setSubscriptions(response.subscriptions || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load subscriptions",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return subscriptions;

    return subscriptions.filter((subscription) => {
      // Safe multi-field extraction handling populated objects or plain IDs
      const parentName =
        typeof subscription.parent === "object"
          ? subscription.parent?.name?.toLowerCase() || ""
          : "";

      const parentEmail =
        typeof subscription.parent === "object"
          ? subscription.parent?.email?.toLowerCase() || ""
          : "";

      const centerName =
        typeof subscription.center === "object"
          ? (subscription.center?.centerName || subscription.center?.name || "")?.toLowerCase()
          : (subscription.centerName || "")?.toLowerCase();

      const planType = (subscription.planType || "")?.toLowerCase();
      const status = (subscription.status || "")?.toLowerCase();

      return (
        parentName.includes(query) ||
        parentEmail.includes(query) ||
        centerName.includes(query) ||
        planType.includes(query) ||
        status.includes(query)
      );
    });
  }, [subscriptions, search]);

  const handleView = (subscription) => {
    setSelectedSubscription(subscription);
    setOpen(true);
  };

  const handleRefresh = () => {
    fetchSubscriptions(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-7"
    >
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
            <CreditCard className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: colors.text }}>
              Subscriptions
            </h1>

            <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
              Manage and monitor all platform subscriptions and membership plans.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-10 gap-2 rounded-xl border transition-colors hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20"
          style={{ borderColor: colors.border, color: colors.text }}
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Search Toolbar */}
      <div
        className="rounded-2xl border p-4 shadow-sm"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Search by parent name, email, center, or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl pl-10 pr-9 focus-visible:ring-orange-500"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.text,
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Showing{" "}
              <span className="font-semibold" style={{ color: colors.text }}>
                {filteredSubscriptions.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold" style={{ color: colors.text }}>
                {subscriptions.length}
              </span>{" "}
              subscriptions
            </p>

            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearch("")}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                Clear Search
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <SubscriptionTable
        subscriptions={filteredSubscriptions}
        totalCount={subscriptions.length}
        searchQuery={search}
        onClearSearch={() => setSearch("")}
        onView={handleView}
      />

      {/* Details Dialog */}
      <SubscriptionDetailsDialog
        open={open}
        onOpenChange={setOpen}
        subscription={selectedSubscription}
      />
    </motion.section>
  );
};

export default Subscriptions;
