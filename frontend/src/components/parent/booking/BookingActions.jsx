import { useState } from "react";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import RazorpayButton from "./RazorpayButton";
import { cancelBooking } from "@/services/bookingService";

const BookingActions = ({ booking, refreshBooking }) => {
  const [cancelling, setCancelling] = useState(false);

  const canPay =
    booking?.status === "Approved" && booking?.paymentStatus === "Pending";
  const isPending = booking?.status === "Pending";

  if (!canPay && !isPending) return null;

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }
    try {
      setCancelling(true);
      const res = await cancelBooking(booking._id);
      toast.success(res.message || "Booking cancelled successfully");
      window.dispatchEvent(new Event("refresh-notifications"));
      if (refreshBooking) {
        refreshBooking();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {canPay && <RazorpayButton payload={{ bookingId: booking._id }} />}
      {isPending && (
        <Button
          variant="destructive"
          onClick={handleCancel}
          disabled={cancelling}
          className="inline-flex items-center gap-2 rounded-xl"
        >
          <XCircle className="h-4 w-4" />
          {cancelling ? "Cancelling..." : "Cancel Booking"}
        </Button>
      )}
    </div>
  );
};

export default BookingActions;
