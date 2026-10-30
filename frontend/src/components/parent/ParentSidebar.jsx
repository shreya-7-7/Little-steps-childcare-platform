import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  HomeIcon,
  CalendarCheck,
  Sparkles,
  Building2,
  CreditCard,
  User,
  AlertTriangle,
  LogOut,
  X,
} from "lucide-react";

const LogoMark = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 40 40"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
  >
    <defs>
      <linearGradient id="sidebarLogoGrad" x1="0" y1="0" x2="40" y2="40">
        <stop stopColor="#FF9500" />
        <stop offset="1" stopColor="#FFDD00" />
      </linearGradient>
    </defs>

    <circle cx="20" cy="20" r="19" fill="url(#sidebarLogoGrad)" />

    <path
      d="M14 26c0-5 3-8 6-8s6 3 6 8"
      stroke="#241C0F"
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
    />

    <circle cx="20" cy="14" r="3.4" fill="#241C0F" />
  </svg>
);

const menus = [
  {
    name: "Home",
    path: "/",
    icon: HomeIcon,
  },
  {
    name: "Dashboard",
    path: "/parent/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My bookings",
    path: "/parent/my-bookings",
    icon: CalendarCheck,
  },
  {
    name: "Browse centers",
    path: "/parent/centers",
    icon: Building2,
  },
  {
    name: "Payments",
    path: "/parent/payments",
    icon: CreditCard,
  },
  {
    name: "Profile",
    path: "/parent/profile",
    icon: User,
  },
];

const ParentSidebar = ({ mobileOpen, onClose }) => {
  return (
    <>
      {/* =========================================
          MOBILE BACKDROP
      ========================================= */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-hidden="true"
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
          border-[#F0E1BE]
          bg-white
          shadow-2xl
          transition-transform
          duration-300
          ease-in-out

          dark:border-[#3A2E17]
          dark:bg-[#211B10]

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          md:sticky
          md:top-0
          md:z-30
          md:translate-x-0
          md:shadow-none
        `}
      >
        {/* =========================================
            LOGO HEADER
        ========================================= */}
        <div
          className="
            flex
            min-h-[81px]
            shrink-0
            items-center
            justify-between
            border-b
            border-[#F0E1BE]
            p-6
            dark:border-[#3A2E17]
          "
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <LogoMark />

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  text-lg
                  font-bold
                  text-[#241C0F]
                  dark:text-[#FFF6E2]
                "
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Little Steps
              </h2>

              <p className="truncate text-xs text-[#6B5D45] dark:text-[#C9B896]">
                Parent dashboard
              </p>
            </div>
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-[#6B5D45]
              transition-colors
              hover:bg-[#FFF6E2]
              dark:text-[#C9B896]
              dark:hover:bg-[#2A2210]
              md:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* =========================================
            MENU
        ========================================= */}
        <nav
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            p-4
          "
        >
          <div className="flex w-full flex-col gap-1">
            {menus.map((menu) => {
              const Icon = menu.icon;

              return (
                <NavLink
                  key={menu.path}
                  to={menu.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                      flex
                      h-12
                      w-full
                      shrink-0
                      items-center
                      gap-3
                      rounded-xl
                      px-4
                      text-sm
                      font-medium
                      transition-colors

                      ${
                        isActive
                          ? "bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F]"
                          : "text-[#6B5D45] hover:bg-[#FFF6E2] dark:text-[#C9B896] dark:hover:bg-[#2A2210]"
                      }
                    `
                  }
                >
                  <Icon size={18} className="shrink-0" aria-hidden="true" />

                  <span className="min-w-0 flex-1 truncate whitespace-nowrap">
                    {menu.name}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* =========================================
            LOGOUT
        ========================================= */}
        <div
          className="
            shrink-0
            border-t
            border-[#F0E1BE]
            p-4
            dark:border-[#3A2E17]
          "
        >
          <button
            type="button"
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-200
              px-4
              text-sm
              font-medium
              text-red-600
              transition-colors
              hover:bg-red-50
              dark:border-red-900/40
              dark:text-red-400
              dark:hover:bg-red-950/30
            "
          >
            <LogOut size={16} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ParentSidebar;
