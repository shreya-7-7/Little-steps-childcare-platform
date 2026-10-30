import express from "express";

import {
  createCaregiver,
  getCaregivers,
  getSingleCaregiver,
  getProviderCaregivers,
  updateCaregiver,
  deleteCaregiver,
} from "../controllers/caregiverController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* Public */
router.get("/", getCaregivers);

/* Provider */
router.get(
  "/provider",
  authMiddleware,
  roleMiddleware("provider"),
  getProviderCaregivers,
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("provider"),
  upload.single("profileImage"),
  createCaregiver,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("provider"),
  upload.single("profileImage"),
  updateCaregiver,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("provider"),
  deleteCaregiver,
);

/* Dynamic */
router.get("/:id", getSingleCaregiver);

export default router;
