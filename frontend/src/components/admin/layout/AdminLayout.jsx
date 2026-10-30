import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const openSidebar = () => {
    setMobileSidebarOpen(true);
  };

  const closeSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminNavbar onSidebarOpen={openSidebar} />

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
