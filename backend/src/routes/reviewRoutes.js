import express from "express";
import { createReview, getCenterReviews } from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: retrieve reviews for a center
router.get("/center/:centerId", getCenterReviews);

// Protected: submit review for a completed booking (Parent only)
router.post("/", authMiddleware, roleMiddleware("parent"), createReview);

export default router;
