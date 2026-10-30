import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Users, Star, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useTheme } from "../../context/ThemeContext";
import { brand } from "../data/theme";

const STATUS_STYLES = {
  approved: { bg: `${brand[500]}20`, color: brand[500] },
  active: { bg: `${brand[500]}20`, color: brand[500] },
};

const CenterCard = ({ center }) => {
  const { colors } = useTheme();

  const statusKey = center.status?.toLowerCase() || "pending";

  const statusStyle = STATUS_STYLES[statusKey] || {
    bg: colors.surfaceAlt,
    color: colors.textMuted,
  };

  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.01,
      }}
      transition={{
        duration: 0.2,
      }}
      className="group overflow-hidden rounded-[30px] border shadow-sm transition-all hover:shadow-xl"
      style={{
        background: colors.surface,
        borderColor: colors.border,
      }}
    >
      {/* Image */}

      <div className="relative overflow-hidden">
        <img
          src={center.centerImages?.[0]?.url || "https://placehold.co/600x350"}
          alt={center.centerName}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <Badge
          className="absolute right-4 top-4 rounded-full border-0 px-4 py-1 font-semibold capitalize shadow-lg"
          style={{
            background: statusStyle.bg,
            color: statusStyle.color,
          }}
        >
          {center.status || "Pending"}
        </Badge>

        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur">
            <Star className="h-4 w-4 fill-orange-400 text-orange-400" />

            <span className="text-sm font-semibold text-gray-800">
              {center.rating ? center.rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}

      <div className="space-y-5 p-6">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{
              color: colors.text,
            }}
          >
            {center.centerName}
          </h2>

          <p
            className="mt-2 flex items-center gap-2"
            style={{
              color: colors.textMuted,
            }}
          >
            <MapPin className="h-4 w-4 text-orange-500" />
            {center.city}, {center.state}
          </p>
        </div>

        <div
          className="flex items-center justify-between rounded-2xl border p-4"
          style={{
            background: colors.surfaceAlt,
            borderColor: colors.border,
          }}
        >
          <div>
            <p
              className="text-xs"
              style={{
                color: colors.textMuted,
              }}
            >
              Capacity
            </p>

            <div className="mt-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />

              <span
                className="font-semibold"
                style={{
                  color: colors.text,
                }}
              >
                {center.capacity ? `${center.capacity} Kids` : "N/A"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p
              className="text-xs"
              style={{
                color: colors.textMuted,
              }}
            >
              Status
            </p>

            <p
              className="mt-1 font-semibold capitalize"
              style={{
                color: statusStyle.color,
              }}
            >
              {center.status || "Pending"}
            </p>
          </div>
        </div>

        <Button
          asChild
          className="h-12 w-full rounded-xl text-base font-semibold transition-all hover:shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${brand[500]}, ${brand[300]})`,
            color: brand.ink,
          }}
        >
          <Link
            to={`/provider/center/${center._id}`}
            className="flex items-center justify-center gap-2"
          >
            View Details
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default CenterCard;
