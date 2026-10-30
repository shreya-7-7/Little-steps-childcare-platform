import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

import {
  LayoutDashboard,
  PlusCircle,
  Building2,
  Users,
  CalendarCheck,
  User,
  X,
} from "lucide-react";

import LogoMark from "../common/LogoMark";
import { useTheme } from "../../context/ThemeContext";

const menus = [
  {
    name: "Dashboard",
    path: "/provider/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Create Center",
    path: "/provider/center/create",
    icon: PlusCircle,
  },
  {
    name: "My Center",
    path: "/provider/center",
    icon: Building2,
  },
  {
    name: "Caregivers",
    path: "/provider/caregivers",
    icon: Users,
  },
  {
    name: "Bookings",
    path: "/provider/bookings",
    icon: CalendarCheck,
  },
  {
    name: "Profile",
    path: "/provider/profile",
    icon: User,
  },
];

const ProviderSidebar = ({ mobileOpen, onClose }) => {
  const { colors } = useTheme();

  return (
    <>
      {/* =========================================
          MOBILE BACKDROP
      ========================================= */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close provider sidebar"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            backdrop-blur-[2px]
            md:hidden
          "
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          h-screen
          w-72
          flex-col
          border-r
          transition-transform
          duration-300
          ease-in-out
          md:sticky
          md:top-0
          md:z-30
          md:translate-x-0
          md:transition-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: colors.surface,
          borderColor: colors.border,
        }}
      >
        {/* =========================================
            HEADER / LOGO
        ========================================= */}
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            px-5
            py-5
            sm:px-6
            sm:py-6
          "
          style={{
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <LogoMark />

            <div className="min-w-0">
              <h2
                className="text-lg font-bold"
                style={{
                  color: colors.text,
                }}
              >
                Provider
              </h2>

              <p
                className="text-xs"
                style={{
                  color: colors.textMuted,
                }}
              >
                Dashboard
              </p>
            </div>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close provider sidebar"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              md:hidden
            "
            style={{
              color: colors.text,
              borderColor: colors.border,
              background: colors.surfaceAlt,
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =========================================
            MENU
        ========================================= */}
        <nav
          className="
            flex-1
            overflow-y-auto
            overflow-x-hidden
            px-4
            py-5
          "
        >
          <div className="flex flex-col gap-2">
            {menus.map((menu) => {
              const Icon = menu.icon;

              return (
                <NavLink
                  key={menu.path}
                  to={menu.path}
                  onClick={onClose}
                  className="block w-full"
                >
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="
                        group
                        flex
                        h-12
                        w-full
                        shrink-0
                        items-center
                        gap-3
                        rounded-2xl
                        px-4
                        transition-all
                        duration-300
                      "
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg,#FF9500,#FFC300)"
                          : "transparent",

                        color: isActive ? "#241C0F" : colors.text,
                      }}
                    >
                      <Icon
                        size={20}
                        className={`
                          shrink-0
                          transition-transform
                          duration-300
                          ${isActive ? "" : "group-hover:scale-110"}
                        `}
                      />

                      <span className="truncate font-medium">{menu.name}</span>
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* =========================================
            FOOTER
        ========================================= */}
        <div
          className="
            shrink-0
            border-t
            px-4
            py-4
            sm:px-6
            sm:py-5
          "
          style={{
            borderColor: colors.border,
          }}
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: colors.surfaceAlt,
            }}
          >
            <p
              className="text-sm font-semibold"
              style={{
                color: colors.text,
              }}
            >
              Little Steps
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-relaxed
              "
              style={{
                color: colors.textMuted,
              }}
            >
              Trusted Childcare Provider Platform
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ProviderSidebar;
