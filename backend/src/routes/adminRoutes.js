import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  getDashboardStats,
  getAllUsers,
  getAllProviders,
  getPendingProviders,
  getSingleProvider,
  getSingleUser,
  getSingleCenter,
  updateCenterStatus,
  getAllCenters,
  approveProvider,
  rejectProvider,
  updateUserStatus,
  getAllBookings,
  getSingleBooking,
  getBookingsByStatus,
  getBookingsByPaymentStatus,
  getAllSubscriptions,
  getSingleSubscription,
  getSubscriptionsByStatus,
  getAllPayments,
  getSinglePayment,
  getPaymentsByStatus,
  getOverviewReport,
  getRevenueReport,
  getBookingReport,
  getSubscriptionReport,
} from "../controllers/adminController.js";

const router = express.Router();

//Get Dashboard States
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  getDashboardStats,
);

//Get all users

router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);

router.get(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getSingleUser,
);

router.patch(
  "/users/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateUserStatus,
);

//Get all providers

router.get(
  "/providers",
  authMiddleware,
  roleMiddleware("admin"),
  getAllProviders,
);

router.get(
  "/providers/pending",
  authMiddleware,
  roleMiddleware("admin"),
  getPendingProviders,
);

router.get(
  "/providers/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getSingleProvider,
);

router.patch(
  "/providers/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  approveProvider,
);

router.patch(
  "/providers/:id/reject",
  authMiddleware,
  roleMiddleware("admin"),
  rejectProvider,
);

//Get all Centers
router.get("/centers", authMiddleware, roleMiddleware("admin"), getAllCenters);

router.get(
  "/centers/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getSingleCenter,
);

router.patch(
  "/centers/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateCenterStatus,
);
//Get Admin Bookings

router.get(
  "/bookings",
  authMiddleware,
  roleMiddleware("admin"),
  getAllBookings,
);

router.get(
  "/bookings/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getSingleBooking,
);

router.get(
  "/bookings/status/:status",
  authMiddleware,
  roleMiddleware("admin"),
  getBookingsByStatus,
);

router.get(
  "/bookings/payment/:paymentStatus",
  authMiddleware,
  roleMiddleware("admin"),
  getBookingsByPaymentStatus,
);

// Get all Subscriptions
router.get(
  "/subscriptions",
  authMiddleware,
  roleMiddleware("admin"),
  getAllSubscriptions,
);

router.get(
  "/subscriptions/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getSingleSubscription,
);

router.get(
  "/subscriptions/status/:status",
  authMiddleware,
  roleMiddleware("admin"),
  getSubscriptionsByStatus,
);

router.get(
  "/payments",
  authMiddleware,
  roleMiddleware("admin"),
  getAllPayments,
);

router.get(
  "/payments/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getSinglePayment,
);

router.get(
  "/payments/status/:status",
  authMiddleware,
  roleMiddleware("admin"),
  getPaymentsByStatus,
);

//Get all Analyticals reports

router.get(
  "/reports/overview",
  authMiddleware,
  roleMiddleware("admin"),
  getOverviewReport,
);

router.get(
  "/reports/revenue",
  authMiddleware,
  roleMiddleware("admin"),
  getRevenueReport,
);

router.get(
  "/reports/bookings",
  authMiddleware,
  roleMiddleware("admin"),
  getBookingReport,
);

router.get(
  "/reports/subscriptions",
  authMiddleware,
  roleMiddleware("admin"),
  getSubscriptionReport,
);

export default router;
