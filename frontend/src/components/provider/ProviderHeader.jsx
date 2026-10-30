import { CalendarDays, Search, Menu } from "lucide-react";
import { motion } from "framer-motion";

import useAuth from "@/hooks/useAuth";
import UserMenu from "../common/UserMenu";
import NotificationBell from "../common/NotificationBell";
import { useTheme } from "../../context/ThemeContext";

const ProviderHeader = ({ onSidebarOpen }) => {
  const { user } = useAuth();
  const { colors } = useTheme();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{
        background: colors.nav,
        borderColor: colors.border,
      }}
    >
      <div
        className="
          flex
          min-h-20
          items-center
          justify-between
          gap-3
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* LEFT */}
        <div className="min-w-0 flex-1">
          <h1
            className="
              truncate
              text-lg
              font-bold
              tracking-tight
              sm:text-2xl
            "
            style={{ color: colors.text }}
          >
            Welcome back,
            <span className="ml-2 text-orange-500">
              {user?.name?.split(" ")[0]}
            </span>
          </h1>

          <div
            className="mt-1 flex min-w-0 items-center gap-2 text-xs sm:text-sm"
            style={{ color: colors.textMuted }}
          >
            <CalendarDays className="h-4 w-4 shrink-0" />

            <span className="truncate">{today}</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search
              className="
                absolute
                left-4
                top-1/2
                h-4
                w-4
                -translate-y-1/2
              "
              style={{ color: colors.textMuted }}
            />

            <input
              type="text"
              placeholder="Search..."
              className="
                h-11
                w-56
                rounded-full
                border
                pl-11
                pr-4
                text-sm
                outline-none
                transition-all
                duration-300
                focus:ring-2
                focus:ring-orange-400
                lg:w-72
              "
              style={{
                background: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              }}
            />
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* User */}
          <UserMenu />

          {/* Mobile Sidebar */}
          <button
            type="button"
            onClick={onSidebarOpen}
            aria-label="Open provider sidebar"
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
              hover:scale-105
              md:hidden
            "
            style={{
              color: colors.text,
              borderColor: colors.border,
              background: colors.surface,
            }}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default ProviderHeader;
