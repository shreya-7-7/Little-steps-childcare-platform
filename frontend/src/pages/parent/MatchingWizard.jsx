import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Baby,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Navigation,
  Loader2,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Building2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCenters } from "../../services/centerService";
import { getCaregivers } from "../../services/caregiverService";
import CenterCard from "../../components/parent/CenterCard";
import CaregiverCard from "../../components/parent/CaregiverCard";
import Loading from "../../components/common/Loading";
import {
  buildDiscoveryParamsFromRequirements,
  validateStep,
} from "../../utils/matchingHelper";

const AGE_GROUPS = [
  { label: "Infant (0–1 yrs)", value: "Infant", icon: "🍼" },
  { label: "Toddler (1–3 yrs)", value: "Toddler", icon: "🧸" },
  { label: "Preschool (3–5 yrs)", value: "Preschool", icon: "🎨" },
  { label: "School Age (5+ yrs)", value: "School Age", icon: "📚" },
];

const SERVICE_TYPES = [
  {
    title: "Full-day care",
    desc: "Structured play, meals, and naps at a licensed childcare center.",
  },
  {
    title: "24x7 emergency care",
    desc: "Immediate on-call care for late shifts or hospital emergencies.",
  },
  {
    title: "After-school & homework",
    desc: "Afternoon supervision, pickup, and homework guidance.",
  },
  {
    title: "Special needs care",
    desc: "Caregivers trained for sensory, developmental, or physical support.",
  },
  {
    title: "Live-in nanny",
    desc: "Dedicated, verified caregiver residing with your family.",
  },
  {
    title: "Sibling & group care",
    desc: "Shared care for multiple children at preferential rates.",
  },
];

const SCHEDULE_OPTIONS = [
  { label: "Standard Daytime (08:00 – 18:00)", value: "daytime" },
  { label: "Evening Shift (16:00 – 22:00)", value: "evening" },
  { label: "Overnight Care (20:00 – 08:00)", value: "overnight" },
  { label: "24/7 Full Flexibility", value: "24hours" },
  { label: "Immediate Emergency Dispatch", value: "emergency" },
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MatchingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [matchedCenters, setMatchedCenters] = useState([]);
  const [matchedCaregivers, setMatchedCaregivers] = useState([]);
  const [locating, setLocating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    ageGroup: "",
    serviceType: "",
    careSchedule: "daytime",
    selectedDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "08:00",
    endTime: "18:00",
    location: null,
    radiusKm: 50,
    specialNotes: "",
  });

  const steps = [
    { title: "Child & Service", subtitle: "What type of care do you need?" },
    { title: "Schedule", subtitle: "When is childcare needed?" },
    { title: "Location", subtitle: "Where should the care take place?" },
    { title: "Review", subtitle: "Review and find matching providers" },
  ];

  // Geolocation trigger
  const handleAcquireLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        }));
        setLocating(false);
        toast.success("Current location captured successfully!");
      },
      (error) => {
        setLocating(false);
        toast.error(
          "Location access was denied or timed out. You can still proceed without GPS coordinates.",
        );
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleNext = () => {
    const errorMsg = validateStep(currentStep, formData);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.selectedDays.includes(day);
      return {
        ...prev,
        selectedDays: exists
          ? prev.selectedDays.filter((d) => d !== day)
          : [...prev.selectedDays, day],
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSearching(true);
      const { centerParams, caregiverParams } =
        buildDiscoveryParamsFromRequirements(formData);

      // Fetch authentic centers from existing database
      const centersRes = await getCenters(centerParams);
      const caregiversRes = await getCaregivers(caregiverParams);

      setMatchedCenters(centersRes.centers || []);
      setMatchedCaregivers(caregiversRes.caregivers || []);
      setHasSubmitted(true);
    } catch (err) {
      console.error("MATCHING SEARCH ERROR:", err);
      toast.error(
        err.response?.data?.message || "Failed to search for matching centers",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const resetWizard = () => {
    setHasSubmitted(false);
    setCurrentStep(0);
  };

  // ==========================================
  // RESULTS VIEW
  // ==========================================
  if (hasSubmitted) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
        {/* Header Banner */}
        <div className="rounded-3xl border border-[#F0E1BE] bg-[#FFFDF9] p-6 sm:p-8 dark:border-[#3A2E17] dark:bg-[#1C160C]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-950 dark:text-orange-300 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Tailored Matching Results
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#241C0F] dark:text-[#FFF6E2]"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Verified Matches for Your Family
              </h1>
              <p className="mt-1 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                Filtered by: <strong>{formData.serviceType}</strong> •{" "}
                <strong>{formData.ageGroup}</strong> •{" "}
                <strong>{formData.careSchedule} schedule</strong>
              </p>
            </div>

            <Button
              variant="outline"
              onClick={resetWizard}
              className="rounded-xl border-[#F0E1BE] text-xs font-medium self-start sm:self-auto"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Adjust Criteria
            </Button>
          </div>
        </div>

        {/* Centers Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
              Matching Childcare Centers ({matchedCenters.length})
            </h2>
          </div>

          {matchedCenters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#F0E1BE] p-8 text-center dark:border-[#3A2E17]">
              <p className="text-sm text-[#6B5D45] dark:text-[#C9B896]">
                No centers match all strict criteria in your current search radius.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link to="/centers">
                  <Button variant="outline" className="text-xs">
                    Browse All Active Centers
                  </Button>
                </Link>
                <Button
                  onClick={resetWizard}
                  className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-xs font-semibold text-[#241C0F]"
                >
                  Expand Criteria
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {matchedCenters.map((center) => (
                <CenterCard key={center._id} center={center} />
              ))}
            </div>
          )}
        </div>

        {/* Caregivers Section */}
        {matchedCaregivers.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
                Qualified Verified Caregivers ({matchedCaregivers.length})
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {matchedCaregivers.slice(0, 3).map((caregiver) => (
                <CaregiverCard key={caregiver._id} caregiver={caregiver} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // WIZARD FORM VIEW
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3.5 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-950 dark:text-orange-300">
          <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
          Little Steps Care Matching
        </span>
        <h1
          className="text-3xl sm:text-4xl font-extrabold text-[#241C0F] dark:text-[#FFF6E2]"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Tell Us What Care You Need
        </h1>
        <p className="text-sm text-[#6B5D45] dark:text-[#C9B896] max-w-lg mx-auto">
          Complete these quick steps to match your family with certified childcare centers and background-verified caregivers.
        </p>
      </div>

      {/* Progress Stepper Bar */}
      <div className="rounded-2xl border border-[#F0E1BE] bg-white p-4 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </span>
          <span className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-orange-100 dark:bg-orange-950/40 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Container */}
      <div className="rounded-3xl border border-[#F0E1BE] bg-white p-6 sm:p-8 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10] space-y-6">
        {/* STEP 1: Child Age & Service Type */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold dark:text-[#FFF6E2]">
                1. Select your child's age group *
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AGE_GROUPS.map((ag) => (
                  <button
                    key={ag.value}
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, ageGroup: ag.value }))
                    }
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                      formData.ageGroup === ag.value
                        ? "border-[#FF9500] bg-orange-50 font-bold text-orange-900 shadow-sm dark:bg-orange-950/30 dark:text-orange-300"
                        : "border-[#F0E1BE] hover:bg-slate-50 text-slate-700 dark:border-[#3A2E17] dark:text-slate-300 dark:hover:bg-[#2A2210]"
                    }`}
                  >
                    <span className="text-2xl mb-1">{ag.icon}</span>
                    <span className="text-xs">{ag.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold dark:text-[#FFF6E2]">
                2. What type of childcare service are you looking for? *
              </Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {SERVICE_TYPES.map((st) => (
                  <button
                    key={st.title}
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, serviceType: st.title }))
                    }
                    className={`flex flex-col text-left p-4 rounded-2xl border transition-all ${
                      formData.serviceType === st.title
                        ? "border-[#FF9500] bg-orange-50 font-bold text-orange-900 shadow-sm dark:bg-orange-950/30 dark:text-orange-300"
                        : "border-[#F0E1BE] hover:bg-slate-50 text-slate-700 dark:border-[#3A2E17] dark:text-slate-300 dark:hover:bg-[#2A2210]"
                    }`}
                  >
                    <span className="text-sm font-semibold mb-1">
                      {st.title}
                    </span>
                    <span className="text-xs font-normal text-[#6B5D45] dark:text-[#C9B896]">
                      {st.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Schedule & Timing */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold dark:text-[#FFF6E2]">
                Preferred Care Schedule *
              </Label>
              <div className="space-y-2">
                {SCHEDULE_OPTIONS.map((sch) => (
                  <label
                    key={sch.value}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                      formData.careSchedule === sch.value
                        ? "border-[#FF9500] bg-orange-50/70 font-semibold text-orange-900 dark:bg-orange-950/30 dark:text-orange-300"
                        : "border-[#F0E1BE] hover:bg-slate-50 text-slate-700 dark:border-[#3A2E17] dark:text-slate-300 dark:hover:bg-[#2A2210]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="careSchedule"
                      value={sch.value}
                      checked={formData.careSchedule === sch.value}
                      onChange={() =>
                        setFormData((p) => ({ ...p, careSchedule: sch.value }))
                      }
                      className="accent-[#FF9500] h-4 w-4"
                    />
                    <span className="text-xs sm:text-sm">{sch.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold dark:text-[#FFF6E2]">
                Days Needed Each Week *
              </Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const selected = formData.selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                        selected
                          ? "bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F] shadow-xs"
                          : "border border-[#F0E1BE] bg-white text-slate-700 hover:bg-slate-50 dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-slate-300"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Location & Distance */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold dark:text-[#FFF6E2]">
                Location Preferences
              </Label>
              <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
                Enable GPS location to prioritize centers closest to your home or office.
              </p>

              <div className="p-5 rounded-2xl border border-dashed border-[#F0E1BE] bg-slate-50/50 dark:border-[#3A2E17] dark:bg-[#1C160C] text-center space-y-3">
                {formData.location ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    GPS Coordinates Active (
                    {formData.location.lat.toFixed(3)},{" "}
                    {formData.location.lng.toFixed(3)})
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleAcquireLocation}
                    disabled={locating}
                    variant="outline"
                    className="rounded-xl border-[#FF9500] text-[#FF9500] text-xs font-semibold hover:bg-orange-50"
                  >
                    {locating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Detecting location...
                      </>
                    ) : (
                      <>
                        <Navigation className="mr-2 h-4 w-4" />
                        Use My Current Location
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium dark:text-[#FFF6E2]">
                Maximum Distance Radius
              </Label>
              <select
                aria-label="Search distance radius"
                value={formData.radiusKm}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, radiusKm: Number(e.target.value) }))
                }
                className="w-full rounded-xl border border-[#F0E1BE] bg-white p-2.5 text-xs font-medium text-slate-800 dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]"
              >
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Within 50 km (Standard)</option>
                <option value={100}>Within 100 km (Wide Region)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Additional Preferences */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                Review Your Matching Requirements
              </h3>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Child Age Group:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formData.ageGroup || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Category:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formData.serviceType || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Care Shift:</span>
                  <span className="font-semibold capitalize text-slate-900 dark:text-white">
                    {formData.careSchedule}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Days:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formData.selectedDays.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Proximity Radius:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formData.location
                      ? `Within ${formData.radiusKm} km of your GPS`
                      : "All regions"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium dark:text-[#FFF6E2]">
                Special Notes or Preferences (Optional)
              </Label>
              <Input
                placeholder="e.g. CCTV streaming required, organic meal plan, bilingual..."
                value={formData.specialNotes}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, specialNotes: e.target.value }))
                }
                className="border-[#F0E1BE] text-xs focus-visible:ring-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="rounded-xl border-[#F0E1BE] text-xs font-semibold text-slate-700 dark:border-[#3A2E17] dark:text-slate-300"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] text-xs hover:opacity-90 rounded-xl px-5"
            >
              Next Step
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSearching}
              className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] text-xs hover:opacity-90 rounded-xl px-6"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Best Matches...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Find My Matches
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingWizard;
