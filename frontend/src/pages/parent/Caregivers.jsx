import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import CaregiverCard from "../../components/parent/CaregiverCard";
import Loading from "../../components/common/Loading";
import { getCaregivers } from "../../services/caregiverService";

import { Input } from "@/components/ui/input";

const Caregivers = () => {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      setLoading(true);
      const response = await getCaregivers();
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

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-[#241C0F] dark:text-[#FFF6E2]"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Our caregivers
          </h1>
          <p className="text-[#6B5D45] dark:text-[#C9B896]">
            Meet our experienced childcare professionals.
          </p>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search caregiver..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border-[#F0E1BE] focus-visible:ring-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]"
      />

      {/* Content */}
      {filteredCaregivers.length === 0 ? (
        <div className="rounded-2xl border border-[#F0E1BE] py-16 text-center dark:border-[#3A2E17]">
          <h2 className="text-2xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            No caregivers found
          </h2>
          <p className="mt-2 text-[#6B5D45] dark:text-[#C9B896]">
            {search
              ? "No caregivers match your search."
              : "No caregivers currently registered."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCaregivers.map((caregiver) => (
            <CaregiverCard key={caregiver._id} caregiver={caregiver} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Caregivers;
