import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getMyPayments } from "@/services/paymentService";

import PaymentHistory from "@/components/parent/PaymentHistory";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const data = await getMyPayments();

      setPayments(data.payments || []);
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
