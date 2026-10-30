import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { getBookingDetails } from "../../services/bookingService";

import BookingInfo from "@/components/parent/booking/BookingInfo";
import BookingActions from "@/components/parent/booking/BookingActions";
import BookingReviewSection from "@/components/parent/booking/BookingReviewSection";
import BookingDisputeSection from "@/components/parent/booking/BookingDisputeSection";
import Loading from "@/components/common/Loading";

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      const data = await getBookingDetails(id);
      setBooking(data.booking);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  if (loading) return <Loading />;

  if (!booking) {
    return (
      <div className="py-10 text-center text-sm text-[#6B5D45] dark:text-[#C9B896]">
        Booking not found
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl space-y-6 p-6"
    >
      <BookingInfo booking={booking} />
      <BookingActions booking={booking} refreshBooking={fetchBooking} />
      <BookingReviewSection booking={booking} onReviewSubmitted={fetchBooking} />
      <BookingDisputeSection booking={booking} />
    </motion.div>
  );
};

export default BookingDetails;
