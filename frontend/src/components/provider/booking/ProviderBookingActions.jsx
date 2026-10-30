import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  approveBooking,
  rejectBooking,
  completeBooking,
  isBookingServiceEnded,
} from "@/services/bookingService";
import { useTheme } from "@/context/ThemeContext";

const ProviderBookingActions = ({ booking, refreshBooking }) => {
  const { colors } = useTheme();

  const handleApprove = async () => {
    try {
      const data = await approveBooking(booking._id);

      toast.success(data.message);

      refreshBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve booking");
    }
  };

  const handleReject = async () => {
    try {
      const data = await rejectBooking(booking._id);

      toast.success(data.message);

      refreshBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject booking");
    }
  };

  const handleComplete = async () => {
    try {
      const data = await completeBooking(booking._id);

      toast.success(data.message || "Booking marked as completed");

      refreshBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete booking");
    }
  };

  const isPending = booking.status === "Pending";
  const canComplete = booking.status === "Approved" && isBookingServiceEnded(booking);

  if (!isPending && !canComplete) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-wrap gap-4"
    >
      {isPending && (
        <>
          <button
            onClick={handleApprove}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700"
            style={{
              background: "#16A34A",
            }}
          >
            <CheckCircle2 className="h-5 w-5" />
            Approve Booking
          </button>

          <button
            onClick={handleReject}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700"
            style={{
              background: "#DC2626",
            }}
          >
            <XCircle className="h-5 w-5" />
            Reject Booking
          </button>
        </>
      )}

      {canComplete && (
        <button
          onClick={handleComplete}
          className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
          style={{
            background: "#2563EB",
          }}
        >
          <CheckCircle2 className="h-5 w-5" />
          Mark Completed
        </button>
      )}
    </motion.div>
  );
};

export default ProviderBookingActions;
