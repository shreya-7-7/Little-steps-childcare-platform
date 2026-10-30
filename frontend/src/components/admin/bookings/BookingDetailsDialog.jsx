import {
  CalendarDays,
  Clock3,
  CreditCard,
  Mail,
  MapPin,
  User,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

import { useTheme } from "../../../context/ThemeContext";

const BookingDetailsDialog = ({ open, onOpenChange, booking }) => {
  const { colors } = useTheme();

  if (!booking) return null;

  const statusStyles = {
    Approved: {
      backgroundColor: "#FF95001F",
      color: "#D97706",
    },
    Pending: {
      backgroundColor: "#FFC3002A",
      color: "#A16207",
    },
    Rejected: {
      backgroundColor: "#FEE2E2",
      color: "#DC2626",
    },
    Completed: {
      backgroundColor: "#DCFCE7",
      color: "#15803D",
    },
  };

  const paymentStyles = {
    Paid: {
      backgroundColor: "#DCFCE7",
      color: "#15803D",
    },
    Pending: {
      backgroundColor: "#FFC3002A",
      color: "#A16207",
    },
    Failed: {
      backgroundColor: "#FEE2E2",
      color: "#DC2626",
    },
  };

  const currentStatusStyle = statusStyles[booking.status] || {
    backgroundColor: colors.surfaceAlt,
    color: colors.textMuted,
  };

  const currentPaymentStyle = paymentStyles[booking.paymentStatus] || {
    backgroundColor: colors.surfaceAlt,
    color: colors.textMuted,
  };

  const InfoCard = ({ icon: Icon, title, children }) => (
    <div
      className="rounded-2xl border p-5 transition-shadow hover:shadow-sm"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "#FF95001F",
            color: "#FF9500",
          }}
        >
          <Icon className="h-4 w-4" />
        </div>

        <h3 className="font-semibold" style={{ color: colors.text }}>
          {title}
        </h3>
      </div>

      <div className="space-y-2.5 text-sm">{children}</div>
    </div>
  );

  const DetailRow = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4">
      <span style={{ color: colors.textMuted }}>{label}</span>

      <span className="text-right font-medium" style={{ color: colors.text }}>
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-3xl"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
      >
        {/* Header */}
        <DialogHeader
          className="border-b px-6 py-5 sm:px-7"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #FF9500, #FFC300)",
                color: "#241C0F",
              }}
            >
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <DialogTitle
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Booking Details
              </DialogTitle>

              <p className="mt-0.5 text-xs" style={{ color: colors.textMuted }}>
                Complete information about this booking
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-5 p-6 sm:p-7">
          {/* Status Summary */}
          <div
            className="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
            }}
          >
            <div>
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: colors.textMuted }}
              >
                Booking Status
              </p>

              <p className="mt-1 font-semibold" style={{ color: colors.text }}>
                {booking.childName || "Booking"}
              </p>
            </div>

            <div className="flex gap-2">
              <Badge
                className="rounded-full border-0 px-3 py-1"
                style={currentStatusStyle}
              >
                {booking.status || "Unknown"}
              </Badge>

              <Badge
                className="rounded-full border-0 px-3 py-1"
                style={currentPaymentStyle}
              >
                {booking.paymentStatus || "Unknown"}
              </Badge>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Parent */}
            <InfoCard icon={User} title="Parent Information">
              <DetailRow label="Name" value={booking.parent?.name} />

              <DetailRow label="Email" value={booking.parent?.email} />
            </InfoCard>

            {/* Child */}
            <InfoCard icon={Users} title="Child Information">
              <DetailRow label="Name" value={booking.childName} />

              <DetailRow label="Age" value={booking.childAge} />
            </InfoCard>

            {/* Center */}
            <InfoCard icon={MapPin} title="Center">
              <DetailRow label="Name" value={booking.center?.centerName} />

              <DetailRow label="City" value={booking.center?.city} />
            </InfoCard>

            {/* Booking */}
            <InfoCard icon={Clock3} title="Booking Information">
              <DetailRow
                label="Date"
                value={
                  booking.bookingDate
                    ? new Date(booking.bookingDate).toLocaleDateString()
                    : "N/A"
                }
              />

              <DetailRow
                label="Time"
                value={
                  booking.startTime && booking.endTime
                    ? `${booking.startTime} - ${booking.endTime}`
                    : "N/A"
                }
              />

              <DetailRow label="Plan" value={booking.planType} />
            </InfoCard>

            {/* Payment */}
            <InfoCard icon={CreditCard} title="Payment">
              <div className="flex items-center justify-between gap-4">
                <span style={{ color: colors.textMuted }}>Status</span>

                <Badge
                  className="rounded-full border-0"
                  style={currentPaymentStyle}
                >
                  {booking.paymentStatus || "Unknown"}
                </Badge>
              </div>

              <DetailRow
                label="Amount"
                value={
                  booking.amount !== undefined ? `₹${booking.amount}` : "N/A"
                }
              />
            </InfoCard>

            {/* Contact */}
            <InfoCard icon={Mail} title="Contact">
              <DetailRow label="Parent Email" value={booking.parent?.email} />

              <DetailRow label="Center" value={booking.center?.centerName} />
            </InfoCard>
          </div>

          {/* Special Instructions */}
          {booking.specialInstructions && (
            <div
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <h3 className="mb-3 font-semibold" style={{ color: colors.text }}>
                Special Instructions
              </h3>

              <div
                className="rounded-xl p-4 text-sm leading-6"
                style={{
                  backgroundColor: colors.surfaceAlt,
                  color: colors.textMuted,
                }}
              >
                {booking.specialInstructions}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
