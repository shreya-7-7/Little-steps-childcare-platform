import express from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All notification routes require authenticated session
router.use(authMiddleware);

router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllNotificationsAsRead);
router.patch("/:id/read", markNotificationAsRead);

export default router;
