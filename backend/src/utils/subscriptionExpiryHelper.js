import Subscription from "../models/Subscription.js";
import { createInAppNotification } from "../controllers/notificationController.js";

export const ADVANCE_WARNING_DAYS = 3;

/**
 * Idempotently processes subscription expirations and advance warnings.
 * - Transitions Active subscriptions past endDate to Expired atomically.
 * - Sends warning notification 3 days prior to expiration once per subscription.
 * - Sends expiration notification upon expiry once per subscription.
 * - Preserves Cancelled and Pending states.
 * - Never renews or charges automatically.
 */
export const processSubscriptionExpirations = async (now = new Date()) => {
  const currentDate = new Date(now);
  const warningDate = new Date(
    currentDate.getTime() + ADVANCE_WARNING_DAYS * 24 * 60 * 60 * 1000,
  );

  let warnedCount = 0;
  let expiredCount = 0;

  // 1. Advance Expiry Warnings: Active subscriptions expiring within the warning window
  const subsNearingExpiry = await Subscription.find({
    status: "Active",
    endDate: { $gt: currentDate, $lte: warningDate },
    expiryWarningSentAt: null,
  }).populate("center", "centerName");

  for (const sub of subsNearingExpiry) {
    // Atomic update to claim the warning notification and avoid race conditions/duplicates
    const claimed = await Subscription.findOneAndUpdate(
      {
        _id: sub._id,
        status: "Active",
        expiryWarningSentAt: null,
      },
      {
        $set: { expiryWarningSentAt: currentDate },
      },
      { new: true },
    );

    if (claimed) {
      warnedCount++;
      const centerName = sub.center?.centerName || "your childcare center";
      const formattedEndDate = new Date(sub.endDate).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
      );

      await createInAppNotification({
        recipient: sub.parent,
        type: "subscription",
        title: "Subscription Expiring Soon",
        message: `Your Little Steps childcare subscription for ${centerName} will expire on ${formattedEndDate}. Please review your subscription options.`,
        relatedEntity: {
          id: sub._id,
          modelName: "Subscription",
        },
      });
    }
  }

  // 2. Idempotent Expirations: Active subscriptions whose endDate has passed
  const subsToExpire = await Subscription.find({
    status: "Active",
    endDate: { $lte: currentDate },
  }).populate("center", "centerName");

  for (const sub of subsToExpire) {
    // Atomic update to mark Expired
    const updated = await Subscription.findOneAndUpdate(
      {
        _id: sub._id,
        status: "Active",
      },
      {
        $set: { status: "Expired" },
      },
      { new: true },
    );

    if (updated) {
      expiredCount++;

      // Check if expired notification was already sent
      if (!updated.expiredNotificationSentAt) {
        const markedNotified = await Subscription.findOneAndUpdate(
          {
            _id: sub._id,
            expiredNotificationSentAt: null,
          },
          {
            $set: { expiredNotificationSentAt: currentDate },
          },
          { new: true },
        );

        if (markedNotified) {
          const centerName = sub.center?.centerName || "your childcare center";
          await createInAppNotification({
            recipient: sub.parent,
            type: "subscription",
            title: "Subscription Expired",
            message: `Your Little Steps childcare subscription for ${centerName} has expired.`,
            relatedEntity: {
              id: sub._id,
              modelName: "Subscription",
            },
          });
        }
      }
    }
  }

  return {
    success: true,
    processedAt: currentDate,
    warnedCount,
    expiredCount,
  };
};
