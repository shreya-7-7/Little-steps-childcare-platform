import { useState } from "react";
import { Outlet } from "react-router-dom";

import ProviderSidebar from "./ProviderSidebar";
import ProviderHeader from "./ProviderHeader";

import { useTheme } from "../../context/ThemeContext";

const ProviderLayout = () => {
  const { colors } = useTheme();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const openSidebar = () => {
    setMobileSidebarOpen(true);
  };

  const closeSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      <div className="flex min-h-screen">
        {/* =========================
            SIDEBAR
        ========================= */}
        <ProviderSidebar
          mobileOpen={mobileSidebarOpen}
          onClose={closeSidebar}
        />

        {/* =========================
            MAIN AREA
        ========================= */}
        <div className="flex min-w-0 flex-1 flex-col">
          <ProviderHeader onSidebarOpen={openSidebar} />

          <main
            className="
              min-w-0
              flex-1
              overflow-x-hidden
              p-4
              sm:p-6
              lg:p-8
            "
            style={{
              backgroundColor: colors.bg,
            }}
          >
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProviderLayout;
