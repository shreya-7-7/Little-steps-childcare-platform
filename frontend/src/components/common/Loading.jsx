import { Baby } from "lucide-react";
import { motion } from "framer-motion";

import { useTheme } from "../../context/ThemeContext";

const Loading = ({ text = "Loading..." }) => {
  const { colors } = useTheme();

  return (
    <div className="flex min-h-[240px] w-full flex-col items-center justify-center gap-4">
      {/* Animated Baby Icon */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [0, -3, 3, 0],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: colors.surfaceAlt,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 8px 20px rgba(255, 149, 0, 0.12)",
        }}
      >
        <Baby
          className="h-9 w-9"
          strokeWidth={1.8}
          style={{
            color: "#FF9500",
          }}
        />
      </motion.div>

      {/* Loading Text */}
      <motion.p
        animate={{
          opacity: [0.55, 1, 0.55],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-sm font-medium"
        style={{
          color: colors.textMuted,
        }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export default Loading;
