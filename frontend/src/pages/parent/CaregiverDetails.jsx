import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import { getCaregiverDetails } from "@/services/caregiverService";
import { Button } from "@/components/ui/button";

const CaregiverDetails = () => {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaregiver();
  }, [id]);

  const fetchCaregiver = async () => {
    try {
      const data = await getCaregiverDetails(id);
      setCaregiver(data.caregiver);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load caregiver");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!caregiver) {
    return (
      <div className="py-10 text-center">
        <h2 className="text-2xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
          Caregiver not found
        </h2>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl space-y-8"
    >
      <img
        src={
          caregiver.profileImage?.url ||
          "https://placehold.co/1000x500?text=Caregiver"
        }
        alt={caregiver.fullName}
        className="h-96 w-full rounded-2xl object-cover"
      />

      <div>
        <h1
          className="text-3xl font-bold text-[#241C0F] dark:text-[#FFF6E2]"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          {caregiver.fullName}
        </h1>
        <p className="text-[#6B5D45] dark:text-[#C9B896]">
          {caregiver.center?.centerName}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#F0E1BE] bg-white p-5 dark:border-[#3A2E17] dark:bg-[#211B10]">
          <h2 className="mb-4 text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            Professional details
          </h2>

          <div className="space-y-2.5 text-sm text-[#6B5D45] dark:text-[#C9B896]">
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
            <p>
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Status:
              </span>{" "}
              {caregiver.isAvailable ? (
                <span className="font-medium text-green-600 dark:text-green-400">
                  Available
                </span>
              ) : (
                <span className="font-medium text-red-600 dark:text-red-400">
                  Not available
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#F0E1BE] bg-white p-5 dark:border-[#3A2E17] dark:bg-[#211B10]">
          <h2 className="mb-4 text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            Center information
          </h2>

          <div className="space-y-2.5 text-sm text-[#6B5D45] dark:text-[#C9B896]">
            <p>
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Center:
              </span>{" "}
              {caregiver.center?.centerName || "Not assigned"}
            </p>
            {caregiver.center?.city && (
              <p>
                <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                  City:
                </span>{" "}
                {caregiver.center.city}
                {caregiver.center.state ? `, ${caregiver.center.state}` : ""}
              </p>
            )}
            {caregiver.center?.slug && (
              <div className="pt-2">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-[#F0E1BE] dark:border-[#3A2E17]"
                >
                  <Link to={`/parent/centers/${caregiver.center.slug}`}>
                    View Childcare Center
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CaregiverDetails;
