import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, Briefcase, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const CaregiverCard = ({ caregiver, returnPath }) => {
  const location = useLocation();
  const effectiveReturn = returnPath || `${location.pathname}${location.search}`;

  const imageUrl =
    caregiver.profileImage?.url ||
    "/default-avatar.svg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white shadow-sm transition-all duration-200 hover:border-[#D6D3D1] hover:shadow-md dark:border-[#292524] dark:bg-[#1C1917] dark:hover:border-[#44403C]"
    >
      {/* Portrait presentation */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50/40 dark:bg-[#15120D]">
        <img
          src={imageUrl}
          alt={caregiver.fullName}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/default-avatar.svg";
          }}
          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        />

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          {caregiver.isAvailable !== false ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" />
              Available Staff
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-600/90 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
              Assigned
            </span>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#1C1917] transition-colors group-hover:text-[#EA580C] dark:text-[#F8FAFC] dark:group-hover:text-[#FB923C]">
              {caregiver.fullName}
            </h3>
            {caregiver.center?.centerName && (
              <p className="mt-0.5 text-xs font-semibold text-[#EA580C] dark:text-[#FB923C]">
                {caregiver.center.centerName}
              </p>
            )}
          </div>

          <div className="space-y-2 border-t border-[#F5F5F4] pt-3 text-xs dark:border-[#292524]">
            <div className="flex items-start gap-2">
              <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#EA580C] dark:text-[#FB923C]" />
              <p className="leading-snug text-[#44403C] dark:text-[#D6D3D1]">
                <span className="font-bold text-[#1C1917] dark:text-[#F8FAFC]">
                  Qualification:
                </span>{" "}
                {caregiver.qualification}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-[#EA580C] dark:text-[#FB923C]" />
              <p className="text-[#44403C] dark:text-[#D6D3D1]">
                <span className="font-bold text-[#1C1917] dark:text-[#F8FAFC]">
                  Experience:
                </span>{" "}
                {caregiver.experience} {caregiver.experience === 1 ? "year" : "years"}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#EA580C] dark:text-[#FB923C]" />
              <p className="leading-snug text-[#44403C] dark:text-[#D6D3D1]">
                <span className="font-bold text-[#1C1917] dark:text-[#F8FAFC]">
                  Specialization:
                </span>{" "}
                {caregiver.specialization || "Early Childhood Care & Development"}
              </p>
            </div>
          </div>
        </div>

        {/* View Profile Action */}
        <div className="pt-5">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] shadow-sm hover:opacity-95"
          >
            <Link
              to={`/parent/caregivers/${caregiver._id}`}
              state={{ from: effectiveReturn }}
            >
              View Profile
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CaregiverCard;
