import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Building2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import Reveal from "@/components/common/Reveal";
import Eyebrow from "@/components/common/Eyebrow";

import { createCenter, getMyCenters } from "@/services/centerService";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useTheme } from "../../context/ThemeContext";

const CreateCenter = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [checking, setChecking] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));

    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  useEffect(() => {
    const checkCenter = async () => {
      try {
        const response = await getMyCenters();

        if (response.centers.length > 0) {
          toast.error("You have already created a childcare center.");

          navigate("/provider/center");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setChecking(false);
      }
    };

    checkCenter();
  }, [navigate]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    setImages(files);
  };

  const onSubmit = async (data) => {
    try {
      if (images.length === 0) {
        return toast.error("Please upload at least one image.");
      }

      const formData = new FormData();

      const facilities = data.facilities
        ? data.facilities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const payload = {
        ...data,
        capacity: Number(data.capacity),
        monthlyFee: Number(data.monthlyFee),
        pricePerDay: Number(data.pricePerDay),
        is24Hours: Boolean(data.is24Hours),
        facilities: JSON.stringify(facilities),
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      images.forEach((image) => {
        formData.append("centerImages", image);
      });

      const response = await createCenter(formData);

      toast.success(response.message || "Center created successfully.");

      navigate("/provider/center");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create center.");
    }
  };

  if (checking) {
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
              <Eyebrow>Create Center</Eyebrow>

              <h1 className="mt-2 max-w-2xl text-4xl font-extrabold leading-tight text-[#241C0F]">
                Register Your Childcare Center
              </h1>

              <p className="mt-4 max-w-xl text-[15px] text-[#4D3C16]">
                Fill in your center details, upload images and publish your
                childcare center for parents.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl bg-white/90 p-6"
            >
              <Building2 className="h-12 w-12 text-orange-500" />

              <p className="mt-4 font-semibold text-[#241C0F]">
                Childcare Center Registration
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
            {/* Center Name */}

            <div className="space-y-2">
              <Label>Center Name</Label>

              <Input
                placeholder="Little Steps Childcare"
                {...register("centerName", {
                  required: "Center name is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.centerName && (
                <p className="text-sm text-red-500">
                  {errors.centerName.message}
                </p>
              )}
            </div>

            {/* Address */}

            <div className="space-y-2">
              <Label>Address</Label>

              <Input
                placeholder="Street, City"
                {...register("address", {
                  required: "Address is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            {/* City */}

            <div className="space-y-2">
              <Label>City</Label>

              <Input
                placeholder="Kolkata"
                {...register("city", {
                  required: "City is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            {/* State */}

            <div className="space-y-2">
              <Label>State</Label>

              <Input
                placeholder="West Bengal"
                {...register("state", {
                  required: "State is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>

            {/* Pincode */}

            <div className="space-y-2">
              <Label>Pincode</Label>

              <Input
                placeholder="700001"
                {...register("pincode", {
                  required: "Pincode is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.pincode && (
                <p className="text-sm text-red-500">{errors.pincode.message}</p>
              )}
            </div>

            {/* Age Group */}

            <div className="space-y-2">
              <Label>Age Group</Label>

              <Input
                placeholder="2 - 5 Years"
                {...register("ageGroup", {
                  required: "Age group is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.ageGroup && (
                <p className="text-sm text-red-500">
                  {errors.ageGroup.message}
                </p>
              )}
            </div>

            {/* Opening Time */}

            <div className="space-y-2">
              <Label>Opening Time</Label>

              <Input
                type="time"
                {...register("openingTime", {
                  required: "Opening time is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.openingTime && (
                <p className="text-sm text-red-500">
                  {errors.openingTime.message}
                </p>
              )}
            </div>

            {/* Closing Time */}

            <div className="space-y-2">
              <Label>Closing Time</Label>

              <Input
                type="time"
                {...register("closingTime", {
                  required: "Closing time is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.closingTime && (
                <p className="text-sm text-red-500">
                  {errors.closingTime.message}
                </p>
              )}
            </div>
            {/* Capacity */}

            <div className="space-y-2">
              <Label>Capacity</Label>

              <Input
                type="number"
                placeholder="50"
                {...register("capacity", {
                  required: "Capacity is required",
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: "Capacity must be greater than 0",
                  },
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.capacity && (
                <p className="text-sm text-red-500">
                  {errors.capacity.message}
                </p>
              )}
            </div>

            {/* Price Per Day */}

            <div className="space-y-2">
              <Label>Price Per Day (₹)</Label>

              <Input
                type="number"
                placeholder="500"
                {...register("pricePerDay", {
                  required: "Price per day is required",
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: "Price must be greater than 0",
                  },
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.pricePerDay && (
                <p className="text-sm text-red-500">
                  {errors.pricePerDay.message}
                </p>
              )}
            </div>

            {/* Monthly Fee */}

            <div className="space-y-2">
              <Label>Monthly Fee (₹)</Label>

              <Input
                type="number"
                placeholder="5000"
                {...register("monthlyFee", {
                  required: "Monthly fee is required",
                  valueAsNumber: true,
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.monthlyFee && (
                <p className="text-sm text-red-500">
                  {errors.monthlyFee.message}
                </p>
              )}
            </div>

            {/* Facilities */}

            <div className="space-y-2 md:col-span-2">
              <Label>Facilities</Label>

              <Input
                placeholder="CCTV, Playground, Meals, Transport"
                {...register("facilities")}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              <p className="text-xs" style={{ color: colors.textMuted }}>
                Separate facilities with commas.
              </p>
            </div>

            {/* Description */}

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>

              <Textarea
                rows={5}
                placeholder="Describe your childcare center..."
                {...register("description", {
                  required: "Description is required",
                })}
                style={{
                  background: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              />

              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* 24 Hours */}

            <div className="flex items-center gap-3 md:col-span-2">
              <input
                id="is24Hours"
                type="checkbox"
                className="h-5 w-5 accent-orange-500"
                {...register("is24Hours")}
              />

              <Label htmlFor="is24Hours">Open 24 Hours</Label>
            </div>

            {/* Images */}

            <div className="space-y-3 md:col-span-2">
              <Label>Center Images</Label>

              <div
                className="rounded-2xl border-2 border-dashed p-8 text-center"
                style={{
                  borderColor: colors.border,
                  background: colors.surfaceAlt,
                }}
              >
                <ImagePlus
                  className="mx-auto mb-4 h-10 w-10"
                  style={{ color: "#FF9500" }}
                />

                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />

                <p className="mt-3 text-sm" style={{ color: colors.textMuted }}>
                  Upload multiple center photos.
                </p>
              </div>

              {previews.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {previews.map((preview, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -4 }}
                      className="overflow-hidden rounded-2xl border"
                      style={{
                        borderColor: colors.border,
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-44 w-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}

            <div className="md:col-span-2 pt-2">
              <Button type="submit" loading={isSubmitting} className="w-full">
                {isSubmitting
                  ? "Creating Center..."
                  : "Create Childcare Center"}
              </Button>
            </div>
          </div>
        </form>
      </Reveal>
    </div>
  );
};

export default CreateCenter;
