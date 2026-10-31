import { useEffect, useState } from "react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";
import BookingCard from "../../components/parent/BookingCard";
import useAuth from "../../hooks/useAuth";

import { getMyBookings, cancelBooking } from "../../services/bookingService";
import { useTheme } from "../../context/ThemeContext";

let myBookingsCache = {
  userId: null,
  bookings: null,
};

const MyBookings = () => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const isCached = Boolean(
    user?._id &&
      myBookingsCache.userId === user._id &&
      Array.isArray(myBookingsCache.bookings),
  );

  const [bookings, setBookings] = useState(
    isCached ? myBookingsCache.bookings : [],
  );
  const [loading, setLoading] = useState(!isCached);

  useEffect(() => {
    let isMounted = true;
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        if (isMounted && data?.bookings) {
          setBookings(data.bookings);
          if (user?._id) {
            myBookingsCache = {
              userId: user._id,
              bookings: data.bookings,
            };
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load bookings");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBookings();
    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      if (data?.bookings) {
        setBookings(data.bookings);
        if (user?._id) {
          myBookingsCache = {
            userId: user._id,
            bookings: data.bookings,
          };
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await cancelBooking(id);
      toast.success(response.message);
      fetchBookings();
      window.dispatchEvent(new Event("refresh-notifications"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
          My Bookings
        </h1>

        <p className="mt-2" style={{ color: colors.textMuted }}>
          View and manage your childcare bookings.
        </p>
      </div>

      {/* Empty State */}
      {bookings.length === 0 ? (
        <div
          className="rounded-3xl p-12 text-center"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borderAccent}`,
          }}
        >
          <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
            No Bookings Found
          </h2>

          <p className="mt-3" style={{ color: colors.textMuted }}>
            You haven't booked any childcare center yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
