import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, ExternalLink, ShieldCheck, AlertCircle, Clock, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTodayOperatingHoursSummary } from "../../utils/scheduleValidation";

// Self-contained, responsive SVG data URI fallback that works completely offline
const FALLBACK_CHILDCARE_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20500%22%20width%3D%22800%22%20height%3D%22500%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23FFF3D6%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23FED7AA%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23bg)%22%2F%3E%3Ccircle%20cx%3D%22400%22%20cy%3D%22200%22%20r%3D%2280%22%20fill%3D%22%23FDBA74%22%20opacity%3D%220.5%22%2F%3E%3Cpath%20d%3D%22M400%20140c-33.1%200-60%2026.9-60%2060%200%2033.1%2026.9%2060%2060%2060s60-26.9%2060-60c0-33.1-26.9-60-60-60zm0%2030c16.5%200%2030%2013.5%2030%2030s-13.5%2030-30%2030-30-13.5-30-30%2013.5-30%2030-30zm-90%20150c0-30%2060-45%2090-45s90%2015%2090%2045v20H310v-20z%22%20fill%3D%22%23EA580C%22%20opacity%3D%220.8%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22390%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2226%22%20font-weight%3D%22600%22%20fill%3D%22%239A3412%22%20text-anchor%3D%22middle%22%3ELittle%20Steps%20Childcare%20Centre%3C%2Ftext%3E%3Ctext%20x%3D%22400%22%20y%3D%22425%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2216%22%20fill%3D%22%23C2410C%22%20text-anchor%3D%22middle%22%3EVerified%20%26amp%3B%20Licensed%20Facility%3C%2Ftext%3E%3C%2Fsvg%3E";

const CenterCard = ({ center }) => {
  const location = useLocation();
  const isVerifiedProvider = center.provider?.verificationStatus === "approved";
  const todayHours = getTodayOperatingHoursSummary(center);
  const isDemoRecord =
    center.centerName?.includes("[DEMO]") ||
    center.slug?.includes("demo-") ||
    center.description?.toLowerCase().includes("demonstration") ||
    center.description?.toLowerCase().includes("sample record");

  const hasCoordinates =
    center.location?.latitude !== undefined &&
    center.location?.latitude !== null &&
    center.location?.longitude !== undefined &&
    center.location?.longitude !== null;

  // Safe identifier fallback: slug first, then _id
  const centerIdentifier = center.slug || center._id;

  // Pick primary image or fallback safely
  const initialImageUrl =
    center.centerImages?.length && center.centerImages[0]?.url
      ? center.centerImages[0].url
      : center.thumbnail?.url || FALLBACK_CHILDCARE_IMAGE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-[#F0E1BE] dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div className="relative h-52 w-full overflow-hidden bg-amber-50/60 dark:bg-[#1A140A]">
          <img
            src={initialImageUrl}
            alt={center.centerName}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_CHILDCARE_IMAGE;
            }}
          />

          {isDemoRecord && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-blue-600/90 backdrop-blur px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              <Info className="h-3 w-3" />
              Demo Record
            </span>
          )}
        </div>

        <CardContent className="space-y-3 p-5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                {center.centerName}
              </h2>

              {center.distanceKm !== null && center.distanceKm !== undefined && (
                <span className="shrink-0 inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                  <MapPin className="mr-1 h-3 w-3" />
                  {center.distanceKm} km
                </span>
              )}
            </div>

            <p className="text-sm text-[#6B5D45] dark:text-[#C9B896]">
              {center.city}, {center.state}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {isVerifiedProvider ? (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Verified Provider
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Pending Verification
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-[#6B5D45] dark:text-[#C9B896]">
            <p>
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Age group:
              </span>{" "}
              {center.ageGroup}
            </p>
            <p>
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Monthly fee:
              </span>{" "}
              ₹{center.monthlyFee}
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#FF9500]" />
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Today:
              </span>{" "}
              <span
                className={
                  todayHours === "Closed today"
                    ? "font-semibold text-rose-600 dark:text-rose-400"
                    : ""
                }
              >
                {todayHours}
              </span>
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-[#6B5D45] dark:text-[#C9B896]">
            <p>
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Provider:
              </span>{" "}
              {center.provider?.user?.name || "Provider"}
            </p>

            {hasCoordinates && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${center.location.latitude},${center.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#FF9500] hover:underline"
              >
                Map
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <p className="flex items-center gap-1 text-sm font-medium text-[#241C0F] dark:text-[#FFF6E2]">
            <Star className="h-4 w-4 fill-[#FF9500] text-[#FF9500]" />{" "}
            {center.rating && center.rating > 0 ? center.rating : "New"}
            {center.reviewCount ? (
              <span className="text-xs font-normal text-[#6B5D45] dark:text-[#C9B896]">
                ({center.reviewCount})
              </span>
            ) : null}
          </p>

          <Button
            asChild
            className="w-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F] hover:opacity-90"
          >
            <Link
              to={`/parent/centers/${centerIdentifier}`}
              state={{ from: `${location.pathname}${location.search}` }}
            >
              View details
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CenterCard;
