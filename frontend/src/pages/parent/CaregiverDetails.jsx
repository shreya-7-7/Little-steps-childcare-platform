import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building2,
  RotateCcw,
  AlertCircle,
  FileText,
} from "lucide-react";

import Loading from "@/components/common/Loading";
import { getCaregiverDetails } from "@/services/caregiverService";
import { Button } from "@/components/ui/button";

const CaregiverDetails = () => {
  const { id } = useParams();
  const location = useLocation();

  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCaregiver();
  }, [id]);

  const fetchCaregiver = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCaregiverDetails(id);

      if (!data?.caregiver) {
        throw new Error("Caregiver profile could not be found.");
      }

      setCaregiver(data.caregiver);
    } catch (err) {
      console.error("Caregiver details error:", err);
      const errMsg =
        err.response?.data?.message || err.message || "Failed to load caregiver profile";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const returnPath =
    location.state?.from ||
    (caregiver?.center?.slug
      ? `/parent/centers/${caregiver.center.slug}`
      : "/parent/centers");

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 py-16 text-center">
        <Loading />
        <p className="text-sm font-medium text-[#57534E] dark:text-[#D6D3D1]">
          Loading caregiver profile...
        </p>
      </div>
    );
  }

  if (error || !caregiver) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-[#1C1917] dark:text-[#F8FAFC]">
          Caregiver Profile Not Found
        </h2>
        <p className="mt-2 text-sm text-[#57534E] dark:text-[#D6D3D1]">
          {error || "The caregiver profile you requested does not exist or is currently unavailable."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={fetchCaregiver}
            className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-[#E7E5E4] font-semibold dark:border-[#292524] dark:text-[#F8FAFC]"
          >
            <Link to={returnPath}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Centre
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const imageUrl = caregiver.profileImage?.url || "/default-avatar.svg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl space-y-6 pb-12"
    >
      {/* Top Navigation / Return Action */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-[#E7E5E4] bg-white font-semibold text-[#1C1917] hover:bg-[#F5F5F4] dark:border-[#292524] dark:bg-[#1C1917] dark:text-[#F8FAFC] dark:hover:bg-[#292524]"
        >
          <Link to={returnPath}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Centre Details
          </Link>
        </Button>

        {caregiver.center?.slug && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] dark:text-[#FB923C]"
          >
            <Link to={`/parent/centers/${caregiver.center.slug}`}>
              <Building2 className="mr-1.5 h-3.5 w-3.5" />
              {caregiver.center.centerName}
            </Link>
          </Button>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="overflow-hidden rounded-3xl border border-[#E7E5E4] bg-white shadow-sm dark:border-[#292524] dark:bg-[#1C1917]">
        <div className="grid md:grid-cols-12">
          {/* Portrait Image */}
          <div className="relative aspect-[4/3] md:col-span-5 md:aspect-auto md:min-h-[380px] bg-amber-50/40 dark:bg-[#15120D]">
            <img
              src={imageUrl}
              alt={caregiver.fullName}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/default-avatar.svg";
              }}
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute top-4 left-4">
              {caregiver.isAvailable !== false ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Available Staff
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                  Assigned
                </span>
              )}
            </div>
          </div>

          {/* Key Overview */}
          <div className="flex flex-col justify-between p-6 md:col-span-7 md:p-8">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-950/80 dark:text-orange-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Childcare Staff
                </span>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1C1917] dark:text-[#F8FAFC]">
                  {caregiver.fullName}
                </h1>
                {caregiver.center?.centerName && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#EA580C] dark:text-[#FB923C]">
                    <Building2 className="h-4 w-4 shrink-0" />
                    {caregiver.center.centerName}
                  </p>
                )}
              </div>

              {/* Bio snippet if available */}
              {caregiver.bio && (
                <p className="text-sm leading-relaxed text-[#44403C] dark:text-[#D6D3D1]">
                  {caregiver.bio}
                </p>
              )}

              {/* Quick stats pills */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] p-3 dark:border-[#292524] dark:bg-[#15120D]">
                  <p className="text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                    Experience
                  </p>
                  <p className="mt-0.5 text-base font-bold text-[#1C1917] dark:text-[#F8FAFC]">
                    {caregiver.experience} Years
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] p-3 dark:border-[#292524] dark:bg-[#15120D]">
                  <p className="text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                    Specialization
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-[#1C1917] dark:text-[#F8FAFC]">
                    {caregiver.specialization || "General Child Care"}
                  </p>
                </div>
              </div>
            </div>

            {/* Centre link action */}
            {caregiver.center?.slug && (
              <div className="pt-6">
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-95"
                >
                  <Link to={`/parent/centers/${caregiver.center.slug}`}>
                    Explore {caregiver.center.centerName}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Qualifications & Expertise */}
        <div className="space-y-4 rounded-3xl border border-[#E7E5E4] bg-white p-6 shadow-sm dark:border-[#292524] dark:bg-[#1C1917]">
          <div className="flex items-center gap-2 border-b border-[#F5F5F4] pb-3 dark:border-[#292524]">
            <Award className="h-5 w-5 text-[#EA580C] dark:text-[#FB923C]" />
            <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#F8FAFC]">
              Qualifications & Credentials
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                Formal Education & Training
              </p>
              <p className="mt-0.5 font-semibold text-[#1C1917] dark:text-[#F8FAFC]">
                {caregiver.qualification}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                Specialized Domain
              </p>
              <p className="mt-0.5 font-semibold text-[#1C1917] dark:text-[#F8FAFC]">
                {caregiver.specialization || "Early Childhood Care & Development"}
              </p>
            </div>

            {caregiver.certifications?.length > 0 && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                  Verified Certifications
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {caregiver.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] px-2.5 py-1 text-xs font-medium text-[#44403C] dark:border-[#292524] dark:bg-[#15120D] dark:text-[#D6D3D1]"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Childcare Centre Association */}
        <div className="space-y-4 rounded-3xl border border-[#E7E5E4] bg-white p-6 shadow-sm dark:border-[#292524] dark:bg-[#1C1917]">
          <div className="flex items-center gap-2 border-b border-[#F5F5F4] pb-3 dark:border-[#292524]">
            <Building2 className="h-5 w-5 text-[#EA580C] dark:text-[#FB923C]" />
            <h2 className="text-lg font-bold text-[#1C1917] dark:text-[#F8FAFC]">
              Assigned Childcare Centre
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                Centre Name
              </p>
              <p className="mt-0.5 font-semibold text-[#1C1917] dark:text-[#F8FAFC]">
                {caregiver.center?.centerName || "Demo Centre"}
              </p>
            </div>

            {caregiver.center?.address && (
              <div>
                <p className="text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                  Address
                </p>
                <p className="mt-0.5 font-semibold text-[#44403C] dark:text-[#D6D3D1]">
                  {caregiver.center.address}
                </p>
              </div>
            )}

            {(caregiver.center?.city || caregiver.center?.state) && (
              <div>
                <p className="text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                  Location
                </p>
                <p className="mt-0.5 flex items-center gap-1 font-semibold text-[#44403C] dark:text-[#D6D3D1]">
                  <MapPin className="h-3.5 w-3.5 text-[#EA580C] dark:text-[#FB923C]" />
                  {caregiver.center.city}
                  {caregiver.center.state ? `, ${caregiver.center.state}` : ""}
                </p>
              </div>
            )}

            {caregiver.center?.slug && (
              <div className="pt-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full border-[#E7E5E4] font-semibold text-[#1C1917] hover:bg-[#F5F5F4] dark:border-[#292524] dark:text-[#F8FAFC] dark:hover:bg-[#292524]"
                >
                  <Link to={`/parent/centers/${caregiver.center.slug}`}>
                    View All Centre Details & Amenities
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
