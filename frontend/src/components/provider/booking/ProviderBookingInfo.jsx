import {
  Baby,
  CalendarDays,
  Clock3,
  CreditCard,
  Building2,
  MapPin,
  Mail,
  User,
  FileText,
} from "lucide-react";

import { useTheme } from "@/context/ThemeContext";

const ProviderBookingInfo = ({ booking }) => {
  const { colors } = useTheme();

  const details = [
    {
      label: "Child",
      value: booking.childName,
      icon: Baby,
    },
    {
      label: "Age",
      value: booking.childAge,
      icon: Baby,
    },
    {
      label: "Parent",
      value: booking.parent?.name,
      icon: User,
    },
    {
      label: "Email",
      value: booking.parent?.email,
      icon: Mail,
    },
    {
      label: "Center",
      value: booking.center?.centerName,
      icon: Building2,
    },
    {
      label: "City",
      value: booking.center?.city,
      icon: MapPin,
    },
    {
      label: "Date",
      value: new Date(booking.bookingDate).toLocaleDateString(),
      icon: CalendarDays,
    },
    {
      label: "Time",
      value: `${booking.startTime} - ${booking.endTime}`,
      icon: Clock3,
    },
    {
      label: "Plan",
      value: booking.planType,
      icon: FileText,
    },
    {
      label: "Amount",
      value: `₹${booking.amount}`,
      icon: CreditCard,
    },
    {
      label: "Status",
      value: booking.status,
      icon: FileText,
    },
    {
      label: "Payment",
      value: booking.paymentStatus,
      icon: CreditCard,
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "paid":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className="rounded-[32px] border p-8 shadow-sm"
      style={{
        background: colors.surface,
        borderColor: colors.border,
      }}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            Booking Details
          </p>

          <h2
            className="mt-2 text-3xl font-bold"
            style={{
              color: colors.text,
            }}
          >
            Booking Information
          </h2>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {details.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border p-5"
            style={{
              background: colors.surfaceAlt || colors.surface,
              borderColor: colors.border,
            }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-2">
                <Icon className="h-5 w-5 text-orange-500" />
              </div>

              <span
                className="text-sm font-medium"
                style={{
                  color: colors.textMuted,
                }}
              >
                {label}
              </span>
            </div>

            {label === "Status" || label === "Payment" ? (
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                  value,
                )}`}
              >
                {value}
              </span>
            ) : (
              <p
                className="text-lg font-semibold break-words"
                style={{
                  color: colors.text,
                }}
              >
                {value || "-"}
              </p>
            )}
          </div>
        ))}
      </div>

      <div
        className="mt-8 rounded-3xl border p-6"
        style={{
          background: colors.surfaceAlt || colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-orange-100 p-2">
            <FileText className="h-5 w-5 text-orange-500" />
          </div>

          <h3
            className="text-lg font-bold"
            style={{
              color: colors.text,
            }}
          >
            Special Instructions
          </h3>
        </div>

        <p
          className="leading-7"
          style={{
            color: colors.textMuted,
          }}
        >
          {booking.specialInstructions || "No special instructions provided."}
        </p>
      </div>
    </div>
  );
};

export default ProviderBookingInfo;
