const BookingInfo = ({ booking }) => {
  const rows = [
    ["Child", booking.childName],
    ["Age", booking.childAge],
    ["Booking date", new Date(booking.bookingDate).toLocaleDateString()],
    ["Plan", booking.planType],
    ["Booking status", booking.status],
    ["Payment status", booking.paymentStatus],
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-[#F0E1BE] bg-white p-6 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
      <h2
        className="text-2xl font-bold text-[#241C0F] dark:text-[#FFF6E2]"
        style={{ fontFamily: "Fraunces, serif" }}
      >
        {booking.center.centerName}
      </h2>

      <div className="grid gap-2 text-sm">
        {rows.map(([label, value]) => (
          <p key={label} className="text-[#6B5D45] dark:text-[#C9B896]">
            <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
              {label}:
            </span>{" "}
            {value}
          </p>
        ))}
      </div>
    </div>
  );
};

export default BookingInfo;
