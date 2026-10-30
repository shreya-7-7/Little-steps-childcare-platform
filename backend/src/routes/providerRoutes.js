import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  createProviderProfile,
  getProviderProfile,
  getDashboardStats,
  updateProviderProfile,
  getRecentBookings,
  getProviderDashboard,
  getMonthlyRevenue,
  getDashboardNotifications,
} from "../controllers/providerController.js";

const router = express.Router();

router.post(
  "/profile",
  authMiddleware,
  roleMiddleware("provider"),
  createProviderProfile,
);

router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("provider"),
  getProviderProfile,
);

router.get(
  "/dashboard/stats",
  authMiddleware,
  roleMiddleware("provider"),
  getDashboardStats,
);

router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("provider"),
  updateProviderProfile,
);
// router.get(
//   "/dashboard",
//   authMiddleware,
//   roleMiddleware("provider"),
//   getProviderDashboard,
// );

router.get(
  "/dashboard/recent-bookings",
  authMiddleware,
  roleMiddleware("provider"),
  getRecentBookings,
);

router.get(
  "/dashboard/monthly-revenue",
  authMiddleware,
  roleMiddleware("provider"),
  getMonthlyRevenue,
);

router.get(
  "/dashboard/notifications",
  authMiddleware,
  roleMiddleware("provider"),
  getDashboardNotifications,
);

export default router;
