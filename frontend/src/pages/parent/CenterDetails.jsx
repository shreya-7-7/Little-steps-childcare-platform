import { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Info,
  RotateCcw,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import Loading from "../../components/common/Loading";
import WeeklyScheduleDisplay from "../../components/common/WeeklyScheduleDisplay";

import { getCenterBySlug } from "../../services/centerService";
import RazorpayButton from "../../components/parent/booking/RazorpayButton";

import { getCaregivers } from "@/services/caregiverService";
import { getCenterReviews } from "@/services/reviewService";
import CaregiverCard from "@/components/parent/CaregiverCard";

const FALLBACK_CHILDCARE_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20500%22%20width%3D%22800%22%20height%3D%22500%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23FFF3D6%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23FED7AA%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23bg)%22%2F%3E%3Ccircle%20cx%3D%22400%22%20cy%3D%22200%22%20r%3D%2280%22%20fill%3D%22%23FDBA74%22%20opacity%3D%220.5%22%2F%3E%3Cpath%20d%3D%22M400%20140c-33.1%200-60%2026.9-60%2060%200%2033.1%2026.9%2060%2060%2060s60-26.9%2060-60c0-33.1-26.9-60-60-60zm0%2030c16.5%200%2030%2013.5%2030%2030s-13.5%2030-30%2030-30-13.5-30-30%2013.5-30%2030-30zm-90%20150c0-30%2060-45%2090-45s90%2015%2090%2045v20H310v-20z%22%20fill%3D%22%23EA580C%22%20opacity%3D%220.8%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22390%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2226%22%20font-weight%3D%22600%22%20fill%3D%22%239A3412%22%20text-anchor%3D%22middle%22%3ELittle%20Steps%20Childcare%20Centre%3C%2Ftext%3E%3Ctext%20x%3D%22400%22%20y%3D%22425%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2216%22%20fill%3D%22%23C2410C%22%20text-anchor%3D%22middle%22%3EVerified%20%26amp%3B%20Licensed%20Facility%3C%2Ftext%3E%3C%2Fsvg%3E";

const selectClass =
  "w-full rounded-md border border-[#F0E1BE] bg-white px-3 py-2 text-sm text-[#241C0F] focus:outline-none focus:ring-2 focus:ring-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]";

const getEndDate = (planType, startDate) => {
  const date = new Date(startDate);

  switch (planType) {
    case "Monthly":
      date.setMonth(date.getMonth() + 1);
      break;

    case "Quarterly":
      date.setMonth(date.getMonth() + 3);
      break;

    case "Yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;

    default:
      break;
  }

  return date.toISOString();
};

const CenterDetails = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caregivers, setCaregivers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("Monthly");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const returnPath = location.state?.from || "/parent/centers";

  useEffect(() => {
    fetchCenter();
  }, [slug]);

  const fetchCenter = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCenterBySlug(slug);

      if (!data?.center) {
        throw new Error("Childcare centre information could not be found.");
      }

      setCenter(data.center);

      // Parallelize caregivers and reviews requests
      if (data.center._id) {
        const centerId = data.center._id;
        const [caregiverRes, reviewRes] = await Promise.allSettled([
          getCaregivers({ center: centerId }),
          getCenterReviews(centerId),
        ]);

        if (caregiverRes.status === "fulfilled") {
          setCaregivers(caregiverRes.value?.caregivers || []);
        } else {
          console.warn("Caregiver fetch warning:", caregiverRes.reason);
          setCaregivers([]);
        }

        if (reviewRes.status === "fulfilled") {
          setReviews(reviewRes.value?.reviews || []);
        } else {
          console.warn("Reviews fetch warning:", reviewRes.reason);
          setReviews([]);
        }
      }
    } catch (err) {
      console.error("Failed to load centre details:", err);
      const errMsg =
        err.response?.data?.message || err.message || "Failed to load childcare centre details.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => setShowSubscriptionModal(true);

  if (loading) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center gap-4 py-16 text-center">
        <Loading />
        <p className="text-sm font-medium text-[#57534E] dark:text-[#A8A29E]">
          Loading childcare centre details...
        </p>
      </div>
    );
  }

  if (error && !center) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-[#1C1917] dark:text-[#F8FAFC]">
          Unable to Load Childcare Centre
        </h2>
        <p className="mt-2 text-sm text-[#57534E] dark:text-[#D6D3D1]">
          {error}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={fetchCenter}
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
              Back to Centres
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-[#1C1917] dark:text-[#F8FAFC]">
          Centre not found
        </h2>
        <p className="mt-2 text-sm text-[#57534E] dark:text-[#D6D3D1]">
          The childcare centre you are looking for does not exist or has been removed.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            asChild
            className="rounded-xl bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F]"
          >
            <Link to={returnPath}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Centres
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const startDate = new Date().toISOString();
  const endDate = getEndDate(selectedPlan, startDate);

  const images = center.centerImages?.length
    ? center.centerImages
    : center.thumbnail?.url
      ? [{ url: center.thumbnail.url }]
      : [];

  const mainImageUrl =
    images[activeImageIndex]?.url ||
    images[0]?.url ||
    FALLBACK_CHILDCARE_IMAGE;

  const hasCoordinates =
    center.location?.latitude !== undefined &&
    center.location?.latitude !== null &&
    center.location?.longitude !== undefined &&
    center.location?.longitude !== null;

  const isVerifiedProvider =
    center.provider?.verificationStatus === "approved";

  const isDemoRecord =
    center.centerName?.includes("[DEMO]") ||
    center.slug?.includes("demo-") ||
    center.description?.toLowerCase().includes("demonstration") ||
    center.description?.toLowerCase().includes("sample record");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Return Path Navigation & Demo Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-xl border-[#F0E1BE] bg-white text-xs font-semibold text-[#241C0F] hover:bg-orange-50 dark:border-[#3A2E17] dark:bg-[#211B10] dark:text-[#FFF6E2]"
        >
          <Link to={returnPath}>
            <ArrowLeft className="mr-1.5 h-4 w-4 text-[#FF9500]" />
            Back to Centers
          </Link>
        </Button>

        {isDemoRecord && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Info className="h-3.5 w-3.5" />
            Sample Demonstration Record
          </span>
        )}
      </div>

      {/* Photos Gallery */}
      <div className="space-y-3">
        <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-amber-50 dark:bg-[#1A140A] shadow-sm">
          <img
            src={mainImageUrl}
            alt={center.centerName}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_CHILDCARE_IMAGE;
            }}
          />
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  activeImageIndex === idx
                    ? "border-[#FF9500] ring-2 ring-[#FF9500]/40"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={`${center.centerName} photo ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_CHILDCARE_IMAGE;
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Basic info header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1
              className="text-3xl font-bold text-[#241C0F] dark:text-[#FFF6E2]"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {center.centerName}
            </h1>

            {center.is24Hours && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Clock className="mr-1 h-3 w-3" />
                Open 24/7
              </span>
            )}

            {isVerifiedProvider ? (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                Verified Provider
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <AlertCircle className="mr-1 h-3.5 w-3.5" />
                Verification Pending
              </span>
            )}
          </div>

          <p className="mt-2 flex items-center text-[#6B5D45] dark:text-[#C9B896]">
            <MapPin className="mr-1.5 h-4 w-4 shrink-0 text-[#FF9500]" />
            {center.address ? `${center.address}, ` : ""}
            {center.city}, {center.state}
            {center.pincode ? ` - ${center.pincode}` : ""}
          </p>
        </div>

        {hasCoordinates && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${center.location.latitude},${center.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#F0E1BE] px-4 py-2 text-sm font-medium text-[#241C0F] transition hover:bg-orange-50 dark:border-[#3A2E17] dark:text-[#FFF6E2] dark:hover:bg-[#2A2210]"
          >
            <MapPin className="h-4 w-4 text-[#FF9500]" />
            View on Google Maps
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-[#F0E1BE] bg-white p-6 dark:border-[#3A2E17] dark:bg-[#211B10]">
        <h2 className="mb-2 text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
          About our center
        </h2>
        <p className="leading-relaxed text-[#6B5D45] dark:text-[#C9B896]">
          {center.description}
        </p>
      </div>

      {/* Key Specifications & Operations */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#F0E1BE] bg-white p-4 dark:border-[#3A2E17] dark:bg-[#211B10]">
          <p className="text-xs font-medium uppercase text-[#6B5D45] dark:text-[#C9B896]">
            Age Group
          </p>
          <p className="mt-1 text-lg font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            {center.ageGroup}
          </p>
        </div>

        <div className="rounded-xl border border-[#F0E1BE] bg-white p-4 dark:border-[#3A2E17] dark:bg-[#211B10]">
          <p className="text-xs font-medium uppercase text-[#6B5D45] dark:text-[#C9B896]">
            Capacity
          </p>
          <p className="mt-1 text-lg font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            {center.capacity} Children
          </p>
        </div>

        <div className="rounded-xl border border-[#F0E1BE] bg-white p-4 dark:border-[#3A2E17] dark:bg-[#211B10]">
          <p className="text-xs font-medium uppercase text-[#6B5D45] dark:text-[#C9B896]">
            Childcare Hours
          </p>
          <p className="mt-1 text-lg font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            {center.is24Hours
              ? "Round the clock (24/7)"
              : center.openingTime && center.closingTime && center.openingTime > center.closingTime
                ? `${center.openingTime} - ${center.closingTime} (Overnight Shift)`
                : `${center.openingTime} - ${center.closingTime}`}
          </p>
        </div>

        <div className="rounded-xl border border-[#F0E1BE] bg-white p-4 dark:border-[#3A2E17] dark:bg-[#211B10]">
          <p className="text-xs font-medium uppercase text-[#6B5D45] dark:text-[#C9B896]">
            Rating & Reviews
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            <Star className="h-4 w-4 fill-[#FF9500] text-[#FF9500]" />
            {center.rating && center.rating > 0 ? center.rating : "New"}
            <span className="text-xs font-normal text-[#6B5D45] dark:text-[#C9B896]">
              ({center.reviewCount || 0} reviews)
            </span>
          </p>
        </div>
      </div>

      {/* Pricing & Fee Structure */}
      <div className="rounded-2xl border border-[#F0E1BE] bg-white p-6 dark:border-[#3A2E17] dark:bg-[#211B10]">
        <h2 className="mb-4 text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
          Pricing & Plans
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 dark:border-orange-950 dark:bg-orange-950/20">
            <p className="text-sm font-medium text-[#6B5D45] dark:text-[#C9B896]">
              Monthly Subscription
            </p>
            <p className="mt-1 text-2xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
              ₹{center.monthlyFee}
              <span className="text-sm font-normal text-[#6B5D45] dark:text-[#C9B896]">
                {" "}
                / month
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-[#F0E1BE] bg-white p-4 dark:border-[#3A2E17] dark:bg-[#2A2210]">
            <p className="text-sm font-medium text-[#6B5D45] dark:text-[#C9B896]">
              Daily / Drop-in Rate
            </p>
            <p className="mt-1 text-2xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
              ₹{center.pricePerDay}
              <span className="text-sm font-normal text-[#6B5D45] dark:text-[#C9B896]">
                {" "}
                / day
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Operating Hours & Schedule */}
      <WeeklyScheduleDisplay center={center} />

      {/* Facilities & Safety Measures */}
      <div>
        <h2 className="mb-3 text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
          Facilities & Safety Infrastructure
        </h2>
        {center.facilities?.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {center.facilities.map((facility, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full border border-[#F0E1BE] bg-white px-3.5 py-1.5 text-sm font-medium text-[#241C0F] shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10] dark:text-[#FFF6E2]"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-[#FF9500]" />
                {facility}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B5D45] dark:text-[#C9B896]">
            No specific facilities listed.
          </p>
        )}
      </div>

      {/* Provider Details & Trust Verification */}
      {center.provider && (
        <div className="rounded-2xl border border-[#F0E1BE] bg-white p-6 dark:border-[#3A2E17] dark:bg-[#211B10]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
              Provider Verification & Credentials
            </h2>
            {isVerifiedProvider ? (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                Government ID Verified
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <AlertCircle className="mr-1 h-3.5 w-3.5" />
                Verification In Progress
              </span>
            )}
          </div>

          <div className="mt-4 grid gap-3 text-sm text-[#6B5D45] dark:text-[#C9B896] md:grid-cols-2">
            <p>
              <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Provider Name:
              </span>{" "}
              {center.provider.user?.name || "Registered Provider"}
            </p>
            {center.provider.qualification && (
              <p>
                <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                  Qualification:
                </span>{" "}
                {center.provider.qualification}
              </p>
            )}
            {center.provider.experience !== undefined && center.provider.experience > 0 && (
              <p>
                <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                  Experience:
                </span>{" "}
                {center.provider.experience} years
              </p>
            )}
            {center.provider.phone && (
              <p>
                <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                  Contact:
                </span>{" "}
                {center.provider.phone}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Meet Our Caregivers */}
      <div className="space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#1C1917] dark:text-[#F8FAFC]">
              Meet Our Caregivers
            </h2>
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              {caregivers.length} Dedicated Staff
            </span>
          </div>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#44403C] dark:text-[#D6D3D1]">
            Explore the certified, compassionate educators and childcare specialists assigned to this centre. Click any caregiver card to view their complete background, certifications, and experience.
          </p>
        </div>

        {caregivers.length === 0 ? (
          <div className="rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-8 text-center text-[#44403C] dark:border-[#292524] dark:bg-[#1C1917] dark:text-[#D6D3D1]">
            <p className="font-bold text-[#1C1917] dark:text-[#F8FAFC]">
              No caregivers currently registered for this centre.
            </p>
            <p className="mt-1 text-sm text-[#57534E] dark:text-[#A8A29E]">
              Staff assignments will appear here once allocated by the childcare provider.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {caregivers.map((caregiver) => (
              <CaregiverCard
                key={caregiver._id}
                caregiver={caregiver}
                returnPath={`${location.pathname}${location.search}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Genuine Parent Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1C1917] dark:text-[#F8FAFC]">
            Parent Reviews & Experiences
          </h2>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#FF9500]">
            <Star className="h-4 w-4 fill-[#FF9500] text-[#FF9500]" />
            {center.rating > 0 ? `${center.rating} / 5.0` : "New Center"}
            <span className="text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
              ({center.reviewCount || 0} {center.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-8 text-center text-[#44403C] dark:border-[#292524] dark:bg-[#1C1917] dark:text-[#D6D3D1]">
            <p className="font-bold text-[#1C1917] dark:text-[#F8FAFC]">
              No parent reviews yet
            </p>
            <p className="mt-1 text-sm text-[#57534E] dark:text-[#A8A29E]">
              Reviews appear here once parents complete their childcare bookings at this center.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="rounded-2xl border border-[#E7E5E4] bg-white p-5 shadow-sm dark:border-[#292524] dark:bg-[#1C1917]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF9500]/15 text-sm font-bold text-[#B87500] dark:bg-[#FF9500]/20 dark:text-[#FFC300]">
                      {rev.parent?.name ? rev.parent.name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1C1917] dark:text-[#F8FAFC]">
                        {rev.parent?.name || "Verified Parent"}
                      </p>
                      <p className="text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= rev.rating
                            ? "fill-[#FF9500] text-[#FF9500]"
                            : "text-gray-200 dark:text-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#292524] dark:text-[#E7E5E4]">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 pt-2">
        <Button
          asChild
          className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90"
        >
          <Link to={`/parent/book/${center.slug}`}>Book now</Link>
        </Button>

        <Button
          variant="outline"
          onClick={handleSubscribe}
          className="border-[#F0E1BE] font-semibold dark:border-[#3A2E17] dark:text-[#FFF6E2]"
        >
          Subscribe now
        </Button>
      </div>

      {/* Subscription modal */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-[#F0E1BE] bg-white p-6 shadow-xl dark:border-[#3A2E17] dark:bg-[#211B10]"
            >
              <h2
                className="mb-5 text-2xl font-bold text-[#241C0F] dark:text-[#FFF6E2]"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Choose subscription plan
              </h2>

              <select
                className={selectClass}
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSubscriptionModal(false)}
                  className="border-[#F0E1BE] dark:border-[#3A2E17] dark:text-[#FFF6E2]"
                >
                  Cancel
                </Button>

                <RazorpayButton
                  buttonText="Continue payment"
                  payload={{
                    center: center._id,
                    centerName: center.centerName,
                    planType: selectedPlan,
                    startDate,
                    endDate,
                  }}
                  onSuccess={() => {
                    setShowSubscriptionModal(false);
                    toast.success("Subscription activated successfully");
                    navigate("/parent/my-subscriptions");
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CenterDetails;
