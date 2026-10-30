import { CalendarDays, CreditCard, FileText, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

const PaymentDetailsDialog = ({ open, onOpenChange, payment }) => {
  if (!payment) return null;

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "success":
      case "successful":
        return `
          border-0
          bg-green-100
          text-green-700
          dark:bg-green-900/30
          dark:text-green-400
        `;

      case "pending":
        return `
          border-0
          bg-yellow-100
          text-yellow-700
          dark:bg-yellow-900/30
          dark:text-yellow-400
        `;

      case "failed":
      case "cancelled":
      case "canceled":
        return `
          border-0
          bg-red-100
          text-red-700
          dark:bg-red-900/30
          dark:text-red-400
        `;

      default:
        return `
          border-0
          bg-[#FF9500]/10
          text-[#C56F00]
          dark:text-[#FFB84D]
        `;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          border
          border-[#FF9500]/40
          bg-[#FFFDF7]
          p-6
          shadow-[0_20px_60px_rgba(36,28,15,0.15)]
          dark:border-[#FF9500]/45
          dark:bg-[#211B10]
        "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF9500]/10">
              <CreditCard className="h-5 w-5 text-[#FF9500]" />
            </span>
            Payment Details
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Parent */}
          <div className="rounded-2xl bg-[#FFF6E2] p-5 dark:bg-[#2A2210]">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-[#FF9500]" />

              <h3 className="font-semibold">Parent Information</h3>
            </div>

            <p className="font-medium">{payment.parent?.name || "N/A"}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {payment.parent?.email || "N/A"}
            </p>
          </div>

          {/* Booking or Subscription */}
          <div className="rounded-2xl bg-[#FFF6E2] p-5 dark:bg-[#2A2210]">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#FF9500]" />

              <h3 className="font-semibold">
                {payment.subscription ? "Subscription Details" : "Booking Information"}
              </h3>
            </div>

            <p>
              <span className="text-sm text-muted-foreground">
                {payment.subscription ? "Plan Type" : "Child"}
              </span>

              <span className="mt-1 block font-medium">
                {payment.booking?.childName || (payment.subscription ? `${payment.subscription.planType} Subscription` : "N/A")}
              </span>
            </p>

            <p className="mt-3">
              <span className="text-sm text-muted-foreground">Center</span>

              <span className="mt-1 block font-medium">
                {payment.booking?.center?.centerName || payment.subscription?.center?.centerName || "N/A"}
              </span>
            </p>
          </div>

          {/* Payment Information */}
          <div className="rounded-2xl bg-[#FFF6E2] p-5 dark:bg-[#2A2210]">
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#FF9500]" />

              <h3 className="font-semibold">Payment Information</h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>

                <p className="mt-1 text-xl font-bold text-[#FF9500]">
                  ₹{payment.amount ?? 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Method</p>

                <p className="mt-1 font-medium capitalize">
                  {payment.paymentMethod || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Payment ID</p>

                <p className="mt-1 break-all text-sm">
                  {payment.razorpayPaymentId || payment.paymentId || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>

                <p className="mt-1 break-all text-sm">
                  {payment.razorpayOrderId || payment.orderId || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl bg-[#FFF6E2] p-5 dark:bg-[#2A2210]">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#FF9500]" />

              <h3 className="font-semibold">Payment Status</h3>
            </div>

            <Badge
              className={`
                rounded-full
                px-4
                py-1.5
                ${getStatusClass(payment.status)}
              `}
            >
              {payment.status || "N/A"}
            </Badge>

            <div className="mt-5">
              <p className="text-sm text-muted-foreground">Paid At</p>

              <p className="mt-1 text-sm font-medium">
                {payment.paidAt
                  ? new Date(payment.paidAt).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Created</p>

              <p className="mt-1 text-sm font-medium">
                {payment.createdAt
                  ? new Date(payment.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsDialog;
