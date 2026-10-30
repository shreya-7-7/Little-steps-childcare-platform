import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  GraduationCap,
  Briefcase,
  Building2,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import Reveal from "@/components/common/Reveal";
import Eyebrow from "@/components/common/Eyebrow";

import { getCaregiverDetails } from "@/services/caregiverService";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useTheme } from "@/context/ThemeContext";

const CaregiverDetails = () => {
  const { colors } = useTheme();

  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [caregiver, setCaregiver] = useState(null);

  const fetchCaregiver = async () => {
    try {
      setLoading(true);

      const response = await getCaregiverDetails(id);

      setCaregiver(response.caregiver);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load caregiver.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaregiver();
  }, []);

  if (loading) return <Loading />;

  if (!caregiver) {
    return (
      <div
        className="rounded-[30px] border py-20 text-center"
        style={{
          background: colors.surface,
          borderColor: colors.border,
        }}
      >
        <h2
          className="text-3xl font-bold"
          style={{
            color: colors.text,
          }}
        >
          Caregiver Not Found
        </h2>

        <p
          className="mt-3"
          style={{
            color: colors.textMuted,
          }}
        >
          The caregiver you're looking for doesn't exist.
        </p>

        <Button className="mt-8" asChild>
          <Link to="/provider/caregivers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Caregivers
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <div
          className="overflow-hidden rounded-[32px] border p-8 lg:p-10"
          style={{
            background: "linear-gradient(135deg,#FF9500 0%,#FFC74A 100%)",
            borderColor: "#F5B000",
          }}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Eyebrow>Caregiver Profile</Eyebrow>

              <h1 className="mt-3 text-4xl font-extrabold text-[#241C0F]">
                {caregiver.fullName}
              </h1>

              <p className="mt-3 max-w-xl text-[#4D3C16]">
                View caregiver qualifications, experience and childcare center
                information.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                asChild
                className="h-11 rounded-xl border-2 border-white/70 bg-white/20 px-6 font-semibold text-[#241C0F] backdrop-blur transition-all hover:bg-white hover:text-black"
              >
                <Link to="/provider/caregivers">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>

              <Button
                asChild
                className="h-11 rounded-xl bg-[#241C0F] px-6 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-black"
              >
                <Link to={`/provider/caregivers/edit/${caregiver._id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border p-8 shadow-sm"
          style={{
            background: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex flex-col items-center">
              <img
                src={caregiver.profileImage?.url || "/default-avatar.png"}
                alt={caregiver.fullName}
                className="h-52 w-52 rounded-[28px] border-4 border-orange-200 object-cover shadow-md"
              />

              <Badge
                className="mt-5 rounded-full px-5 py-2"
                variant={caregiver.isAvailable ? "default" : "secondary"}
              >
                <BadgeCheck className="mr-2 h-4 w-4" />
                {caregiver.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>

            <div className="flex-1">
              <h2
                className="text-3xl font-bold"
                style={{
                  color: colors.text,
                }}
              >
                {caregiver.fullName}
              </h2>

              <p
                className="mt-2 text-lg"
                style={{
                  color: colors.textMuted,
                }}
              >
                {caregiver.qualification}
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: colors.border,
                  }}
                >
                  <div className="mb-3 flex items-center gap-2 text-orange-500">
                    <Briefcase className="h-5 w-5" />
                    <span className="font-semibold">Experience</span>
                  </div>

                  <p
                    className="text-2xl font-bold"
                    style={{
                      color: colors.text,
                    }}
                  >
                    {caregiver.experience} Years
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: colors.border,
                  }}
                >
                  <div className="mb-3 flex items-center gap-2 text-orange-500">
                    <GraduationCap className="h-5 w-5" />
                    <span className="font-semibold">Specialization</span>
                  </div>

                  <p
                    className="text-lg font-semibold"
                    style={{
                      color: colors.text,
                    }}
                  >
                    {caregiver.specialization || "N/A"}
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: colors.border,
                  }}
                >
                  <div className="mb-3 flex items-center gap-2 text-orange-500">
                    <Building2 className="h-5 w-5" />
                    <span className="font-semibold">Childcare Center</span>
                  </div>

                  <p
                    className="text-lg font-semibold"
                    style={{
                      color: colors.text,
                    }}
                  >
                    {caregiver.center?.centerName || "N/A"}
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: colors.border,
                  }}
                >
                  <div className="mb-3 flex items-center gap-2 text-orange-500">
                    <MapPin className="h-5 w-5" />
                    <span className="font-semibold">City</span>
                  </div>

                  <p
                    className="text-lg font-semibold"
                    style={{
                      color: colors.text,
                    }}
                  >
                    {caregiver.center?.city || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Reveal>
    </div>
  );
};

export default CaregiverDetails;
