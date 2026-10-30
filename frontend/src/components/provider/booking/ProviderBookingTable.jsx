import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Eye,
  Check,
  X,
  CalendarDays,
  CreditCard,
  User,
  Baby,
  CheckCircle2,
} from "lucide-react";

import {
  approveBooking,
  rejectBooking,
  completeBooking,
  isBookingServiceEnded,
} from "@/services/bookingService";
import { useTheme } from "@/context/ThemeContext";

const ProviderBookingTable = ({ bookings, refreshBookings }) => {
  const { colors } = useTheme();

  console.log("TABLE BOOKINGS:", bookings);

  if (!bookings.length) {
    return (
      <div
        className="rounded-[30px] border border-dashed py-16 text-center"
        style={{
          background: colors.surface,
          borderColor: colors.border,
        }}
      >
        <CalendarDays className="mx-auto mb-4 h-12 w-12 text-orange-500" />

        <h2
          className="text-2xl font-bold"
          style={{
            color: colors.text,
          }}
        >
          No Bookings Found
        </h2>

        <p
          className="mt-2 text-sm"
          style={{
            color: colors.textMuted,
          }}
        >
          Booking requests will appear here.
        </p>
      </div>
    );
  }

  const handleApprove = async (id) => {
    try {
      const data = await approveBooking(id);

      toast.success(data.message);

      refreshBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve booking");
    }
  };

  const handleReject = async (id) => {
    try {
      const data = await rejectBooking(id);

      toast.success(data.message);

      refreshBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject booking");
    }
  };

  const handleComplete = async (id) => {
    try {
      const data = await completeBooking(id);
      toast.success(data.message || "Booking marked as completed");
      refreshBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete booking");
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-blue-100 text-blue-700";

      case "approved":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";

      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="overflow-hidden rounded-[30px] border shadow-sm"
      style={{
        background: colors.surface,
        borderColor: colors.border,
      }}
    >
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full">
          <thead
            style={{
              background: colors.surfaceAlt || colors.surface,
            }}
          >
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Child
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Parent
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Date
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Plan
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Amount
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Payment
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking._id}
                className="transition-colors hover:bg-orange-50/40"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-orange-100 p-2">
                      <Baby className="h-4 w-4 text-orange-600" />
                    </div>

                    <span
                      className="font-medium"
                      style={{
                        color: colors.text,
                      }}
                    >
                      {booking.childName}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>

                    <span
                      style={{
                        color: colors.text,
                      }}
                    >
                      {booking.parent?.name}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-5">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </td>

                <td className="px-6 py-5">{booking.planType}</td>

                <td className="px-6 py-5 font-semibold">₹{booking.amount}</td>

                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      booking.status,
                    )}`}
                  >
                    {booking.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStyle(
                      booking.paymentStatus,
                    )}`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    {booking.paymentStatus}
                  </span>
                </td>

                <td className="px-6 py-5">
                  {/* Part 2 এখান থেকে শুরু হবে */}
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/provider/bookings/${booking._id}`}
                      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all hover:scale-105 hover:border-orange-500 hover:bg-orange-50"
                      style={{
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>

                    {booking.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(booking._id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(booking._id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {booking.status === "Approved" && isBookingServiceEnded(booking) && (
                      <button
                        onClick={() => handleComplete(booking._id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-blue-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark Completed
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}

      <div className="space-y-4 p-4 lg:hidden">
        {bookings.map((booking) => (
          <motion.div
            key={`${booking._id}-mobile`}
            whileHover={{ y: -2 }}
            className="rounded-2xl border p-5"
            style={{
              background: colors.surface,
              borderColor: colors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="font-semibold"
                style={{
                  color: colors.text,
                }}
              >
                {booking.childName}
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                  booking.status,
                )}`}
              >
                {booking.status}
              </span>
            </div>

            <div
              className="mt-4 space-y-2 text-sm"
              style={{
                color: colors.textMuted,
              }}
            >
              <p>
                <strong>Parent:</strong> {booking.parent?.name}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(booking.bookingDate).toLocaleDateString()}
              </p>

              <p>
                <strong>Plan:</strong> {booking.planType}
              </p>

              <p>
                <strong>Amount:</strong> ₹{booking.amount}
              </p>

              <p>
                <strong>Payment:</strong> {booking.paymentStatus}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to={`/provider/bookings/${booking._id}`}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium"
                style={{
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <Eye className="h-4 w-4" />
                View
              </Link>

              {booking.status === "Pending" && (
                <>
                  <button
                    onClick={() => handleApprove(booking._id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(booking._id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </>
              )}

              {booking.status === "Approved" && isBookingServiceEnded(booking) && (
                <button
                  onClick={() => handleComplete(booking._id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Completed
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProviderBookingTable;
