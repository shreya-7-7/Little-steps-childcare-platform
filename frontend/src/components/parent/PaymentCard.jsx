const statusStyles = {
  Success:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pending: "bg-[#FFF6E2] text-[#B87500] dark:bg-[#2A2210] dark:text-[#FFC300]",
};

const PaymentCard = ({ payment }) => {
  const badge = statusStyles[payment.status] || statusStyles.Pending;

  return (
    <div className="rounded-2xl border border-[#F0E1BE] bg-white p-5 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
          {payment.booking?.center?.centerName ||
            payment.subscription?.center?.centerName}
        </h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge}`}>
          {payment.status}
        </span>
      </div>

      <div className="space-y-1 text-sm text-[#6B5D45] dark:text-[#C9B896]">
        <p>
          <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
            Amount:
          </span>{" "}
          ₹{payment.amount}
        </p>
        <p>
          <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
            Payment method:
          </span>{" "}
          {payment.paymentMethod}
        </p>
        <p>
          <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
            Date:
          </span>{" "}
          {new Date(payment.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PaymentCard;
