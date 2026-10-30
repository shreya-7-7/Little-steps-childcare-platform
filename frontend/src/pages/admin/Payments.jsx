import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";

import PaymentTable from "../../components/admin/payments/PaymentTable";
import PaymentDetailsDialog from "../../components/admin/payments/PaymentDetailsDialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { getAllPayments } from "../../services/adminService";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchPayments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAllPayments();

      setPayments(response.payments || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return payments;

    return payments.filter((payment) => {
      const parentName = payment.parent?.name?.toLowerCase() || "";
      const childName = payment.booking?.childName?.toLowerCase() || "";
      const centerName =
        payment.booking?.center?.centerName?.toLowerCase() ||
        payment.subscription?.center?.centerName?.toLowerCase() ||
        "";
      const planType = payment.subscription?.planType?.toLowerCase() || "";
      const paymentId = (payment.razorpayPaymentId || payment.paymentId || "").toLowerCase();
      const orderId = (payment.razorpayOrderId || payment.orderId || "").toLowerCase();
      const status = payment.status?.toLowerCase() || "";

      return (
        parentName.includes(query) ||
        childName.includes(query) ||
        centerName.includes(query) ||
        planType.includes(query) ||
        paymentId.includes(query) ||
        orderId.includes(query) ||
        status.includes(query)
      );
    });
  }, [payments, search]);

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setOpen(true);
  };

  const handleRefresh = () => {
    fetchPayments(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF9500]/10">
            <CreditCard className="h-6 w-6 text-[#FF9500]" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Monitor and manage all payment transactions.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="
            h-10
            gap-2
            rounded-xl
            border-[#FF9500]/40
            bg-transparent
            text-[#241C0F]
            hover:bg-[#FF9500]/10
            hover:text-[#241C0F]
            dark:border-[#FF9500]/50
            dark:text-[#FFF6E2]
            dark:hover:bg-[#FF9500]/10
            dark:hover:text-[#FFF6E2]
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Search */}
      <div
        className="
          rounded-2xl
          border border-[#FF9500]/35
          bg-[#FFFDF7]
          p-4
          shadow-sm
          dark:border-[#FF9500]/40
          dark:bg-[#211B10]
        "
      >
        <div className="relative max-w-md">
          <Search
            className="
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-[#FF9500]
            "
          />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by parent, child, payment ID..."
            className="
              h-11
              rounded-xl
              border-0
              bg-[#FFF6E2]
              pl-10
              text-[#241C0F]
              placeholder:text-[#6B5D45]
              focus-visible:ring-2
              focus-visible:ring-[#FF9500]
              dark:bg-[#2A2210]
              dark:text-[#FFF6E2]
              dark:placeholder:text-[#C9B896]
            "
          />
        </div>
      </div>

      {/* Payment Table */}
      <PaymentTable payments={filteredPayments} onView={handleView} />

      {/* Details */}
      <PaymentDetailsDialog
        open={open}
        onOpenChange={setOpen}
        payment={selectedPayment}
      />
    </motion.section>
  );
};

export default Payments;
