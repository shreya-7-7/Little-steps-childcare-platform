import express from "express";

import {
  createSubscription,
  getMySubscriptions,
  getSubscriptionDetails,
  cancelSubscription,
  getProviderSubscriptions,
  getProviderSubscriptionAnalytics,
  processSubscriptionExpiryJob,
} from "../controllers/subscriptionController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * Middleware ensuring request is either from an authorized scheduler (CRON_SECRET)
 * or an authenticated platform administrator.
 */
const cronOrAdminAuth = (req, res, next) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers?.authorization;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return next();
  }

  return authMiddleware(req, res, () => {
    return roleMiddleware("admin")(req, res, next);
  });
};

// CRON / AUTOMATION JOB ENDPOINTS (Placed before /:id)
router.get("/process-expiry", cronOrAdminAuth, processSubscriptionExpiryJob);
router.post("/process-expiry", cronOrAdminAuth, processSubscriptionExpiryJob);

router.post("/", authMiddleware, roleMiddleware("parent"), createSubscription);

router.get(
  "/my-subscriptions",
  authMiddleware,
  roleMiddleware("parent"),
  getMySubscriptions,
);

router.put(
  "/cancel/:id",
  authMiddleware,
  roleMiddleware("parent"),
  cancelSubscription,
);

router.get(
  "/provider-subscriptions",
  authMiddleware,
  roleMiddleware("provider"),
  getProviderSubscriptions,
);

router.get(
  "/provider-subscriptions/analytics",
  authMiddleware,
  roleMiddleware("provider"),
  getProviderSubscriptionAnalytics,
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("parent"),
  getSubscriptionDetails,
);

export default router;
