import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import Loading from "@/components/common/Loading";

import { getBookingDetails } from "@/services/bookingService";

import ProviderBookingInfo from "@/components/provider/booking/ProviderBookingInfo";
import ProviderBookingActions from "@/components/provider/booking/ProviderBookingActions";
import { useTheme } from "@/context/ThemeContext";

const BookingDetails = () => {
  const { id } = useParams();
  const { colors } = useTheme();

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
      <div
        className="rounded-2xl border border-dashed py-16 text-center"
        style={{ borderColor: colors.border }}
      >
        <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
          Booking not found
        </h2>
        <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
          This booking may have been removed or the link is out of date.
        </p>

        <Link
          to="/provider/bookings"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: colors.text }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ProviderBookingInfo booking={booking} />
      <ProviderBookingActions booking={booking} refreshBooking={fetchBooking} />
    </motion.div>
  );
};

export default BookingDetails;
