import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, CreditCard, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DemoPaymentModal = ({
  open,
  onOpenChange,
  orderData,
  onSimulateSuccess,
  onSimulateFailure,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  if (!orderData) return null;

  const handleSuccess = async () => {
    setIsProcessing(true);
    try {
      const result = await onSimulateSuccess(orderData.orderId);
      if (result?.payment) {
        setSuccessReceipt(result.payment);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFailure = async () => {
    setIsProcessing(true);
    try {
      await onSimulateFailure(orderData.orderId);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSuccessReceipt(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-3xl border border-[#FF9500]/40 bg-[#FFFDF7] p-6 shadow-2xl dark:border-[#FF9500]/45 dark:bg-[#211B10]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
            <CreditCard className="h-6 w-6 text-[#FF9500]" />
            DEMO PAYMENT SIMULATOR
          </DialogTitle>
        </DialogHeader>

        {/* Warning Banner */}
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>DEVELOPMENT MODE — NO REAL MONEY OR CHARGES INVOLVED</span>
        </div>

        {successReceipt ? (
          /* Receipt State */
          <div className="mt-4 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#241C0F] dark:text-[#FFF6E2]">
                Payment Simulated Successfully!
              </h3>
              <p className="mt-1 text-xs text-[#6B5D45] dark:text-[#C9B896]">
                Booking payment status updated to <strong>Paid</strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF6E2] p-4 text-left text-xs space-y-2 dark:bg-[#2A2210]">
              <div className="flex justify-between">
                <span className="text-[#6B5D45] dark:text-[#C9B896]">Receipt Reference:</span>
                <span className="font-mono font-medium text-[#241C0F] dark:text-[#FFF6E2] break-all">
                  {successReceipt.razorpayPaymentId || "demo_pay_complete"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5D45] dark:text-[#C9B896]">Order Reference:</span>
                <span className="font-mono font-medium text-[#241C0F] dark:text-[#FFF6E2] break-all">
                  {successReceipt.razorpayOrderId || orderData.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5D45] dark:text-[#C9B896]">Amount Paid:</span>
                <span className="font-bold text-[#FF9500]">
                  ₹{successReceipt.amount || orderData.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5D45] dark:text-[#C9B896]">Method:</span>
                <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                  {successReceipt.paymentMethod || "Demo Simulation"}
                </span>
              </div>
            </div>

            <Button
              onClick={handleClose}
              className="w-full rounded-xl bg-gradient-to-r from-[#FF9500] to-[#FFC300] py-2.5 font-semibold text-[#241C0F]"
            >
              Continue to Bookings
            </Button>
          </div>
        ) : (
          /* Simulation Controls */
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-[#FFF6E2] p-4 text-xs space-y-2.5 dark:bg-[#2A2210]">
              <div className="flex justify-between">
                <span className="text-[#6B5D45] dark:text-[#C9B896]">Centre:</span>
                <span className="font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                  {orderData.centerName || "Childcare Centre"}
                </span>
              </div>
              {orderData.childName && (
                <div className="flex justify-between">
                  <span className="text-[#6B5D45] dark:text-[#C9B896]">Child:</span>
                  <span className="font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                    {orderData.childName}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6B5D45] dark:text-[#C9B896]">Order Amount:</span>
                <span className="text-base font-bold text-[#FF9500]">
                  ₹{orderData.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5D45] dark:text-[#C9B896]">Demo Order ID:</span>
                <span className="font-mono text-[11px] text-[#241C0F] dark:text-[#FFF6E2] break-all">
                  {orderData.orderId}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleSuccess}
                disabled={isProcessing}
                className="w-full rounded-xl bg-green-600 text-white hover:bg-green-700 font-semibold flex items-center justify-center gap-2 py-2.5"
              >
                <ShieldCheck className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Simulate Success"}
              </Button>

              <Button
                variant="destructive"
                onClick={handleFailure}
                disabled={isProcessing}
                className="w-full rounded-xl font-semibold flex items-center justify-center gap-2 py-2.5"
              >
                <XCircle className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Simulate Failure"}
              </Button>

              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="w-full rounded-xl border-[#F0E1BE] text-[#241C0F] hover:bg-[#FFF6E2] dark:border-[#3A2E17] dark:text-[#FFF6E2]"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DemoPaymentModal;
