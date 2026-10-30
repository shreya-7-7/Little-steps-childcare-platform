import { motion } from "framer-motion";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useTheme } from "../../../context/ThemeContext";

const COLORS = ["#FF9500", "#22C55E", "#3B82F6", "#EF4444", "#A855F7"];

const SubscriptionChart = ({ data }) => {
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
        No Subscription Data Available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl p-6"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 8px 24px rgba(36, 28, 15, 0.05)",
      }}
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold" style={{ color: colors.text }}>
          Subscription Analytics
        </h2>

        <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
          Distribution of subscription statuses
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="48%"
            outerRadius={115}
            innerRadius={65}
            paddingAngle={3}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke={colors.surface}
                strokeWidth={3}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              color: colors.text,
              boxShadow: "0 8px 24px rgba(36, 28, 15, 0.12)",
            }}
          />

          <Legend
            verticalAlign="bottom"
            height={30}
            iconType="circle"
            wrapperStyle={{
              color: colors.textMuted,
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SubscriptionChart;
