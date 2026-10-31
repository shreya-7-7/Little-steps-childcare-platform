import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Calendar, Building2, CreditCard, AlertCircle, XCircle } from "lucide-react";

import {
  getMySubscriptions,
  cancelSubscription,
} from "../../services/subscriptionService";
import Loading from "../../components/common/Loading";
import useAuth from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";

let mySubscriptionsCache = {
  userId: null,
  subscriptions: null,
};

const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "--" : d.toLocaleDateString();
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Active":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Active
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Pending
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
          Cancelled
        </span>
      );
    case "Expired":
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-300">
          Expired
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
          {status}
        </span>
      );
  }
};

const MySubscriptions = () => {
  const { user } = useAuth();
  const isCached = Boolean(
    user?._id &&
      mySubscriptionsCache.userId === user._id &&
      Array.isArray(mySubscriptionsCache.subscriptions),
  );

  const [subscriptions, setSubscriptions] = useState(
    isCached ? mySubscriptionsCache.subscriptions : [],
  );
  const [loading, setLoading] = useState(!isCached);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      const response = await getMySubscriptions();
      if (response.success) {
        setSubscriptions(response.subscriptions || []);
        if (user?._id) {
          mySubscriptionsCache = {
            userId: user._id,
            subscriptions: response.subscriptions || [],
          };
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load subscriptions",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    try {
      setCancellingId(id);
      const res = await cancelSubscription(id);
      toast.success(res.message || "Subscription cancelled successfully");
      fetchSubscriptions();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel subscription",
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-[#241C0F] dark:text-[#FFF6E2]"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            My Subscriptions
          </h1>
          <p className="text-[#6B5D45] dark:text-[#C9B896]">
            Manage your active childcare plans and recurring subscriptions.
          </p>
        </div>

        <Button
          asChild
          className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90"
        >
          <Link to="/parent/centers">Browse Centers</Link>
        </Button>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-[#F0E1BE] p-12 text-center dark:border-[#3A2E17]">
          <h2 className="text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            No Subscriptions Found
          </h2>
          <p className="mt-2 text-sm text-[#6B5D45] dark:text-[#C9B896]">
            You have not subscribed to any childcare plan yet. Subscribe directly from any center's details page.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/parent/centers">Explore Centers</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {subscriptions.map((sub) => {
            const canCancel = sub.status === "Active" || sub.status === "Pending";
            return (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[#F0E1BE] bg-white p-6 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#241C0F] dark:text-[#FFF6E2]">
                      {sub.center?.slug ? (
                        <Link
                          to={`/parent/centers/${sub.center.slug}`}
                          className="hover:text-[#FF9500] hover:underline"
                        >
                          {sub.center.centerName}
                        </Link>
                      ) : (
                        sub.center?.centerName || "Childcare Center"
                      )}
                    </h2>
                    <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
                      {sub.center?.city || "Registered Center"}
                    </p>
                  </div>

                  {getStatusBadge(sub.status)}
                </div>

                <div className="mt-4 space-y-2 border-t border-[#F0E1BE]/60 pt-4 text-sm text-[#6B5D45] dark:border-[#3A2E17] dark:text-[#C9B896]">
                  <div className="flex justify-between">
                    <span>Plan Type:</span>
                    <span className="font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                      {sub.planType} Plan
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                      ₹{sub.amount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-xs font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                      {formatDate(sub.startDate)} – {formatDate(sub.endDate)}
                    </span>
                  </div>
                </div>

                {canCancel && (
                  <div className="mt-5 flex justify-end border-t border-[#F0E1BE]/60 pt-3 dark:border-[#3A2E17]">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancellingId === sub._id}
                      onClick={() => handleCancel(sub._id)}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/40 dark:text-rose-400"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      {cancellingId === sub._id ? "Cancelling..." : "Cancel Subscription"}
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySubscriptions;
