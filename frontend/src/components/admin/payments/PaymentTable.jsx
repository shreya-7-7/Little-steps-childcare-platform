import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PaymentTable = ({ payments = [], onView }) => {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#211B10]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#F0E1BE] dark:border-[#3A2E17]">
              <th className="px-5 py-4 text-left text-sm font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                Parent
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                Child
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                Center
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                Amount
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                Method
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                Status
              </th>

              <th className="px-5 py-4 text-right text-sm font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment._id}
                className="border-b border-[#F0E1BE] transition-colors last:border-b-0 hover:bg-[#FFFDF7] dark:border-[#3A2E17] dark:hover:bg-[#2A2210]"
              >
                {/* Parent */}
                <td className="px-5 py-4">
                  <p className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                    {payment.parent?.name || "N/A"}
                  </p>

                  <p className="mt-1 text-xs text-[#6B5D45] dark:text-[#C9B896]">
                    {payment.parent?.email || "N/A"}
                  </p>
                </td>

                {/* Child */}
                <td className="px-5 py-4 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                  {payment.booking?.childName || (payment.subscription ? `Sub: ${payment.subscription.planType}` : "N/A")}
                </td>

                {/* Center */}
                <td className="px-5 py-4 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                  {payment.booking?.center?.centerName || payment.subscription?.center?.centerName || "N/A"}
                </td>

                {/* Amount */}
                <td className="px-5 py-4">
                  <span className="font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                    ₹{payment.amount ?? 0}
                  </span>
                </td>

                {/* Method */}
                <td className="px-5 py-4 text-sm capitalize text-[#6B5D45] dark:text-[#C9B896]">
                  {payment.paymentMethod || "N/A"}
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <Badge
                    className={
                      payment.status === "Paid"
                        ? "border-0 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                        : payment.status === "Pending"
                          ? "border-0 bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "border-0 bg-red-100 text-green-700 hover:bg-green-100 dark:bg-grenn-900/30 dark:text-green-400"
                    }
                  >
                    {payment.status || "Unknown"}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onView(payment)}
                      className="h-9 w-9 rounded-lg border-[#F0E1BE] bg-white hover:bg-[#FFF6E2] dark:border-[#3A2E17] dark:bg-[#211B10] dark:hover:bg-[#2A2210]"
                    >
                      <Eye className="h-4 w-4 text-[#FF9500]" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {!payments.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-14 text-center text-sm text-[#6B5D45] dark:text-[#C9B896]"
                >
                  No Payments Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTable;
