import express from "express";

import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingDetails,
  cancelBooking,
  approveBooking,
  rejectBooking,
  completeBooking,
} from "../controllers/bookingController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("parent"), createBooking);

router.get(
  "/my-bookings",
  authMiddleware,
  roleMiddleware("parent"),
  getMyBookings,
);

router.patch(
  "/cancel/:id",
  authMiddleware,
  roleMiddleware("parent"),
  cancelBooking,
);

router.get(
  "/provider",
  (req, res, next) => {
    console.log("========== /bookings/provider ROUTE HIT ==========");
    next();
  },
  authMiddleware,
  roleMiddleware("provider"),
  getProviderBookings,
);

router.patch(
  "/approve/:id",
  authMiddleware,
  roleMiddleware("provider"),
  approveBooking,
);

router.patch(
  "/reject/:id",
  authMiddleware,
  roleMiddleware("provider"),
  rejectBooking,
);

router.patch(
  "/complete/:id",
  authMiddleware,
  roleMiddleware("provider"),
  completeBooking,
);

router.get("/:id", authMiddleware, getBookingDetails);

export default router;
