import { CalendarDays, CreditCard, MapPin, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { useTheme } from "../../../context/ThemeContext";

const SubscriptionDetailsDialog = ({ open, onOpenChange, subscription }) => {
  const { colors } = useTheme();

  if (!subscription) return null;

  const status = subscription.status?.toLowerCase() || "pending";
  const isBadgeActive = status === "active";
  const isBadgeExpired = status === "expired";
  const isBadgeCancelled = status === "cancelled";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-xl"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <CreditCard className="h-5 w-5" />
            </span>
            Subscription Details
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Parent */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: colors.surfaceAlt }}
          >
            <div className="mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-orange-500" />
              <h3 className="font-semibold" style={{ color: colors.text }}>
                Parent Information
              </h3>
            </div>

            <p className="font-medium" style={{ color: colors.text }}>
              {subscription.parent?.name || "N/A"}
            </p>

            <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
              {subscription.parent?.email || "N/A"}
            </p>
          </div>

          {/* Center */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: colors.surfaceAlt }}
          >
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <h3 className="font-semibold" style={{ color: colors.text }}>
                Center Information
              </h3>
            </div>

            <p className="font-medium" style={{ color: colors.text }}>
              {subscription.center?.centerName || subscription.center?.name || "N/A"}
            </p>

            <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
              {subscription.center?.city || "N/A"}
            </p>
          </div>

          {/* Plan */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: colors.surfaceAlt }}
          >
            <h3 className="mb-3 font-semibold" style={{ color: colors.text }}>
              Plan Details
            </h3>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                Plan
              </span>
              <span className="mt-1 block font-semibold capitalize" style={{ color: colors.text }}>
                {subscription.planType || "N/A"}
              </span>
            </div>

            <div className="mt-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                Amount
              </span>
              <span className="mt-1 block text-lg font-bold text-orange-600 dark:text-orange-400">
                ₹{subscription.amount ?? 0}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: colors.surfaceAlt }}
          >
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-orange-500" />
              <h3 className="font-semibold" style={{ color: colors.text }}>
                Subscription Period
              </h3>
            </div>

            <p className="text-sm" style={{ color: colors.text }}>
              <span className="font-medium">Start Date: </span>
              {subscription.startDate
                ? new Date(subscription.startDate).toLocaleDateString()
                : "N/A"}
            </p>

            <p className="mt-1 text-sm" style={{ color: colors.text }}>
              <span className="font-medium">End Date: </span>
              {subscription.endDate
                ? new Date(subscription.endDate).toLocaleDateString()
                : "N/A"}
            </p>

            <div className="mt-4">
              <Badge
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isBadgeActive
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : isBadgeExpired
                      ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      : isBadgeCancelled
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                }`}
              >
                {subscription.status || "Pending"}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDetailsDialog;
