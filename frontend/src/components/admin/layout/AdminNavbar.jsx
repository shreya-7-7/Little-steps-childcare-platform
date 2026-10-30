import { Menu } from "lucide-react";

import UserMenu from "../../common/UserMenu";
import NotificationBell from "../../common/NotificationBell";
import { useTheme } from "../../../context/ThemeContext";

const AdminNavbar = ({ onSidebarOpen }) => {
  const { colors } = useTheme();

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300"
      style={{
        backgroundColor: colors.nav,
        borderColor: colors.border,
      }}
    >
      <div className="flex min-h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left Side */}
        <div className="min-w-0 flex-1">
          <h1
            className="truncate text-xl font-bold tracking-tight sm:text-2xl"
            style={{
              color: colors.text,
              fontFamily: "Fraunces, serif",
            }}
          >
            Admin Dashboard
          </h1>

          <p
            className="mt-0.5 hidden text-sm sm:block"
            style={{
              color: colors.textMuted,
            }}
          >
            Manage your childcare platform
          </p>
        </div>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-5">
          {/* Real Notification Bell with Inbox & Live Unread Count */}
          <NotificationBell />

          {/* Divider */}
          <div
            className="hidden h-9 w-px sm:block"
            style={{
              backgroundColor: colors.border,
            }}
          />

          {/* User Menu */}
          <UserMenu />

          {/* Mobile Sidebar Button */}
          <button
            type="button"
            onClick={onSidebarOpen}
            aria-label="Open admin sidebar"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              transition-all
              duration-200
              hover:-translate-y-0.5
              lg:hidden
            "
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              boxShadow: "0 4px 12px rgba(36, 28, 15, 0.06)",
            }}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
