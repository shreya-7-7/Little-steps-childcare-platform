import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getMySubscriptions } from "@/services/subscriptionService";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);

  const fetchSubscriptions = async () => {
    try {
      const data = await getMySubscriptions();

      setSubscriptions(data.subscriptions);
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">My Subscriptions</h1>

      {subscriptions.map((subscription) => (
        <div key={subscription._id} className="rounded-lg border p-4">
          <h2 className="font-semibold">{subscription.center.centerName}</h2>

          <p>{subscription.planType}</p>

          <p>Status : {subscription.status}</p>

          <p>₹{subscription.amount}</p>
        </div>
      ))}
    </div>
  );
};

export default Subscriptions;
