import assert from "assert";
import Subscription from "../models/Subscription.js";
import Notification from "../models/Notification.js";
import {
  processSubscriptionExpirations,
  ADVANCE_WARNING_DAYS,
} from "./subscriptionExpiryHelper.js";
import { processSubscriptionExpiryJob } from "../controllers/subscriptionController.js";

console.log("=== RUNNING SUBSCRIPTION LIFECYCLE AND EXPIRY TESTS ===");

const createMockRes = () => {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
};

const now = new Date("2026-10-30T12:00:00.000Z");

// Mock In-Memory Database store
let subscriptionsStore = [];
let notificationsStore = [];

const originalSubscriptionFind = Subscription.find;
const originalSubscriptionFindOneAndUpdate = Subscription.findOneAndUpdate;
const originalNotificationCreate = Notification.create;

try {
  Subscription.find = (query) => {
    let results = subscriptionsStore.filter((sub) => {
      if (query.status && sub.status !== query.status) return false;
      if (query.expiryWarningSentAt === null && sub.expiryWarningSentAt !== null)
        return false;
      if (query.endDate) {
        if (query.endDate.$lte && !(sub.endDate <= query.endDate.$lte))
          return false;
        if (query.endDate.$gt && !(sub.endDate > query.endDate.$gt))
          return false;
      }
      return true;
    });

    return {
      populate: () => results,
    };
  };

  Subscription.findOneAndUpdate = async (filter, update) => {
    const item = subscriptionsStore.find((sub) => {
      if (filter._id && sub._id !== filter._id) return false;
      if (filter.status && sub.status !== filter.status) return false;
      if (
        filter.expiryWarningSentAt === null &&
        sub.expiryWarningSentAt !== null
      )
        return false;
      if (
        filter.expiredNotificationSentAt === null &&
        sub.expiredNotificationSentAt !== null
      )
        return false;
      return true;
    });

    if (!item) return null;

    if (update.$set) {
      Object.assign(item, update.$set);
    }
    return { ...item };
  };

  Notification.create = async (doc) => {
    notificationsStore.push(doc);
    return doc;
  };

  // -------------------------------------------------------------------------
  // Test 1: Active subscriptions that have not expired remain Active
  // -------------------------------------------------------------------------
  subscriptionsStore = [
    {
      _id: "sub_future",
      parent: "parent_1",
      center: { centerName: "Sunshine Daycare" },
      status: "Active",
      endDate: new Date("2026-11-20T12:00:00.000Z"), // 21 days in future
      expiryWarningSentAt: null,
      expiredNotificationSentAt: null,
    },
  ];
  notificationsStore = [];

  const res1 = await processSubscriptionExpirations(now);
  assert.strictEqual(res1.expiredCount, 0, "Future subscription must not expire");
  assert.strictEqual(res1.warnedCount, 0, "Subscription >3 days out must not be warned");
  assert.strictEqual(subscriptionsStore[0].status, "Active", "Must remain Active");
  console.log("✔ Passed: Active subscriptions that have not expired remain Active");

  // -------------------------------------------------------------------------
  // Test 2: Expired subscription transitions to Expired
  // -------------------------------------------------------------------------
  subscriptionsStore.push({
    _id: "sub_past",
    parent: "parent_2",
    center: { centerName: "Sunshine Daycare" },
    status: "Active",
    endDate: new Date("2026-10-29T12:00:00.000Z"), // Yesterday
    expiryWarningSentAt: null,
    expiredNotificationSentAt: null,
  });

  const res2 = await processSubscriptionExpirations(now);
  assert.strictEqual(res2.expiredCount, 1, "Past subscription must expire");
  const pastSub = subscriptionsStore.find((s) => s._id === "sub_past");
  assert.strictEqual(pastSub.status, "Expired", "Past subscription status must be Expired");
  assert.ok(pastSub.expiredNotificationSentAt, "expiredNotificationSentAt must be set");

  const expiryNotif = notificationsStore.find(
    (n) => n.recipient === "parent_2" && n.title === "Subscription Expired",
  );
  assert.ok(expiryNotif, "Expiry notification must be sent to parent");
  console.log("✔ Passed: Expired subscription transitions to Expired and parent notified");

  // -------------------------------------------------------------------------
  // Test 3: Repeated expiry execution is safe (Idempotent)
  // -------------------------------------------------------------------------
  const notifCountBefore = notificationsStore.length;
  const res3 = await processSubscriptionExpirations(now);
  assert.strictEqual(res3.expiredCount, 0, "No new expirations on repeated execution");
  assert.strictEqual(
    notificationsStore.length,
    notifCountBefore,
    "No duplicate notifications sent on repeated run",
  );
  console.log("✔ Passed: Repeated expiry execution is completely idempotent");

  // -------------------------------------------------------------------------
  // Test 4: Cancellation and Pending status are not overwritten
  // -------------------------------------------------------------------------
  subscriptionsStore.push(
    {
      _id: "sub_cancelled",
      parent: "parent_3",
      center: { centerName: "Sunshine Daycare" },
      status: "Cancelled",
      endDate: new Date("2026-10-25T12:00:00.000Z"), // Expired date, but cancelled
      expiryWarningSentAt: null,
      expiredNotificationSentAt: null,
    },
    {
      _id: "sub_pending",
      parent: "parent_4",
      center: { centerName: "Sunshine Daycare" },
      status: "Pending",
      endDate: new Date("2026-10-25T12:00:00.000Z"),
      expiryWarningSentAt: null,
      expiredNotificationSentAt: null,
    },
  );

  const res4 = await processSubscriptionExpirations(now);
  assert.strictEqual(res4.expiredCount, 0);
  const cancelledSub = subscriptionsStore.find((s) => s._id === "sub_cancelled");
  assert.strictEqual(cancelledSub.status, "Cancelled", "Cancelled status must be preserved");
  const pendingSub = subscriptionsStore.find((s) => s._id === "sub_pending");
  assert.strictEqual(pendingSub.status, "Pending", "Pending status must be preserved");
  console.log("✔ Passed: Cancelled and Pending statuses are never overwritten");

  // -------------------------------------------------------------------------
  // Test 5: Advance Expiry Warning Notifications (No duplicates)
  // -------------------------------------------------------------------------
  subscriptionsStore.push({
    _id: "sub_nearing",
    parent: "parent_5",
    center: { centerName: "Sunshine Daycare" },
    status: "Active",
    endDate: new Date("2026-11-01T12:00:00.000Z"), // 2 days in future (< 3 days window)
    expiryWarningSentAt: null,
    expiredNotificationSentAt: null,
  });

  const res5 = await processSubscriptionExpirations(now);
  assert.strictEqual(res5.warnedCount, 1, "Subscription nearing expiry must receive warning");
  const nearingSub = subscriptionsStore.find((s) => s._id === "sub_nearing");
  assert.strictEqual(nearingSub.status, "Active", "Subscription nearing expiry remains Active");
  assert.ok(nearingSub.expiryWarningSentAt, "expiryWarningSentAt must be set");

  const warningNotif = notificationsStore.find(
    (n) => n.recipient === "parent_5" && n.title === "Subscription Expiring Soon",
  );
  assert.ok(warningNotif, "Warning notification must be sent to parent");

  // Run again: must not duplicate warning
  const res5Repeat = await processSubscriptionExpirations(now);
  assert.strictEqual(res5Repeat.warnedCount, 0, "Repeated run must not duplicate warning");
  console.log("✔ Passed: Advance warning notifications are delivered without duplication");

  // -------------------------------------------------------------------------
  // Test 6: Unauthorized Job Execution is Rejected (HTTP 401)
  // -------------------------------------------------------------------------
  process.env.CRON_SECRET = "super_secure_cron_secret_54321";

  // 6A: Missing authorization header
  const reqUnauth = { headers: {} };
  const resUnauth = createMockRes();
  await processSubscriptionExpiryJob(reqUnauth, resUnauth);
  assert.strictEqual(resUnauth.statusCode, 401, "Missing auth must return 401");
  assert.strictEqual(resUnauth.body.success, false);

  // 6B: Wrong secret
  const reqWrongSecret = {
    headers: { authorization: "Bearer invalid_secret" },
  };
  const resWrongSecret = createMockRes();
  await processSubscriptionExpiryJob(reqWrongSecret, resWrongSecret);
  assert.strictEqual(resWrongSecret.statusCode, 401, "Invalid secret must return 401");

  // 6C: Valid CRON_SECRET succeeds
  const reqValidCron = {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  };
  const resValidCron = createMockRes();
  await processSubscriptionExpiryJob(reqValidCron, resValidCron);
  assert.strictEqual(resValidCron.statusCode, 200, "Valid CRON_SECRET must succeed with 200");
  assert.strictEqual(resValidCron.body.success, true);

  // 6D: Authenticated Admin succeeds
  const reqAdmin = {
    headers: {},
    user: { role: "admin", _id: "admin_user_id" },
  };
  const resAdmin = createMockRes();
  await processSubscriptionExpiryJob(reqAdmin, resAdmin);
  assert.strictEqual(resAdmin.statusCode, 200, "Admin user must succeed with 200");
  assert.strictEqual(resAdmin.body.success, true);

  console.log("✔ Passed: Unauthorized job execution strictly rejected with 401; authorized triggers succeed");
} finally {
  Subscription.find = originalSubscriptionFind;
  Subscription.findOneAndUpdate = originalSubscriptionFindOneAndUpdate;
  Notification.create = originalNotificationCreate;
}

console.log("=== ALL SUBSCRIPTION LIFECYCLE TESTS PASSED ===");
