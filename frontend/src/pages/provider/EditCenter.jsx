import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

import Loading from "../../components/common/Loading";
import WeeklyScheduleEditor from "../../components/provider/WeeklyScheduleEditor";
import { validateClientSchedule } from "../../utils/scheduleValidation";

import { getMyCenters, updateCenter } from "../../services/centerService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "../../context/ThemeContext";

const buildFallbackSchedule = (centerData) => {
  if (centerData?.weeklySchedule && Object.keys(centerData.weeklySchedule).length > 0) {
    return centerData.weeklySchedule;
  }
  const is24 = Boolean(centerData?.is24Hours);
  const openTime = centerData?.openingTime || "08:00";
  const closeTime = centerData?.closingTime || "18:00";
  const [oH, oM] = openTime.split(":").map(Number);
  const [cH, cM] = closeTime.split(":").map(Number);
  const isOvernight = is24 ? false : closeTime !== "00:00" && (cH * 60 + cM) < (oH * 60 + oM);
  const defaultDay = is24
    ? { isOpen: true, is24Hours: true, intervals: [{ open: "00:00", close: "23:59", isOvernight: false }] }
    : { isOpen: true, is24Hours: false, intervals: [{ open: openTime, close: closeTime, isOvernight }] };
  return {
    monday: { ...defaultDay, intervals: [...defaultDay.intervals] },
    tuesday: { ...defaultDay, intervals: [...defaultDay.intervals] },
    wednesday: { ...defaultDay, intervals: [...defaultDay.intervals] },
    thursday: { ...defaultDay, intervals: [...defaultDay.intervals] },
    friday: { ...defaultDay, intervals: [...defaultDay.intervals] },
    saturday: is24 ? { ...defaultDay, intervals: [...defaultDay.intervals] } : { isOpen: false, is24Hours: false, intervals: [] },
    sunday: is24 ? { ...defaultDay, intervals: [...defaultDay.intervals] } : { isOpen: false, is24Hours: false, intervals: [] },
  };
};

const EditCenter = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { colors } = useTheme();

  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState(null);
  const [isLegacySchedule, setIsLegacySchedule] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const fetchCenter = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getMyCenters();
      const centersList = response.centers || [];

      // Strictly look up the center matching route parameter :id
      const centerData = id ? centersList.find((c) => c._id === id) : null;

      if (!centerData) {
        toast.error("Center not found or you do not have permission to edit it.");
        setCenter(null);
        return;
      }

      setCenter(centerData);
      const hasStructured = Boolean(centerData.weeklySchedule && Object.keys(centerData.weeklySchedule).length > 0);
      setIsLegacySchedule(!hasStructured);
      setWeeklySchedule(buildFallbackSchedule(centerData));

      reset({
        centerName: centerData.centerName,
        description: centerData.description,
        address: centerData.address,
        city: centerData.city,
        state: centerData.state,
        pincode: centerData.pincode,
        ageGroup: centerData.ageGroup,
        capacity: centerData.capacity,
        monthlyFee: centerData.monthlyFee,
        pricePerDay: centerData.pricePerDay,
        openingTime: centerData.openingTime,
        closingTime: centerData.closingTime,
        is24Hours: centerData.is24Hours,
        facilities: centerData.facilities?.join(", "),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load center.");
      setCenter(null);
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchCenter();
  }, [fetchCenter]);

  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));

    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleImageChange = (event) => {
    setImages(Array.from(event.target.files || []));
  };

  const onSubmit = async (data) => {
    try {
      if (weeklySchedule) {
        const clientErrors = validateClientSchedule(weeklySchedule);
        if (Object.keys(clientErrors).length > 0) {
          toast.error("Please fix weekly schedule validation errors before saving.");
          return;
        }
      }
      const formData = new FormData();

      const payload = {
        ...data,
        capacity: Number(data.capacity),
        monthlyFee: Number(data.monthlyFee),
        pricePerDay: Number(data.pricePerDay),
        is24Hours: Boolean(data.is24Hours),
        facilities: JSON.stringify(
          data.facilities
            ?.split(",")
            .map((item) => item.trim())
            .filter(Boolean) || [],
        ),
      };

      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (weeklySchedule) {
        formData.append("weeklySchedule", JSON.stringify(weeklySchedule));
      }

      images.forEach((image) => {
        formData.append("centerImages", image);
      });

      const response = await updateCenter(center._id, formData);

      toast.success(response.message || "Center updated successfully.");

      navigate("/provider/center");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update center.");
    }
  };

  if (loading) return <Loading />;

  if (!center) {
    return (
      <div
        className="rounded-[30px] border border-dashed py-24 text-center"
        style={{
          borderColor: colors.border,
        }}
      >
        <h2
          className="text-2xl font-bold"
          style={{
            color: colors.text,
          }}
        >
          Center Not Found
        </h2>
        <p
          className="mt-2 text-sm"
          style={{
            color: colors.textMuted,
          }}
        >
          The requested childcare center could not be found or you do not have permission to manage it.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/provider/center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Centers
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{
              color: colors.text,
              fontFamily: "Fraunces, serif",
            }}
          >
            Edit Childcare Center
          </h1>

          <p style={{ color: colors.textMuted }}>
            Update your childcare center information.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/provider/center")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button type="submit" form="edit-center-form" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <form
        id="edit-center-form"
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 rounded-2xl border p-8"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div>
          <Label>Center Name</Label>
          <Input {...register("centerName")} />
        </div>

        <div>
          <Label>Monthly Fee</Label>
          <Input type="number" {...register("monthlyFee")} />
        </div>

        <div>
          <Label>Price Per Day</Label>
          <Input type="number" {...register("pricePerDay")} />
        </div>

        <div>
          <Label>Capacity</Label>
          <Input type="number" {...register("capacity")} />
        </div>

        <div>
          <Label>Age Group</Label>
          <Input {...register("ageGroup")} />
        </div>

        <div>
          <Label>Opening Time</Label>
          <Input type="time" {...register("openingTime")} />
        </div>

        <div>
          <Label>Closing Time</Label>
          <Input type="time" {...register("closingTime")} />
        </div>

        <div>
          <Label>City</Label>
          <Input {...register("city")} />
        </div>

        <div>
          <Label>State</Label>
          <Input {...register("state")} />
        </div>

        <div>
          <Label>Pincode</Label>
          <Input {...register("pincode")} />
        </div>

        <div className="md:col-span-2">
          <Label>Address</Label>
          <Textarea rows={3} {...register("address")} />
        </div>

        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea rows={5} {...register("description")} />
        </div>

        <div className="md:col-span-2">
          <Label>Facilities</Label>
          <Input
            placeholder="CCTV, Meals, Playground"
            {...register("facilities")}
          />
        </div>

        <div className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            className="h-5 w-5"
            {...register("is24Hours")}
          />

          <Label>Open 24 Hours</Label>
        </div>

        {/* Weekly Schedule Management */}
        <div className="md:col-span-2 pt-4 border-t" style={{ borderColor: colors.border }}>
          {weeklySchedule && (
            <WeeklyScheduleEditor
              schedule={weeklySchedule}
              onChange={setWeeklySchedule}
              isLegacyFallback={isLegacySchedule}
            />
          )}
        </div>

        {/* Existing Images */}

        <div className="md:col-span-2">
          <Label className="mb-3 block">Current Images</Label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {center.centerImages?.map((image) => (
              <img
                key={image.public_id}
                src={image.url}
                alt=""
                className="h-40 w-full rounded-xl border object-cover"
                style={{ borderColor: colors.border }}
              />
            ))}
          </div>
        </div>

        {/* Upload */}

        <div className="md:col-span-2">
          <Label>Upload New Images</Label>

          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />

          {previews.length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {previews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt=""
                  className="h-40 w-full rounded-xl border object-cover"
                  style={{ borderColor: colors.border }}
                />
              ))}
            </div>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default EditCenter;
