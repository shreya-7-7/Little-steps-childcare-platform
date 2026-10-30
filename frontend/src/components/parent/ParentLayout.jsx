import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../common/Navbar";
import ParentSidebar from "./ParentSidebar";

import { useTheme } from "../../context/ThemeContext";

const ParentLayout = () => {
  const { colors } = useTheme();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen w-full md:flex"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Parent Sidebar */}
      <ParentSidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Navbar onSidebarOpen={() => setMobileSidebarOpen(true)} />

        <main
          className="
            min-w-0
            flex-1
            px-4
            py-4
            sm:px-5
            sm:py-5
            md:px-6
            md:py-6
          "
          style={{ backgroundColor: colors.bg }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
