import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const statusStyles = {
  Approved:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Cancelled: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Pending: "bg-[#FFF6E2] text-[#B87500] dark:bg-[#2A2210] dark:text-[#FFC300]",
};

const BookingCard = ({ booking, onCancel }) => {
  const badge = statusStyles[booking.status] || statusStyles.Pending;
  const center = booking.center;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-[#F0E1BE] dark:border-[#3A2E17] dark:bg-[#211B10]">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
              {booking.center?.centerName || "Center Deleted"}
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${badge}`}
            >
              {booking.status}
            </span>
          </div>

          <div className="space-y-1.5 text-sm text-[#6B5D45] dark:text-[#C9B896]">
            <p>
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                City:
              </span>{" "}
              {booking.center?.city || "N/A"}
            </p>
            <p>
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Child:
              </span>{" "}
              {booking.childName}
            </p>
            <p>
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Booking date:
              </span>{" "}
              {new Date(booking.bookingDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Plan:
              </span>{" "}
              {booking.planType}
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            {center ? (
              <Button
                asChild
                className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F] hover:opacity-90"
              >
                <Link to={`/parent/bookings/${booking._id}`}>View Details</Link>
              </Button>
            ) : (
              <Button disabled>Center Deleted</Button>
            )}

            {booking.status === "Pending" && (
              <Button
                variant="destructive"
                onClick={() => onCancel(booking._id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookingCard;
