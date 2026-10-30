import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useTheme } from "../../../context/ThemeContext";

const BookingChart = ({ data }) => {
  const { colors } = useTheme();

  if (!data?.length) {
    return (
      <div
        className="flex h-[420px] items-center justify-center rounded-2xl"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          color: colors.textMuted,
        }}
      >
        No Booking Data Available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-6"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 8px 24px rgba(36, 28, 15, 0.05)",
      }}
    >
      <div className="mb-6">
        <h2 className="text-lg font-bold" style={{ color: colors.text }}>
          Booking Analytics
        </h2>

        <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
          Overview of bookings by status
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid
            stroke={colors.border}
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="status"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: colors.textMuted,
              fontSize: 12,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: colors.textMuted,
              fontSize: 12,
            }}
          />

          <Tooltip
            cursor={{
              fill: colors.surfaceAlt,
            }}
            contentStyle={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              color: colors.text,
              boxShadow: "0 8px 24px rgba(36, 28, 15, 0.12)",
            }}
          />

          <Bar
            dataKey="count"
            fill="#FF9500"
            radius={[8, 8, 0, 0]}
            barSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default BookingChart;
