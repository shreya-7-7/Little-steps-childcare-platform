import { Mail, ShieldCheck, User, CalendarDays, Hash } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "../../../context/ThemeContext";

const UserDetailsDialog = ({ open, onOpenChange, user }) => {
  const { colors } = useTheme();

  if (!user) return null;

  const isActive = user.status === "active";
  const isProvider = user.role === "provider";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl overflow-hidden rounded-3xl border p-0 shadow-2xl"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        {/* Header */}
        <DialogHeader
          className="px-6 py-6"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:bg-orange-500/25 dark:text-orange-400">
              <User className="h-6 w-6" />
            </div>

            <div>
              <DialogTitle className="text-xl font-bold" style={{ color: colors.text }}>
                User Details
              </DialogTitle>

              <DialogDescription className="mt-1" style={{ color: colors.textMuted }}>
                Complete account information and profile status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6 pt-5">
          {/* Profile summary */}
          <div
            className="flex items-center justify-between rounded-2xl border p-5"
            style={{
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
            }}
          >
            <div>
              <p className="text-xl font-bold" style={{ color: colors.text }}>
                {user.name}
              </p>

              <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
                {user.email}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge
                className={
                  isActive
                    ? "border-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "border-0 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                }
              >
                {user.status}
              </Badge>

              <Badge
                variant="outline"
                className="capitalize"
                style={{ borderColor: colors.border, color: colors.text }}
              >
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Details list */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-orange-500" />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  User ID
                </p>
              </div>

              <p className="mt-2 truncate font-mono text-xs font-medium" style={{ color: colors.text }}>
                {user._id}
              </p>
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-orange-500" />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Joined Date
                </p>
              </div>

              <p className="mt-2 text-sm font-medium" style={{ color: colors.text }}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            {isProvider && (
              <>
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-orange-500" />
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                      Approval Status
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-semibold" style={{ color: colors.text }}>
                    {user.isApproved ? "Approved Provider" : "Pending Approval"}
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-4"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-500" />
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                      Contact Phone
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-medium" style={{ color: colors.text }}>
                    {user.phone || "Not provided"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
