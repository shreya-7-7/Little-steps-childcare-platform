import { Outlet } from "react-router-dom";

import AdminSidebar from "../../components/admin/layout/AdminSidebar";
import AdminNavbar from "../../components/admin/layout/AdminNavbar";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
