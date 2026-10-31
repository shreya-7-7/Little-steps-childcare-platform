import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getMyPayments } from "@/services/paymentService";
import useAuth from "@/hooks/useAuth";

import PaymentHistory from "@/components/parent/PaymentHistory";

let myPaymentsCache = {
  userId: null,
  payments: null,
};

const Payments = () => {
  const { user } = useAuth();
  const isCached = Boolean(
    user?._id &&
      myPaymentsCache.userId === user._id &&
      Array.isArray(myPaymentsCache.payments),
  );

  const [payments, setPayments] = useState(
    isCached ? myPaymentsCache.payments : [],
  );
  const [loading, setLoading] = useState(!isCached);

  const fetchPayments = async () => {
    try {
      const data = await getMyPayments();
      if (data?.payments) {
        setPayments(data.payments);
        if (user?._id) {
          myPaymentsCache = {
            userId: user._id,
            payments: data.payments,
          };
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <PaymentHistory
      payments={payments}
      loading={loading}
      refreshPayments={fetchPayments}
    />
  );
};

export default Payments;
