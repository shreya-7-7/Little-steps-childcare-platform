import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  UserPlus,
  User,
  GraduationCap,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import Reveal from "@/components/common/Reveal";
import Eyebrow from "@/components/common/Eyebrow";
import Button from "@/components/common/Button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createCaregiver } from "../../services/caregiverService";
import { getMyCenters } from "@/services/centerService";
import { useTheme } from "../../context/ThemeContext";

const CreateCaregiver = () => {
  const navigate = useNavigate();

  const { colors } = useTheme();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [centers, setCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      isAvailable: true,
      availability: "Available",
    },
  });

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoadingCenters(true);

        const response = await getMyCenters();

        setCenters(response.centers || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load centers");
      } finally {
        setLoadingCenters(false);
      }
    };

    fetchCenters();
  }, []);

  const handleImageChange = (event) => {
    const selectedImage = event.target.files?.[0];

    if (selectedImage) {
      setImage(selectedImage);
      setPreview(URL.createObjectURL(selectedImage));
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("qualification", data.qualification);
      formData.append("experience", Number(data.experience));
      formData.append("specialization", data.specialization || "");
      formData.append("isAvailable", String(data.isAvailable));
      formData.append("availability", data.availability);
      formData.append("center", data.center);

      if (image) {
        formData.append("profileImage", image);
      }

      const response = await createCaregiver(formData);

      toast.success(response.message || "Caregiver created successfully");

      navigate("/provider/caregivers");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create caregiver",
      );
    }
  };

  if (loadingCenters) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      {/*
        Fallback keyframe for the submit spinner below.
        This guarantees the spin animation works even if Tailwind's
        `animate-spin` utility isn't generated for this file (e.g. missing
        from tailwind.config.js `content` paths, or overridden by a global
        reset). The class name `cg-spin` is scoped/unique to avoid clashing
        with anything else in the app.
      */}
      <style>{`
        @keyframes cg-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .cg-spin {
          animation: cg-spin 0.6s linear infinite;
        }
      `}</style>

      <Reveal>
        <div
          className="rounded-[30px] border p-8 lg:p-10"
          style={{
            background: "linear-gradient(135deg,#FF9500 0%,#FFC533 100%)",
            borderColor: "#F6A300",
          }}
        >
          <div className="flex flex-col justify-between gap-8 lg:flex-row">
            <div>
              <Eyebrow>Create Caregiver</Eyebrow>

              <h1 className="mt-3 text-4xl font-black text-[#241C0F]">
                Add a new caregiver to your childcare center.
              </h1>

              <p className="mt-4 max-w-2xl text-[#5B4315]">
                Fill in the caregiver information below. The profile will
                immediately become available inside your provider dashboard.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-center"
            >
              <div className="rounded-3xl bg-white/90 p-8 backdrop-blur">
                <UserPlus className="h-16 w-16 text-orange-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-[30px] border p-8"
          style={{
            background: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Full Name */}

            <div className="space-y-2">
              <Label>Full Name</Label>

              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-orange-500" />

                <Input
                  placeholder="Enter caregiver name"
                  className="pl-10"
                  {...register("fullName", {
                    required: "Full name is required",
                  })}
                />
              </div>

              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Qualification */}

            <div className="space-y-2">
              <Label>Qualification</Label>

              <div className="relative">
                <GraduationCap className="absolute left-3 top-3.5 h-4 w-4 text-orange-500" />

                <Input
                  placeholder="Childcare Diploma"
                  className="pl-10"
                  {...register("qualification", {
                    required: "Qualification is required",
                  })}
                />
              </div>

              {errors.qualification && (
                <p className="text-sm text-red-500">
                  {errors.qualification.message}
                </p>
              )}
            </div>

            {/* Experience */}

            <div className="space-y-2">
              <Label>Experience</Label>

              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 h-4 w-4 text-orange-500" />

                <Input
                  type="number"
                  min="0"
                  placeholder="Years of experience"
                  className="pl-10"
                  {...register("experience", {
                    required: "Experience is required",
                    min: {
                      value: 0,
                      message: "Experience cannot be negative",
                    },
                  })}
                />
              </div>

              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Specialization */}

            <div className="space-y-2">
              <Label>Specialization</Label>

              <div className="relative">
                <Sparkles className="absolute left-3 top-3.5 h-4 w-4 text-orange-500" />

                <Input
                  placeholder="Infant Care"
                  className="pl-10"
                  {...register("specialization")}
                />
              </div>
            </div>

            {/* Availability */}

            <div className="space-y-2">
              <Label>Availability Status</Label>

              <select
                className="h-11 w-full rounded-xl border px-4 outline-none transition focus:ring-2 focus:ring-orange-400"
                style={{
                  background: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                {...register("availability")}
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            {/* Center */}

            <div className="space-y-2">
              <Label>Select Center</Label>

              <select
                disabled={loadingCenters}
                className="h-11 w-full rounded-xl border px-4 outline-none transition focus:ring-2 focus:ring-orange-400"
                style={{
                  background: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                {...register("center", {
                  required: "Please select a center",
                })}
              >
                <option value="">
                  {loadingCenters ? "Loading centers..." : "Select Center"}
                </option>

                {centers.map((center) => (
                  <option key={center._id} value={center._id}>
                    {center.centerName}
                  </option>
                ))}
              </select>

              {errors.center && (
                <p className="text-sm text-red-500">{errors.center.message}</p>
              )}
            </div>
          </div>

          {/* Active */}

          <div className="mt-8 flex items-center gap-3">
            <input
              id="isAvailable"
              type="checkbox"
              className="h-5 w-5 rounded accent-orange-500"
              {...register("isAvailable")}
            />

            <Label htmlFor="isAvailable">Available for duty</Label>
          </div>

          {/* Image */}

          <div className="mt-8 space-y-3">
            <Label>Profile Image</Label>

            <Input type="file" accept="image/*" onChange={handleImageChange} />

            {preview && (
              <motion.img
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                src={preview}
                alt="Preview"
                className="mt-4 h-40 w-40 rounded-2xl border object-cover"
                style={{
                  borderColor: colors.border,
                }}
              />
            )}
          </div>

          {/* Submit */}

          <div className="mt-10 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              icon={isSubmitting ? undefined : UserPlus}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="cg-spin h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                  Creating Caregiver...
                </span>
              ) : (
                "Create Caregiver"
              )}
            </Button>
          </div>
        </form>
      </Reveal>
    </div>
  );
};

export default CreateCaregiver;
