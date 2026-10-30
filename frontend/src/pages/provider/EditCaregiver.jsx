import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { UserRoundPen, Upload } from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import Reveal from "@/components/common/Reveal";
import Eyebrow from "@/components/common/Eyebrow";

import {
  getCaregiverDetails,
  updateCaregiver,
} from "@/services/caregiverService";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useTheme } from "../../context/ThemeContext";

const EditCaregiver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchCaregiver();
  }, []);

  const fetchCaregiver = async () => {
    try {
      setLoading(true);

      const response = await getCaregiverDetails(id);

      reset({
        fullName: response.caregiver.fullName,
        qualification: response.caregiver.qualification,
        experience: response.caregiver.experience,
        specialization: response.caregiver.specialization,
        isAvailable: response.caregiver.isAvailable,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load caregiver");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files?.[0];

    if (selectedImage) {
      setImage(selectedImage);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("qualification", data.qualification);
      formData.append("experience", Number(data.experience));
      formData.append("specialization", data.specialization || "");
      formData.append("isAvailable", data.isAvailable);

      if (image) {
        formData.append("profileImage", image);
      }

      const response = await updateCaregiver(id, formData);

      toast.success(response.message);

      navigate("/provider/caregivers");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update caregiver",
      );
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <div
          className="overflow-hidden rounded-[30px] border p-8 lg:p-10"
          style={{
            background: "linear-gradient(135deg,#FF9500 0%,#FFC300 100%)",
            borderColor: "#FFB000",
          }}
        >
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <Eyebrow>Edit Caregiver</Eyebrow>

              <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-[#241C0F]">
                Update Caregiver Information
              </h1>

              <p className="mt-4 max-w-xl text-[15px] text-[#4D3C16]">
                Keep caregiver details accurate by updating qualifications,
                availability and profile information.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl bg-white/90 p-6"
            >
              <UserRoundPen className="h-12 w-12 text-orange-500" />

              <p className="mt-4 font-semibold text-[#241C0F]">
                Caregiver Profile
              </p>
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
          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}

            <div className="space-y-2">
              <Label>Full Name</Label>

              <Input
                placeholder="Enter caregiver name"
                {...register("fullName", {
                  required: "Full name is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Qualification */}

            <div className="space-y-2">
              <Label>Qualification</Label>

              <Input
                placeholder="Child Care Diploma"
                {...register("qualification", {
                  required: "Qualification is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.qualification && (
                <p className="text-sm text-red-500">
                  {errors.qualification.message}
                </p>
              )}
            </div>

            {/* Experience */}

            <div className="space-y-2">
              <Label>Experience</Label>

              <Input
                type="number"
                min={0}
                placeholder="5"
                {...register("experience", {
                  required: "Experience is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Specialization */}

            <div className="space-y-2">
              <Label>Specialization</Label>

              <Input
                placeholder="Infant Care"
                {...register("specialization")}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />
            </div>
            {/* Availability */}

            <div className="flex items-center gap-3 md:col-span-2">
              <input
                id="isAvailable"
                type="checkbox"
                className="h-5 w-5 accent-orange-500"
                {...register("isAvailable")}
              />

              <Label htmlFor="isAvailable">Available for Duty</Label>
            </div>

            {/* Profile Image */}

            <div className="space-y-3 md:col-span-2">
              <Label>Profile Image</Label>

              <div
                className="rounded-2xl border-2 border-dashed p-8 text-center"
                style={{
                  borderColor: colors.border,
                  background: colors.surfaceAlt,
                }}
              >
                <Upload
                  className="mx-auto mb-4 h-10 w-10"
                  style={{ color: "#FF9500" }}
                />

                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <p
                  className="mt-3 text-sm"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Upload a new caregiver profile photo (optional).
                </p>

                {image && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 inline-block overflow-hidden rounded-2xl border"
                    style={{
                      borderColor: colors.border,
                    }}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="h-44 w-44 object-cover"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Submit */}

            <div className="md:col-span-2 pt-2">
              <Button type="submit" loading={isSubmitting} className="w-full">
                {isSubmitting ? "Updating Caregiver..." : "Update Caregiver"}
              </Button>
            </div>
          </div>
        </form>
      </Reveal>
    </div>
  );
};

export default EditCaregiver;
