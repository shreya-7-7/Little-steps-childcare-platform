import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Phone,
  Mail,
  Users,
  IndianRupee,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";
import WeeklyScheduleDisplay from "../../components/common/WeeklyScheduleDisplay";
import Reveal from "@/components/common/Reveal";
import Eyebrow from "@/components/common/Eyebrow";
import Button from "@/components/common/Button";

import { Badge } from "@/components/ui/badge";

import { getCenterDetails } from "../../services/centerService";
import { useTheme } from "../../context/ThemeContext";

const CenterDetails = () => {
  const { id } = useParams();

  const { colors } = useTheme();

  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCenter();
  }, [id]);

  const fetchCenter = async () => {
    try {
      setLoading(true);

      const response = await getCenterDetails(id);

      setCenter(response.center);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load center.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!center) {
    return (
      <div
        className="rounded-[30px] border border-dashed py-24 text-center"
        style={{
          borderColor: colors.border,
        }}
      >
        <h2
          className="text-3xl font-bold"
          style={{
            color: colors.text,
          }}
        >
          Center Not Found
        </h2>

        <p
          className="mt-3"
          style={{
            color: colors.textMuted,
          }}
        >
          The childcare center doesn't exist.
        </p>

        <div className="mt-8">
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
    <div className="space-y-8">
      {/* Header */}

      <Reveal>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Eyebrow>Childcare Center</Eyebrow>

            <h1
              className="mt-2 text-4xl font-black"
              style={{
                color: colors.text,
              }}
            >
              {center.centerName}
            </h1>

            <p
              className="mt-3 flex items-center gap-2"
              style={{
                color: colors.textMuted,
              }}
            >
              <MapPin className="h-4 w-4 text-orange-500" />
              {center.city}, {center.state}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/provider/center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>

            <Button asChild>
              <Link to={`/provider/center/edit/${center._id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Center
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Hero */}

      <Reveal delay={0.1}>
        <motion.div
          whileHover={{
            y: -2,
          }}
          className="overflow-hidden rounded-[32px] border"
          style={{
            background: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="relative">
            <img
              src={
                center.centerImages?.[0]?.url ||
                "https://placehold.co/1200x500?text=Childcare+Center"
              }
              alt={center.centerName}
              className="h-[420px] w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <Badge className="absolute right-6 top-6 border-0 px-5 py-2 text-sm capitalize">
              {center.status}
            </Badge>

            <div className="absolute bottom-8 left-8 max-w-3xl">
              <Eyebrow className="text-white">Little Steps Childcare</Eyebrow>

              <h2 className="mt-3 text-5xl font-black text-white">
                {center.centerName}
              </h2>

              <p className="mt-4 max-w-2xl text-white/90">
                {center.description}
              </p>
            </div>
          </div>

          <div
            className="grid gap-5 border-t p-8 md:grid-cols-4"
            style={{
              borderColor: colors.border,
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-orange-500" />

                <p
                  className="text-sm"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Monthly Fee
                </p>
              </div>

              <h3
                className="mt-2 text-3xl font-bold"
                style={{
                  color: colors.text,
                }}
              >
                ₹{center.monthlyFee}
              </h3>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />

                <p
                  className="text-sm"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Capacity
                </p>
              </div>

              <h3
                className="mt-2 text-3xl font-bold"
                style={{
                  color: colors.text,
                }}
              >
                {center.capacity}
              </h3>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-orange-500" />

                <p
                  className="text-sm"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Contact
                </p>
              </div>

              <h3
                className="mt-2 font-semibold"
                style={{
                  color: colors.text,
                }}
              >
                {center.phone}
              </h3>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-orange-500" />

                <p
                  className="text-sm"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Open
                </p>
              </div>

              <h3
                className="mt-2 font-semibold"
                style={{
                  color: colors.text,
                }}
              >
                {center.is24Hours ? "24 Hours" : "Day Care"}
              </h3>
            </div>
          </div>
        </motion.div>
      </Reveal>
      {/* Information */}

      <Reveal delay={0.2}>
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-[30px] border p-8"
            style={{
              background: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h2
              className="mb-8 text-2xl font-bold"
              style={{
                color: colors.text,
              }}
            >
              Center Information
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span style={{ color: colors.textMuted }}>Monthly Fee</span>

                <span className="font-semibold" style={{ color: colors.text }}>
                  ₹{center.monthlyFee}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: colors.textMuted }}>Capacity</span>

                <span className="font-semibold" style={{ color: colors.text }}>
                  {center.capacity} Children
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: colors.textMuted }}>Phone</span>

                <span className="font-semibold" style={{ color: colors.text }}>
                  {center.phone}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: colors.textMuted }}>Email</span>

                <span
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: colors.text }}
                >
                  <Mail className="h-4 w-4 text-orange-500" />
                  {center.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: colors.textMuted }}>Operating Hours</span>

                <span className="font-semibold text-sm" style={{ color: colors.text }}>
                  {center.is24Hours
                    ? "24/7 (Round the Clock)"
                    : center.openingTime && center.closingTime && center.openingTime > center.closingTime
                      ? `${center.openingTime} - ${center.closingTime} (Overnight)`
                      : `${center.openingTime || "--"} - ${center.closingTime || "--"}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: colors.textMuted }}>24 Hours Care</span>

                <Badge>{center.is24Hours ? "Available" : "No"}</Badge>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-[30px] border p-8"
            style={{
              background: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h2
              className="mb-8 text-2xl font-bold"
              style={{
                color: colors.text,
              }}
            >
              Facilities
            </h2>

            {center.facilities?.length ? (
              <div className="flex flex-wrap gap-3">
                {center.facilities.map((facility, index) => (
                  <Badge
                    key={index}
                    className="rounded-full px-4 py-2"
                    variant="secondary"
                  >
                    {facility}
                  </Badge>
                ))}
              </div>
            ) : (
              <p style={{ color: colors.textMuted }}>
                No facilities available.
              </p>
            )}
          </motion.div>
        </div>
      </Reveal>

      {/* Weekly Schedule Display */}
      <Reveal delay={0.25}>
        <WeeklyScheduleDisplay center={center} />
      </Reveal>

      {/* Gallery */}

      {center.centerImages?.length > 0 && (
        <Reveal delay={0.3}>
          <div
            className="rounded-[30px] border p-8"
            style={{
              background: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h2
              className="mb-8 text-2xl font-bold"
              style={{
                color: colors.text,
              }}
            >
              Gallery
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {center.centerImages.map((image, index) => (
                <motion.div
                  whileHover={{
                    scale: 1.03,
                  }}
                  key={index}
                  className="overflow-hidden rounded-2xl"
                >
                  <img
                    src={image.url}
                    alt={`Center ${index + 1}`}
                    className="h-60 w-full object-cover transition duration-500 hover:scale-110"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
};

export default CenterDetails;
