import api from "./api";

/**
 * Fetch paginated notifications for the current authenticated user.
 */
export const getNotifications = async (params = {}) => {
  const response = await api.get("/notifications", { params });
  return response.data;
};

/**
 * Fetch the unread notification count for the current authenticated user.
 */
export const getUnreadCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications for the current user as read.
 */
export const markAllAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};
