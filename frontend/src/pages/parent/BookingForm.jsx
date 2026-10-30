import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";

import { getCenterBySlug } from "../../services/centerService";
import { createBooking } from "../../services/bookingService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inputClass =
  "border-[#F0E1BE] focus-visible:ring-[#FF9500] focus-visible:border-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2] dark:placeholder:text-[#8A7A5C]";

const selectClass =
  "w-full rounded-md border border-[#F0E1BE] bg-white px-3 py-2 text-sm text-[#241C0F] focus:outline-none focus:ring-2 focus:ring-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]";

const BookingForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchCenter();
  }, [slug]);

  const fetchCenter = async () => {
    try {
      setLoading(true);
      const data = await getCenterBySlug(slug);
      setCenter(data.center);
    } catch (error) {
      toast.error(error.response?.data?.message || "Center not found");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      let amount = 0;

      switch (formData.planType) {
        case "Hourly": {
          const hourlyRate = Math.round(center.monthlyFee / 160);
          if (formData.startTime && formData.endTime) {
            const [sH, sM] = formData.startTime.split(":").map(Number);
            const [eH, eM] = formData.endTime.split(":").map(Number);
            let diff = (eH * 60 + eM) - (sH * 60 + sM);
            if (diff <= 0) diff += 24 * 60; // overnight
            const hours = Math.max(1, Math.round(diff / 60));
            amount = hourlyRate * hours;
          } else {
            amount = hourlyRate;
          }
          break;
        }

        case "Daily":
          amount = center.pricePerDay || Math.round(center.monthlyFee / 30);
          break;

        case "Monthly":
          amount = center.monthlyFee;
          break;

        default:
          amount = center.monthlyFee;
      }

      const bookingData = {
        ...formData,
        center: center._id,
        childAge: Number(formData.childAge),
        amount,
      };

      const response = await createBooking(bookingData);

      toast.success(response.message);
      window.dispatchEvent(new Event("refresh-notifications"));

      navigate("/parent/my-bookings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    }
  };

  if (loading) return <Loading />;
  if (!center) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Center information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-[#F0E1BE] bg-white p-6 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]"
      >
        <h2
          className="text-2xl font-bold text-[#241C0F] dark:text-[#FFF6E2]"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          {center.centerName}
        </h2>

        <p className="mt-2 text-[#6B5D45] dark:text-[#C9B896]">
          {center.city}, {center.state}
        </p>

        <div className="mt-6 space-y-2 text-sm text-[#6B5D45] dark:text-[#C9B896]">
          <p>
            <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
              Monthly fee:
            </span>{" "}
            ₹{center.monthlyFee}
          </p>
          <p>
            <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
              Daily / Drop-in rate:
            </span>{" "}
            ₹{center.pricePerDay || Math.round(center.monthlyFee / 30)}
          </p>
          <p>
            <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
              Hourly rate (approx):
            </span>{" "}
            ₹{Math.round(center.monthlyFee / 160)} / hr
          </p>
          <p>
            <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
              Total Capacity:
            </span>{" "}
            {center.capacity} Children
          </p>
          <p>
            <span className="font-medium text-[#241C0F] dark:text-[#FFF6E2]">
              Age group:
            </span>{" "}
            {center.ageGroup}
          </p>
        </div>
      </motion.div>

      {/* Booking form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border border-[#F0E1BE] bg-white p-6 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]"
      >
        <div className="space-y-2">
          <Label className="dark:text-[#FFF6E2]">Child name</Label>
          <Input
            placeholder="Enter child name"
            className={inputClass}
            {...register("childName", { required: "Child name is required" })}
          />
          {errors.childName && (
            <p className="text-sm text-red-500">{errors.childName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="dark:text-[#FFF6E2]">Child age</Label>
          <Input
            type="number"
            min="0"
            placeholder="Enter child age"
            className={inputClass}
            {...register("childAge", {
              required: "Child age is required",
              min: { value: 0, message: "Age cannot be negative" },
            })}
          />
          {errors.childAge && (
            <p className="text-sm text-red-500">{errors.childAge.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="dark:text-[#FFF6E2]">Booking date</Label>
          <Input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            className={inputClass}
            {...register("bookingDate", {
              required: "Booking date is required",
            })}
          />
          {errors.bookingDate && (
            <p className="text-sm text-red-500">{errors.bookingDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="dark:text-[#FFF6E2]">Start time</Label>
          <Input
            type="time"
            className={inputClass}
            {...register("startTime", { required: "Start time is required" })}
          />
          {errors.startTime && (
            <p className="text-sm text-red-500">{errors.startTime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="dark:text-[#FFF6E2]">End time</Label>
          <Input
            type="time"
            className={inputClass}
            {...register("endTime", { required: "End time is required" })}
          />
          {errors.endTime && (
            <p className="text-sm text-red-500">{errors.endTime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="dark:text-[#FFF6E2]">Plan type</Label>
          <select
            className={selectClass}
            defaultValue=""
            {...register("planType", { required: "Plan type is required" })}
          >
            <option value="" disabled>
              Select plan
            </option>
            <option value="Hourly">Hourly</option>
            <option value="Daily">Daily</option>
            <option value="Monthly">Monthly</option>
          </select>
          {errors.planType && (
            <p className="text-sm text-red-500">{errors.planType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="dark:text-[#FFF6E2]">Special instructions</Label>
          <Textarea
            rows={4}
            placeholder="Any special requirements..."
            className={inputClass}
            {...register("specialInstructions")}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90"
        >
          {isSubmitting ? "Submitting..." : "Book now"}
        </Button>
      </motion.form>
    </div>
  );
};

export default BookingForm;
