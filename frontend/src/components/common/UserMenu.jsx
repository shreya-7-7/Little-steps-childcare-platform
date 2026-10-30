import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LayoutDashboard, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import useAuth from "../../hooks/useAuth";

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await logout();
      toast.success(response?.message || "Logout Successful");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout Failed");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF6E2] text-sm font-semibold text-[#241C0F] outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FF9500] focus-visible:ring-offset-2 dark:bg-[#2A2210] dark:text-[#FFF6E2] dark:focus-visible:ring-offset-[#17130C]"
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-60 rounded-2xl border-none bg-white p-2 text-[#241C0F] shadow-[0_8px_24px_rgba(36,28,15,0.12)] dark:bg-[#211B10] dark:text-[#FFF6E2] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      >
        <div className="px-3 py-2">
          <p className="truncate text-sm font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            {user?.name}
          </p>
          <p className="truncate text-xs text-[#6B5D45] dark:text-[#C9B896]">
            {user?.email}
          </p>
        </div>

        <DropdownMenuSeparator className="my-2 bg-[#F0E1BE] dark:bg-[#3A2E17]" />

        <DropdownMenuItem
          onClick={() => navigate(`/${user?.role}/dashboard`)}
          className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#241C0F] focus:bg-[#FFF6E2] focus:text-[#241C0F] dark:text-[#FFF6E2] dark:focus:bg-[#2A2210] dark:focus:text-[#FFF6E2]"
        >
          <LayoutDashboard className="mr-2 h-4 w-4 text-[#FF9500]" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#D9483A] focus:bg-[#FCEBEB] focus:text-[#D9483A] dark:focus:bg-[#3A2117]"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
