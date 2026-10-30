import express from "express";

import {
  createCenter,
  getCenters,
  getMyCenters,
  getSingleCenter,
  getFeaturedCenters,
  getTopRatedCenters,
  getSimilarCenters,
  getLatestCenters,
  getCenterFilters,
  getCenterById,
  updateCenter,
  deleteCenter,
} from "../controllers/centerController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* Public */
router.get("/", getCenters);

router.get("/featured", getFeaturedCenters);

router.get("/latest", getLatestCenters);

router.get("/top-rated", getTopRatedCenters);

router.get("/:id/similar", getSimilarCenters);

router.get("/filters/options", getCenterFilters);

router.get("/slug/:slug", getSingleCenter);

/* Provider */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("provider"),
  (req, res, next) => {
    console.log("✅ Before upload middleware");
    next();
  },
  upload.array("centerImages", 10),
  (req, res, next) => {
    console.log("✅ After upload middleware");
    next();
  },
  createCenter,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("provider"),
  upload.array("centerImages", 10),
  updateCenter,
);

router.get(
  "/my-centers",
  authMiddleware,
  roleMiddleware("provider"),
  getMyCenters,
);

router.get(
  "/my-center",
  authMiddleware,
  roleMiddleware("provider"),
  getMyCenters,
);

router.get("/:id", authMiddleware, roleMiddleware("provider"), getCenterById);

router.delete("/:id", authMiddleware, roleMiddleware("provider"), deleteCenter);

/* Admin */
router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteCenter,
);

export default router;
