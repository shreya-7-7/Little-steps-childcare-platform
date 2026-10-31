import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Plus,
  Search,
  Users,
  IndianRupee,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";

import { getMyCenters, deleteCenter } from "../../services/centerService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useTheme } from "../../context/ThemeContext";

let cachedCenters = null;

const MyCenter = () => {
  const { colors } = useTheme();

  const [centers, setCenters] = useState(cachedCenters || []);
  const [loading, setLoading] = useState(!cachedCenters);
  const [search, setSearch] = useState("");

  const fetchCenters = async (isSilent = false) => {
    try {
      if (!isSilent && !cachedCenters) {
        setLoading(true);
      }

      const response = await getMyCenters();
      const list = response.centers || [];
      cachedCenters = list;
      setCenters(list);
    } catch (error) {
      if (!cachedCenters) {
        toast.error(
          error.response?.data?.message || "Failed to load childcare centers.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters(Boolean(cachedCenters));
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this childcare center?",
    );

    if (!confirmDelete) return;

    try {
      const response = await deleteCenter(id);

      toast.success(response.message);

      fetchCenters();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete center.");
    }
  };

  const filteredCenters = useMemo(() => {
    return centers.filter((center) =>
      center.centerName?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [centers, search]);

  const totalCapacity = centers.reduce(
    (total, center) => total + (center.capacity || 0),
    0,
  );

  const averageFee =
    centers.length > 0
      ? Math.round(
          centers.reduce(
            (total, center) => total + (center.monthlyFee || 0),
            0,
          ) / centers.length,
        )
      : 0;

  if (loading && !centers.length) {
    return <Loading />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      {/* Header */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1
            className="text-4xl font-bold"
            style={{
              color: colors.text,
              fontFamily: "Fraunces, serif",
            }}
          >
            My Childcare Centers
          </h1>

          <p className="mt-2 text-base" style={{ color: colors.textMuted }}>
            Create, manage and monitor every childcare center from one place.
          </p>
        </div>

        {centers.length > 0 ? (
          <Link to={`/provider/center/edit/${centers[0]._id}`}>
            <Button size="lg">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Center
            </Button>
          </Link>
        ) : (
          <Link to="/provider/center/create">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Center
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}

      <div className="grid gap-5 md:grid-cols-3">
        <div
          className="rounded-3xl border p-6 shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <Building2 className="h-7 w-7" style={{ color: colors.primary }} />

            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Centers
            </span>
          </div>

          <h2 className="text-4xl font-bold" style={{ color: colors.text }}>
            {centers.length}
          </h2>

          <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
            Registered childcare centers
          </p>
        </div>

        <div
          className="rounded-3xl border p-6 shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <Users className="h-7 w-7" style={{ color: colors.primary }} />

            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Capacity
            </span>
          </div>

          <h2 className="text-4xl font-bold" style={{ color: colors.text }}>
            {totalCapacity}
          </h2>

          <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
            Total children capacity
          </p>
        </div>

        <div
          className="rounded-3xl border p-6 shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <IndianRupee
              className="h-7 w-7"
              style={{ color: colors.primary }}
            />

            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Average Fee
            </span>
          </div>

          <h2 className="text-4xl font-bold" style={{ color: colors.text }}>
            ₹{averageFee}
          </h2>

          <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
            Average monthly fee
          </p>
        </div>
      </div>

      {/* Search */}

      <div className="relative max-w-md">
        <Search
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 "
          style={{ color: colors.textMuted }}
        />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search center..."
          className="pl-11"
        />
      </div>

      {/* Empty State */}

      {filteredCenters.length === 0 && (
        <div
          className="rounded-3xl border border-dashed px-6 py-20 text-center"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <Building2
            className="mx-auto mb-5 h-16 w-16"
            style={{ color: colors.textMuted }}
          />

          <h2 className="text-3xl font-bold" style={{ color: colors.text }}>
            No Centers Found
          </h2>

          <p
            className="mx-auto mt-3 max-w-md"
            style={{ color: colors.textMuted }}
          >
            {search
              ? `No childcare center matches "${search}".`
              : "Create your first childcare center and start accepting bookings."}
          </p>

          {!search && (
            <Link to="/provider/center/create">
              <Button className="mt-8" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Center
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Cards Grid */}
      {filteredCenters.length > 0 && (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {filteredCenters.map((center) => (
            <motion.div
              key={center._id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="group overflow-hidden rounded-3xl border shadow-sm transition-all hover:shadow-xl"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              {/* Image */}

              <div className="relative overflow-hidden">
                <img
                  src={
                    center.centerImages?.[0]?.url ||
                    "https://placehold.co/800x500?text=Childcare+Center"
                  }
                  alt={center.centerName}
                  className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                <span
                  className={`absolute right-4 top-4 rounded-full px-4 py-1 text-xs font-semibold ${
                    center.status === "active"
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {center.status || "Pending"}
                </span>

                <div className="absolute bottom-5 left-5">
                  <h2 className="text-xl font-bold text-white">
                    {center.centerName}
                  </h2>

                  <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
                    <MapPin className="h-4 w-4" />
                    {center.city}, {center.state}
                  </p>
                </div>
              </div>

              {/* Content */}

              <div className="space-y-6 p-6">
                <p
                  className="line-clamp-3 text-sm leading-6"
                  style={{ color: colors.textMuted }}
                >
                  {center.description}
                </p>

                {/* Stats */}

                <div className="grid grid-cols-3 gap-3">
                  <div
                    className="rounded-2xl border p-4 text-center"
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                    }}
                  >
                    <p className="text-xs" style={{ color: colors.textMuted }}>
                      Fee
                    </p>

                    <p
                      className="mt-1 font-bold"
                      style={{ color: colors.text }}
                    >
                      ₹{center.monthlyFee}
                    </p>
                  </div>

                  <div
                    className="rounded-2xl border p-4 text-center"
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                    }}
                  >
                    <p className="text-xs" style={{ color: colors.textMuted }}>
                      Capacity
                    </p>

                    <p
                      className="mt-1 font-bold"
                      style={{ color: colors.text }}
                    >
                      {center.capacity}
                    </p>
                  </div>

                  <div
                    className="rounded-2xl border p-4 text-center"
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                    }}
                  >
                    <p className="text-xs" style={{ color: colors.textMuted }}>
                      24 Hours
                    </p>

                    <p
                      className="mt-1 font-bold"
                      style={{ color: colors.text }}
                    >
                      {center.is24Hours ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {/* Buttons */}

                <div className="grid grid-cols-3 gap-3">
                  <Link to={`/provider/center/${center._id}`}>
                    <Button
                      variant="outline"
                      asChild
                      className="rounded-xl border-0"
                    >
                      view
                    </Button>
                  </Link>

                  <Link to={`/provider/center/edit/${center._id}`}>
                    <Button asChild className="rounded-xl border-0">
                      edit
                    </Button>
                  </Link>

                  <Button
                    variant="destructive"
                    className="rounded-xl"
                    onClick={() => handleDelete(center._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default MyCenter;
