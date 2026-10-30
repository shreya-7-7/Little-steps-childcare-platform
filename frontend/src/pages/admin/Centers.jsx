import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  RefreshCw,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";

import CenterTable from "../../components/admin/centers/CenterTable";
import CenterDetailsDialog from "../../components/admin/centers/CenterDetailsDialog";

import { getAllCenters, updateCenterStatus } from "../../services/adminService";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Centers = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedCenter, setSelectedCenter] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);

      const response = await getAllCenters();

      setCenters(response.centers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load centers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return centers;

    return centers.filter((center) => {
      return (
        center.centerName?.toLowerCase().includes(query) ||
        center.city?.toLowerCase().includes(query) ||
        center.state?.toLowerCase().includes(query) ||
        center.provider?.user?.name?.toLowerCase().includes(query)
      );
    });
  }, [centers, search]);

  const activeCenters = useMemo(
    () => centers.filter((center) => center.status === "active").length,
    [centers],
  );

  const inactiveCenters = centers.length - activeCenters;

  const handleView = (center) => {
    setSelectedCenter(center);
    setOpen(true);
  };

  const handleStatus = async (id, status) => {
    try {
      await updateCenterStatus(id, status);

      toast.success(
        status === "active"
          ? "Center activated successfully"
          : "Center deactivated successfully",
      );

      fetchCenters();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update center status",
      );
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* Page Header */}
      <div className="rounded-3xl border border-[#F0E1BE] bg-gradient-to-br from-[#FFF6E2] via-[#FFFDF7] to-white p-6 shadow-[0_8px_30px_rgba(36,28,15,0.05)] dark:border-[#3A2E17] dark:from-[#2A2210] dark:via-[#211B10] dark:to-[#211B10] dark:shadow-none">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[#FF9500]/10 p-3.5">
              <Building2 className="h-7 w-7 text-[#FF9500]" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Childcare Centers
              </h1>

              <p className="mt-1.5 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                Manage, monitor and control all registered childcare centers.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={fetchCenters}
            className="h-10 rounded-xl border-[#F0E1BE] bg-white px-4 hover:border-[#FF9500] hover:bg-[#FFF6E2] dark:border-[#3A2E17] dark:bg-[#211B10] dark:hover:bg-[#2A2210]"
          >
            <RefreshCw className="mr-2 h-4 w-4 text-[#FF9500]" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Building2}
          label="Total Centers"
          value={centers.length}
        />

        <StatCard
          icon={CheckCircle2}
          label="Active Centers"
          value={activeCenters}
          positive
        />

        <StatCard
          icon={XCircle}
          label="Inactive Centers"
          value={inactiveCenters}
          negative
        />
      </div>

      {/* Search */}
      <div className="rounded-3xl border border-[#F0E1BE] bg-white p-4 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Center Directory</h2>

            <p className="mt-1 text-xs text-[#6B5D45] dark:text-[#C9B896]">
              Search by center, provider or location.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5D45] dark:text-[#C9B896]" />

            <Input
              placeholder="Search centers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-[#F0E1BE] bg-[#FFFDF7] pl-10 focus-visible:border-[#FF9500] focus-visible:ring-[#FF9500]/20 dark:border-[#3A2E17] dark:bg-[#17130C]"
            />
          </div>
        </div>

        {search && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#6B5D45] dark:text-[#C9B896]">
            <MapPin className="h-3.5 w-3.5 text-[#FF9500]" />
            Showing {filteredCenters.length} result
            {filteredCenters.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Table */}
      <CenterTable
        centers={filteredCenters}
        onView={handleView}
        onStatus={handleStatus}
      />

      {/* Dialog */}
      <CenterDetailsDialog
        open={open}
        onOpenChange={setOpen}
        center={selectedCenter}
      />
    </motion.section>
  );
};

const StatCard = ({ icon: Icon, label, value, positive, negative }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-[#F0E1BE] bg-white p-5 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B5D45] dark:text-[#C9B896]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            positive
              ? "bg-emerald-50 dark:bg-emerald-950"
              : negative
                ? "bg-red-50 dark:bg-red-950"
                : "bg-[#FF9500]/10"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              positive
                ? "text-emerald-600"
                : negative
                  ? "text-red-600"
                  : "text-[#FF9500]"
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Centers;
