import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UsersRound,
  UserCheck,
  UserX,
  ShieldCheck,
  RotateCcw,
  X,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import UserDetailsDialog from "../../components/admin/users/UserDetailsDialog";
import UserTable from "../../components/admin/users/UserTable";
import Loading from "../../components/common/Loading";

import {
  getAllUsers,
  updateUserStatus,
  approveProvider,
  rejectProvider,
} from "../../services/adminService";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "../../context/ThemeContext";

const Users = () => {
  const { colors } = useTheme();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cardFilter, setCardFilter] = useState("all"); // 'all' | 'active' | 'blocked' | 'pending'

  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const statistics = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.status === "active").length,
      blocked: users.filter((user) => user.status === "blocked").length,
      pending: users.filter(
        (user) => user.role === "provider" && !user.isApproved,
      ).length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      // 1. Summary Card Filter
      if (cardFilter === "active" && user.status !== "active") return false;
      if (cardFilter === "blocked" && user.status !== "blocked") return false;
      if (
        cardFilter === "pending" &&
        !(user.role === "provider" && !user.isApproved)
      ) {
        return false;
      }

      // 2. Search Query Filter
      if (!query) return true;

      const name = user.name?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const role = user.role?.toLowerCase() || "";
      const phone = user.phone?.toLowerCase() || "";

      return (
        name.includes(query) ||
        email.includes(query) ||
        role.includes(query) ||
        phone.includes(query)
      );
    });
  }, [users, cardFilter, search]);

  const handleCardClick = (key) => {
    if (key === "total" || cardFilter === key) {
      setCardFilter("all");
    } else {
      setCardFilter(key);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await updateUserStatus(id, status);
      toast.success(response.message || "User status updated");
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user status",
      );
    }
  };

  const handleApproval = async (id, status) => {
    try {
      if (status === "approved") {
        await approveProvider(id);
        toast.success("Provider approved successfully");
      } else {
        await rejectProvider(id);
        toast.success("Provider rejected successfully");
      }
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update provider approval",
      );
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  if (loading) {
    return <Loading />;
  }

  const getFilterLabel = () => {
    switch (cardFilter) {
      case "active":
        return "Active Accounts";
      case "blocked":
        return "Blocked Accounts";
      case "pending":
        return "Pending Providers";
      default:
        return "All Users";
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-7"
    >
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
            <UsersRound className="h-4 w-4" />
            Administration
          </div>

          <h1 className="text-3xl font-bold tracking-tight" style={{ color: colors.text }}>
            User Management
          </h1>

          <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
            Manage registered users, account status and provider approvals. Click any summary card below to filter records.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchUsers}
          className="w-fit gap-2 rounded-xl border transition-colors hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20"
          style={{ borderColor: colors.border, color: colors.text }}
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Statistics Cards (Functional Filters) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={statistics.total}
          icon={UsersRound}
          isActive={cardFilter === "all"}
          activeLabel="Showing All"
          onClick={() => handleCardClick("total")}
          colors={colors}
        />

        <StatCard
          title="Active Accounts"
          value={statistics.active}
          icon={UserCheck}
          isActive={cardFilter === "active"}
          activeLabel="Filter: Active"
          onClick={() => handleCardClick("active")}
          colors={colors}
        />

        <StatCard
          title="Blocked Accounts"
          value={statistics.blocked}
          icon={UserX}
          isActive={cardFilter === "blocked"}
          activeLabel="Filter: Blocked"
          onClick={() => handleCardClick("blocked")}
          colors={colors}
        />

        <StatCard
          title="Pending Providers"
          value={statistics.pending}
          icon={ShieldCheck}
          isActive={cardFilter === "pending"}
          activeLabel="Filter: Pending"
          onClick={() => handleCardClick("pending")}
          colors={colors}
        />
      </div>

      {/* Search & Active Filter Bar */}
      <div
        className="rounded-2xl border p-5 shadow-sm"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold" style={{ color: colors.text }}>
                Registered Accounts
              </h2>
              {cardFilter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                  <Filter className="h-3 w-3" />
                  {getFilterLabel()}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
              Showing {filteredUsers.length} of {users.length} users displayed
              {cardFilter !== "all" && (
                <span>
                  {" "}·{" "}
                  <button
                    type="button"
                    onClick={() => setCardFilter("all")}
                    className="font-medium text-orange-600 hover:underline dark:text-orange-400"
                  >
                    Return to all users
                  </button>
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search name, email, role or phone..."
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

            {(cardFilter !== "all" || search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCardFilter("all");
                  setSearch("");
                }}
                className="shrink-0 text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                Reset All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        onView={handleView}
        onStatusChange={handleStatusChange}
        onApproval={handleApproval}
      />

      {/* User Details Dialog */}
      <UserDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
      />
    </motion.section>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  isActive,
  activeLabel,
  onClick,
  colors,
}) => {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      className={`group cursor-pointer rounded-2xl border p-5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
        isActive
          ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/30 dark:border-orange-500 dark:bg-orange-950/20"
          : "hover:border-orange-400"
      }`}
      style={{
        backgroundColor: isActive ? undefined : colors.surface,
        borderColor: isActive ? undefined : colors.border,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              isActive ? "text-orange-700 dark:text-orange-300" : ""
            }`}
            style={{ color: isActive ? undefined : colors.textMuted }}
          >
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color: colors.text }}>
            {value}
          </p>

          {isActive && (
            <span className="mt-1.5 inline-block text-[11px] font-semibold text-orange-600 dark:text-orange-400">
              ● {activeLabel}
            </span>
          )}
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
            isActive
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-orange-100 text-orange-600 group-hover:bg-orange-200 dark:bg-orange-950/50 dark:text-orange-400"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default Users;
