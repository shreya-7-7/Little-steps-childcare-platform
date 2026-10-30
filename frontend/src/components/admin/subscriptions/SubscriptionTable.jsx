import { Eye, GraduationCap, SearchX } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "../../../context/ThemeContext";

const SubscriptionTable = ({
  subscriptions = [],
  totalCount = 0,
  searchQuery = "",
  onClearSearch,
  onView,
}) => {
  const { colors } = useTheme();

  // 1. Platform-wide empty state: No subscription records exist in system
  if (totalCount === 0) {
    return (
      <div
        className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          <GraduationCap className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          No Subscriptions Registered Yet
        </h3>

        <p className="mt-1.5 max-w-md text-sm" style={{ color: colors.textMuted }}>
          There are currently no active or historical subscription memberships registered across childcare centres. Once parents enroll in monthly or yearly plans, they will appear here.
        </p>
      </div>
    );
  }

  // 2. Search filter empty state: Subscriptions exist, but query yielded 0 results
  if (subscriptions.length === 0) {
    return (
      <div
        className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <SearchX className="h-6 w-6" />
        </div>

        <h3 className="text-base font-semibold" style={{ color: colors.text }}>
          No Subscriptions Found
        </h3>

        <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
          {searchQuery ? `No subscriptions match "${searchQuery}".` : "No subscriptions match the selected criteria."}
        </p>

        {onClearSearch && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSearch}
            className="mt-4 rounded-xl border-orange-200 text-xs font-semibold text-orange-600 hover:bg-orange-50 dark:border-orange-900/60 dark:text-orange-400"
          >
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  // 3. Render table with clear contrast
  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <div className="overflow-x-auto">
        <Table className="border-0">
          <TableHeader>
            <TableRow
              className="border-b transition-none"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              }}
            >
              <TableHead className="font-semibold" style={{ color: colors.text }}>
                Parent
              </TableHead>

              <TableHead className="font-semibold" style={{ color: colors.text }}>
                Center
              </TableHead>

              <TableHead className="font-semibold" style={{ color: colors.text }}>
                Plan
              </TableHead>

              <TableHead className="font-semibold" style={{ color: colors.text }}>
                Amount
              </TableHead>

              <TableHead className="font-semibold" style={{ color: colors.text }}>
                Start Date
              </TableHead>

              <TableHead className="font-semibold" style={{ color: colors.text }}>
                End Date
              </TableHead>

              <TableHead className="font-semibold" style={{ color: colors.text }}>
                Status
              </TableHead>

              <TableHead className="text-right font-semibold" style={{ color: colors.text }}>
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {subscriptions.map((subscription) => {
              const status = subscription.status?.toLowerCase() || "pending";
              const isBadgeActive = status === "active";
              const isBadgeExpired = status === "expired";
              const isBadgeCancelled = status === "cancelled";

              return (
                <TableRow
                  key={subscription._id}
                  className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  style={{ borderColor: colors.border }}
                >
                  <TableCell className="font-medium" style={{ color: colors.text }}>
                    <div>
                      <p>{subscription.parent?.name || "N/A"}</p>
                      {subscription.parent?.email && (
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          {subscription.parent.email}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell style={{ color: colors.text }}>
                    {subscription.center?.centerName || subscription.center?.name || "N/A"}
                  </TableCell>

                  <TableCell>
                    <span className="capitalize font-medium" style={{ color: colors.text }}>
                      {subscription.planType || "N/A"}
                    </span>
                  </TableCell>

                  <TableCell className="font-semibold text-orange-600 dark:text-orange-400">
                    ₹{subscription.amount ?? 0}
                  </TableCell>

                  <TableCell style={{ color: colors.textMuted }}>
                    {subscription.startDate
                      ? new Date(subscription.startDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>

                  <TableCell style={{ color: colors.textMuted }}>
                    {subscription.endDate
                      ? new Date(subscription.endDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(subscription)}
                      className="h-8 gap-1.5 rounded-xl border text-xs font-medium transition-colors hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950/30"
                      style={{ borderColor: colors.border, color: colors.text }}
                    >
                      <Eye className="h-3.5 w-3.5 text-orange-500" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubscriptionTable;
