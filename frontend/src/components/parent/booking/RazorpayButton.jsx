import { useState } from "react";
import { toast } from "sonner";
import {
  createOrder,
  verifyPayment,
  verifyDemoPayment,
  failDemoPayment,
} from "@/services/paymentService";
import DemoPaymentModal from "./DemoPaymentModal";

const RazorpayButton = ({ payload, buttonText = "Pay now", onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoOrderData, setDemoOrderData] = useState(null);

  const handlePayment = async () => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const isDemoAllowed =
      import.meta.env.VITE_ALLOW_DEMO_PAYMENT === "true" ||
      import.meta.env.DEV;

    if (!razorpayKey && !isDemoAllowed) {
      toast.error("Payment gateway is not configured (missing key ID)");
      return;
    }

    try {
      setIsProcessing(true);
      const data = await createOrder(payload);

      // Branch 1: Demo / Simulation Order
      if (data.isDemo || data.order?.id?.startsWith("demo_order_")) {
        setDemoOrderData({
          orderId: data.order.id,
          amount: data.payment.amount,
          centerName: data.payment.booking?.center?.centerName || "Childcare Centre",
          childName: data.payment.booking?.childName || null,
        });
        setDemoModalOpen(true);
        setIsProcessing(false);
        return;
      }

      // Branch 2: Real Razorpay SDK Checkout
      if (!window.Razorpay) {
        toast.error("Razorpay payment SDK not loaded. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Little Steps",
        description: "Childcare Platform Payment",
        order_id: data.order.id,

        handler: async (response) => {
          try {
            const verify = await verifyPayment(response);
            toast.success(verify.message || "Payment verified successfully");
            window.dispatchEvent(new Event("refresh-notifications"));
            onSuccess?.(verify);
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          } finally {
            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info("Payment window closed");
          },
        },

        prefill: {},

        theme: {
          color: "#FF9500",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        setIsProcessing(false);
        toast.error(response.error?.description || "Payment failed");
      });
      razorpay.open();
    } catch (error) {
      setIsProcessing(false);
      toast.error(
        error.response?.data?.message || "Unable to initiate payment order",
      );
    }
  };

  const handleSimulateSuccess = async (orderId) => {
    try {
      const res = await verifyDemoPayment({ orderId });
      toast.success(res.message || "Demo payment verified successfully");
      window.dispatchEvent(new Event("refresh-notifications"));
      onSuccess?.(res);
      return res;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to verify demo payment",
      );
      throw error;
    }
  };

  const handleSimulateFailure = async (orderId) => {
    try {
      const res = await failDemoPayment({ orderId, reason: "Simulation declined" });
      toast.error(res.message || "Payment simulation marked as failed");
      return res;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to register demo payment failure",
      );
      throw error;
    }
  };

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`rounded-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] px-5 py-2.5 text-sm font-semibold text-[#241C0F] transition-transform hover:-translate-y-0.5 active:scale-95 ${
          isProcessing ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {isProcessing ? "Processing..." : buttonText}
      </button>

      <DemoPaymentModal
        open={demoModalOpen}
        onOpenChange={setDemoModalOpen}
        orderData={demoOrderData}
        onSimulateSuccess={handleSimulateSuccess}
        onSimulateFailure={handleSimulateFailure}
      />
    </>
  );
};

export default RazorpayButton;
