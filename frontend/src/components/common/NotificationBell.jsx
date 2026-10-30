import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCount();

    const handleRefresh = () => {
      fetchCount();
    };

    window.addEventListener("refresh-notifications", handleRefresh);
    const interval = setInterval(fetchCount, 30000);

    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
      clearInterval(interval);
    };
  }, []);

  const fetchCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Ignore background count failure without spamming logs
    }
  };

  const handleOpenChange = async (isOpen) => {
    setOpen(isOpen);
    if (isOpen) {
      setLoading(true);
      try {
        const data = await getNotifications({ limit: 10 });
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkOne = async (id, isRead) => {
    if (isRead) return;
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update notification");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark all as read");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `Notifications: ${unreadCount} unread`
              : "Notifications"
          }
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#F0E1BE] bg-white text-[#241C0F] shadow-[0_4px_12px_rgba(36,28,15,0.06)] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9500] dark:border-[#3A2E17] dark:bg-[#211B10] dark:text-[#FFF6E2]"
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF9500] px-1 text-[11px] font-bold text-white shadow"
              aria-hidden="true"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-80 sm:w-96 rounded-2xl border border-[#F0E1BE] bg-white p-0 text-[#241C0F] shadow-xl dark:border-[#3A2E17] dark:bg-[#211B10] dark:text-[#FFF6E2]"
      >
        <div className="flex items-center justify-between border-b border-[#F0E1BE] px-4 py-3 dark:border-[#3A2E17]">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#FF9500]/15 px-2 py-0.5 text-xs font-semibold text-[#B87500] dark:text-[#FFC300]">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="flex items-center gap-1 text-xs font-medium text-[#FF9500] hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-[#F0E1BE]/60 dark:divide-[#3A2E17]/60">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-[#6B5D45] dark:text-[#C9B896]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#6B5D45] dark:text-[#C9B896]">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleMarkOne(n._id, n.isRead)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMarkOne(n._id, n.isRead);
                  }
                }}
                tabIndex={0}
                role="button"
                className={`flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-[#FFF6E2]/40 dark:hover:bg-[#2A2210]/40 ${
                  !n.isRead
                    ? "bg-[#FFF6E2]/20 dark:bg-[#2A2210]/20 font-medium"
                    : "opacity-80"
                }`}
              >
                <div className="mt-1 flex-shrink-0">
                  <span
                    className={`block h-2 w-2 rounded-full ${
                      !n.isRead ? "bg-[#FF9500]" : "bg-transparent"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                      {n.title}
                    </p>
                    <span className="flex-shrink-0 text-[10px] text-[#8C7A5E] dark:text-[#A8987E]">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="mt-0.5 line-clamp-2 text-xs text-[#6B5D45] dark:text-[#C9B896]">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
