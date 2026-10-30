import Notification from "../models/Notification.js";

/**
 * Safely creates an in-app notification without interrupting the caller workflow.
 * Failures are caught and logged without sensitive tokens, secrets, or passwords.
 */
export const createInAppNotification = async ({
  recipient,
  type = "system",
  title,
  message,
  relatedEntity,
}) => {
  try {
    if (!recipient || !title || !message) return null;

    const notification = await Notification.create({
      recipient,
      type,
      title: title.trim(),
      message: message.trim(),
      relatedEntity,
    });

    return notification;
  } catch (error) {
    console.warn(
      `[NOTIFICATION_CREATION_FAILED] Type: ${type}, Recipient: ${recipient}. Reason: ${error.message}`
    );
    return null;
  }
};

/**
 * List the authenticated user's notifications, newest first, with pagination.
 */
export const getMyNotifications = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = { recipient: req.user._id };

    if (req.query.unreadOnly === "true") {
      query.isRead = false;
    }

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      notifications,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get total unread notifications count for the authenticated user.
 */
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("GET UNREAD COUNT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark a single notification as read, strictly scoped to the authenticated user.
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark all unread notifications for the authenticated user as read.
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
