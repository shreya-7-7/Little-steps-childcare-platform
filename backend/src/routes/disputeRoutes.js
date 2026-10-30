import express from "express";
import {
  createDispute,
  getMyDisputes,
  getMyDisputeDetails,
  getAdminDisputes,
  getAdminDisputeDetails,
  updateDisputeStatus,
} from "../controllers/disputeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Base protection: all dispute endpoints require valid authenticated session
router.use(authMiddleware);

// --- Parent Routes ---
router.post("/", roleMiddleware("parent"), createDispute);
router.get("/my-disputes", roleMiddleware("parent"), getMyDisputes);
router.get("/my-disputes/:id", roleMiddleware("parent"), getMyDisputeDetails);

// --- Admin Routes ---
router.get("/admin", roleMiddleware("admin"), getAdminDisputes);
router.get("/admin/:id", roleMiddleware("admin"), getAdminDisputeDetails);
router.patch("/admin/:id/status", roleMiddleware("admin"), updateDisputeStatus);

export default router;
