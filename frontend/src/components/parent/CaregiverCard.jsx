import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

const CaregiverCard = ({ caregiver }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-2xl border border-[#F0E1BE] bg-white shadow-sm transition-shadow hover:shadow-md dark:border-[#3A2E17] dark:bg-[#211B10]"
    >
      <img
        src={
          caregiver.profileImage?.url ||
          "https://placehold.co/600x400?text=Caregiver"
        }
        alt={caregiver.fullName}
        className="h-60 w-full object-cover"
      />

      <div className="space-y-3 p-5">
        <div>
          <h2 className="text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            {caregiver.fullName}
          </h2>
          <p className="text-sm text-[#6B5D45] dark:text-[#C9B896]">
            {caregiver.center?.centerName}
          </p>
        </div>

        <div className="space-y-1.5 text-sm text-[#6B5D45] dark:text-[#C9B896]">
          <p>
            <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
              Qualification:
            </span>{" "}
            {caregiver.qualification}
          </p>
          <p>
            <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
              Experience:
            </span>{" "}
            {caregiver.experience} years
          </p>
          <p>
            <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
              Specialization:
            </span>{" "}
            {caregiver.specialization || "General child care"}
          </p>
        </div>

        <Button
          asChild
          className="w-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F] hover:opacity-90"
        >
          <Link to={`/parent/caregivers/${caregiver._id}`}>View profile</Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default CaregiverCard;
