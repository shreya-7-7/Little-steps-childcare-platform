import { motion } from "framer-motion";
import { Eye, UserCheck, UserX, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "../../../context/ThemeContext";

const UserTable = ({ users, onView, onStatusChange, onApproval }) => {
  const { colors } = useTheme();

  if (!users.length) {
    return (
      <div
        className="rounded-2xl border border-dashed px-6 py-16 text-center"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          <UserX className="h-6 w-6" />
        </div>

        <h3 className="mt-4 text-lg font-bold" style={{ color: colors.text }}>
          No Users Found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: colors.textMuted }}>
          No users match your current filter or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <div
        className="hidden grid-cols-[2fr_1.2fr_1fr_1fr_1.5fr] gap-4 border-b px-6 py-4 text-xs font-semibold uppercase tracking-wider md:grid"
        style={{
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
          color: colors.textMuted,
        }}
      >
        <span>User</span>
        <span>Role</span>
        <span>Status</span>
        <span>Approval</span>
        <span className="text-right">Actions</span>
      </div>

      <div
        className="divide-y"
        style={{ borderColor: colors.border }}
      >
        {users.map((user, index) => {
          const initials =
            user.name
              ?.split(" ")
              .map((name) => name[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "U";

          const isActive = user.status === "active";
          const isProvider = user.role === "provider";

          return (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: index * 0.02,
              }}
              className="grid gap-5 px-6 py-5 md:grid-cols-[2fr_1.2fr_1fr_1fr_1.5fr] md:items-center transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
              style={{ borderColor: colors.border }}
            >
              {/* User */}
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border" style={{ borderColor: colors.border }}>
                  <AvatarFallback className="bg-orange-100 font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate font-semibold" style={{ color: colors.text }}>
                    {user.name}
                  </p>

                  <p className="truncate text-sm" style={{ color: colors.textMuted }}>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div>
                <p className="mb-1 text-xs md:hidden" style={{ color: colors.textMuted }}>
                  Role
                </p>

                <Badge
                  variant="outline"
                  className="capitalize font-medium"
                  style={{ borderColor: colors.border, color: colors.text }}
                >
                  {user.role}
                </Badge>
              </div>

              {/* Status */}
              <div>
                <p className="mb-1 text-xs md:hidden" style={{ color: colors.textMuted }}>
                  Status
                </p>

                <Badge
                  className={
                    isActive
                      ? "border-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "border-0 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                  }
                >
                  {user.status}
                </Badge>
              </div>

              {/* Approval */}
              <div>
                <p className="mb-1 text-xs md:hidden" style={{ color: colors.textMuted }}>
                  Approval
                </p>

                {isProvider ? (
                  <Badge
                    className={
                      user.isApproved
                        ? "border-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "border-0 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }
                  >
                    {user.isApproved ? "Approved" : "Pending"}
                  </Badge>
                ) : (
                  <span className="text-sm" style={{ color: colors.textMuted }}>
                    —
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(user)}
                  className="gap-1.5 rounded-xl border text-xs font-medium transition-colors hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950/20"
                  style={{ borderColor: colors.border, color: colors.text }}
                >
                  <Eye className="h-3.5 w-3.5 text-orange-500" />
                  View
                </Button>

                <Button
                  size="sm"
                  variant={isActive ? "destructive" : "default"}
                  onClick={() =>
                    onStatusChange(user._id, isActive ? "blocked" : "active")
                  }
                  className="gap-1.5 rounded-xl text-xs"
                >
                  {isActive ? (
                    <>
                      <UserX className="h-3.5 w-3.5" />
                      Block
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      Activate
                    </>
                  )}
                </Button>

                {isProvider && (
                  <Button
                    size="sm"
                    variant={user.isApproved ? "destructive" : "default"}
                    onClick={() =>
                      onApproval(
                        user._id,
                        user.isApproved ? "rejected" : "approved",
                      )
                    }
                    className="gap-1.5 rounded-xl text-xs"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {user.isApproved ? "Reject" : "Approve"}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UserTable;
