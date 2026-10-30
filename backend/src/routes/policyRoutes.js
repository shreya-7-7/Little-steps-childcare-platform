import express from "express";
import {
  getPublicPolicies,
  getPublicPolicyBySlug,
  getAdminPolicies,
  getAdminPolicyById,
  createPolicy,
  updatePolicy,
  togglePolicyPublication,
  deletePolicy,
} from "../controllers/policyController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (Published Content Only)
// ==========================================
router.get("/", getPublicPolicies);
router.get("/slug/:slug", getPublicPolicyBySlug);

// ==========================================
// ADMIN ROUTES (Full CMS Controls)
// ==========================================
router.use("/admin", authMiddleware, roleMiddleware("admin"));

router.get("/admin/all", getAdminPolicies);
router.get("/admin/:id", getAdminPolicyById);
router.post("/admin", createPolicy);
router.put("/admin/:id", updatePolicy);
router.patch("/admin/:id", updatePolicy);
router.patch("/admin/:id/publish", togglePolicyPublication);
router.delete("/admin/:id", deletePolicy);

export default router;
