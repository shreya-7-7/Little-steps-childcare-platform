import express from "express";

import {
  createOrder,
  verifyPayment,
  getMyPayments,
  getPaymentDetails,
  verifyDemoPayment,
  failDemoPayment,
} from "../controllers/paymentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// POST /create-order
router.post(
  "/create-order",
  authMiddleware,
  roleMiddleware("parent"),
  createOrder,
);

// VERIFY
router.post("/verify", authMiddleware, roleMiddleware("parent"), verifyPayment);

// DEMO / SIMULATION (DEVELOPMENT ONLY)
router.post(
  "/demo-verify",
  authMiddleware,
  roleMiddleware("parent"),
  verifyDemoPayment
);

router.post(
  "/demo-fail",
  authMiddleware,
  roleMiddleware("parent"),
  failDemoPayment
);

// MY PAYMENTS
router.get(
  "/my-payments",
  authMiddleware,
  roleMiddleware("parent"),
  getMyPayments,
);

// DETAILS
router.get("/:id", authMiddleware, roleMiddleware("parent"), getPaymentDetails);

export default router;
