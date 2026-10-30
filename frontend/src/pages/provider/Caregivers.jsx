import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";
import ProviderCaregiverTable from "../../components/provider/booking/ProviderCaregiverTable";
import { getProviderCaregivers } from "../../services/caregiverService";

import { Input } from "@/components/ui/input";
import { Button } from "../../components/ui/button";
import { useTheme } from "../../context/ThemeContext";

const Caregivers = () => {
  const { colors } = useTheme();

  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      setLoading(true);

      const response = await getProviderCaregivers();

      setCaregivers(response.caregivers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load caregivers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCaregivers = useMemo(() => {
    return caregivers.filter((caregiver) =>
      caregiver.fullName?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [caregivers, search]);

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: colors.text, fontFamily: "Fraunces, serif" }}
          >
            Caregivers
          </h1>
          <p style={{ color: colors.textMuted }}>
            {caregivers.length > 0
              ? `${caregivers.length} caregiver${caregivers.length === 1 ? "" : "s"} across your centers.`
              : "Manage the people who look after every family you serve."}
          </p>
        </div>

        <Link to="/provider/caregivers/create">
          <Button icon={UserPlus} iconPosition="leading">
            Add Caregiver
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: colors.textMuted }}
        />
        <Input
          placeholder="Search caregiver by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          }}
        />
      </div>

      {/* Empty State */}
      {filteredCaregivers.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed py-16 text-center"
          style={{ borderColor: colors.border }}
        >
          <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
            No caregivers found
          </h2>

          <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
            {search
              ? `No caregivers match "${search}".`
              : "Add your first caregiver to start assigning bookings."}
          </p>

          {!search && (
            <Link to="/provider/caregivers/create">
              <Button className="mt-6" icon={UserPlus} iconPosition="leading">
                Add Caregiver
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <ProviderCaregiverTable
          caregivers={filteredCaregivers}
          onRefresh={fetchCaregivers}
        />
      )}
    </motion.div>
  );
};

export default Caregivers;
