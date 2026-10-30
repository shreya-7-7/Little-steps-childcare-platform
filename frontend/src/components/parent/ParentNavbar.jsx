import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  CreditCard,
  Heart,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const LogoMark = () => (
  <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden>
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
  { name: "Dashboard", path: "/parent/dashboard", icon: LayoutDashboard },
  { name: "My bookings", path: "/parent/bookings", icon: CalendarCheck },
  { name: "Browse centers", path: "/centers", icon: Building2 },
  { name: "Payments", path: "/parent/payments", icon: CreditCard },
  { name: "Favorites", path: "/parent/favorites", icon: Heart },
  { name: "Profile", path: "/parent/profile", icon: User },
  { name: "Settings", path: "/parent/settings", icon: Settings },
];

const ParentSidebar = () => {
  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-col border-r border-[#F0E1BE] bg-white dark:border-[#3A2E17] dark:bg-[#211B10]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-[#F0E1BE] p-6 dark:border-[#3A2E17]">
        <LogoMark />
        <div>
          <h2
            className="text-lg font-bold text-[#241C0F] dark:text-[#FFF6E2]"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Little Steps
          </h2>
          <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
            Parent dashboard
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F]"
                    : "text-[#6B5D45] hover:bg-[#FFF6E2] dark:text-[#C9B896] dark:hover:bg-[#2A2210]"
                }`
              }
            >
              <Icon size={18} />
              <span>{menu.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer — was `absolute bottom-0` before with no relative parent, so it likely overlapped content; now it sits in normal flow via flex-col + mt-auto */}
      <div className="border-t border-[#F0E1BE] p-4 dark:border-[#3A2E17]">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default ParentSidebar;
