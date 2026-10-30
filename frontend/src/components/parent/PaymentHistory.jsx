import { motion } from "framer-motion";

import PaymentCard from "./PaymentCard";

const PaymentHistory = ({ payments, loading }) => {
  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-[#6B5D45] dark:text-[#C9B896]">
        Loading payments...
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-[#6B5D45] dark:text-[#C9B896]">
        No payment history found
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {payments.map((payment, i) => (
        <motion.div
          key={payment._id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.25, delay: Math.min(i, 5) * 0.05 }}
        >
          <PaymentCard payment={payment} />
        </motion.div>
      ))}
    </div>
  );
};

export default PaymentHistory;
