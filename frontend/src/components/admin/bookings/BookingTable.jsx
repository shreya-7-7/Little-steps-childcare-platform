import { CalendarDays, Eye, MapPin, User } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useTheme } from "../../../context/ThemeContext";

const BookingTable = ({ bookings, onView }) => {
  const { colors } = useTheme();

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return {
          backgroundColor: "#FF95001F",
          color: "#D97706",
        };

      case "Pending":
        return {
          backgroundColor: "#FFC3002A",
          color: "#A16207",
        };

      case "Rejected":
        return {
          backgroundColor: "#FEE2E2",
          color: "#DC2626",
        };

      case "Completed":
        return {
          backgroundColor: "#DCFCE7",
          color: "#15803D",
        };

      default:
        return {
          backgroundColor: colors.surfaceAlt,
          color: colors.textMuted,
        };
    }
  };

  const getPaymentStyle = (status) => {
    switch (status) {
      case "Paid":
        return {
          backgroundColor: "#DCFCE7",
          color: "#15803D",
        };

      case "Pending":
        return {
          backgroundColor: "#FFC3002A",
          color: "#A16207",
        };

      case "Failed":
        return {
          backgroundColor: "#FEE2E2",
          color: "#DC2626",
        };

      default:
        return {
          backgroundColor: colors.surfaceAlt,
          color: colors.textMuted,
        };
    }
  };

  if (!bookings?.length) {
    return (
      <div
        className="rounded-2xl border py-16 text-center"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: "#FF95001F",
            color: "#FF9500",
          }}
        >
          <CalendarDays className="h-5 w-5" />
        </div>

        <h3 className="mt-4 font-semibold" style={{ color: colors.text }}>
          No bookings found
        </h3>

        <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
          There are no bookings matching your search.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow
              className="hover:bg-transparent"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              }}
            >
              <TableHead style={{ color: colors.textMuted }}>Parent</TableHead>

              <TableHead style={{ color: colors.textMuted }}>Child</TableHead>

              <TableHead style={{ color: colors.textMuted }}>Center</TableHead>

              <TableHead style={{ color: colors.textMuted }}>
                Booking Date
              </TableHead>

              <TableHead style={{ color: colors.textMuted }}>Plan</TableHead>

              <TableHead style={{ color: colors.textMuted }}>Status</TableHead>

              <TableHead style={{ color: colors.textMuted }}>Payment</TableHead>

              <TableHead
                className="text-right"
                style={{ color: colors.textMuted }}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {bookings.map((booking) => (
              <TableRow
                key={booking._id}
                className="transition-colors"
                style={{
                  borderColor: colors.border,
                }}
              >
                {/* Parent */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: "#FF95001F",
                        color: "#FF9500",
                      }}
                    >
                      <User className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="max-w-32 truncate font-medium"
                        style={{ color: colors.text }}
                      >
                        {booking.parent?.name || "N/A"}
                      </p>

                      <p
                        className="max-w-32 truncate text-xs"
                        style={{ color: colors.textMuted }}
                      >
                        {booking.parent?.email || ""}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Child */}
                <TableCell>
                  <span className="font-medium" style={{ color: colors.text }}>
                    {booking.childName || "N/A"}
                  </span>
                </TableCell>

                {/* Center */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin
                      className="h-4 w-4 shrink-0"
                      style={{ color: "#FF9500" }}
                    />

                    <span
                      className="max-w-40 truncate"
                      style={{ color: colors.text }}
                    >
                      {booking.center?.centerName || "N/A"}
                    </span>
                  </div>
                </TableCell>

                {/* Date */}
                <TableCell>
                  <span
                    className="whitespace-nowrap text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </TableCell>

                {/* Plan */}
                <TableCell>
                  <span className="capitalize" style={{ color: colors.text }}>
                    {booking.planType || "N/A"}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    className="rounded-full border-0 px-3 py-1"
                    style={getStatusStyle(booking.status)}
                  >
                    {booking.status || "Unknown"}
                  </Badge>
                </TableCell>

                {/* Payment */}
                <TableCell>
                  <Badge
                    className="rounded-full border-0 px-3 py-1"
                    style={getPaymentStyle(booking.paymentStatus)}
                  >
                    {booking.paymentStatus || "Unknown"}
                  </Badge>
                </TableCell>

                {/* Action */}
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onView(booking)}
                    className="rounded-xl font-semibold shadow-sm"
                    style={{
                      backgroundColor: "#FF9500",
                      color: "#241C0F",
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BookingTable;
