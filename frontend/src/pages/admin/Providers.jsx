import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Users } from "lucide-react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";

import ProviderTable from "../../components/admin/provider/ProviderTable";
import ProviderDetailsDialog from "../../components/admin/provider/ProviderDetailsDialog";

import {
  approveProvider,
  getAllProviders,
  rejectProvider,
} from "../../services/adminService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  // ===============================
  // FETCH PROVIDERS
  // ===============================

  const fetchProviders = async () => {
    try {
      setLoading(true);

      const response = await getAllProviders();
      console.log("Providers API Response:", response);
      console.log("Providers:", response.providers);

      setProviders(response.providers || []);
    } catch (error) {
      console.error("Providers Error:", error);

      toast.error(error.response?.data?.message || "Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // SEARCH
  // ===============================

  const filteredProviders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return providers;
    }

    return providers.filter((provider) => {
      const name = provider.user?.name?.toLowerCase() || "";
      const email = provider.user?.email?.toLowerCase() || "";
      const phone = provider.phone?.toLowerCase() || "";

      return (
        name.includes(query) || email.includes(query) || phone.includes(query)
      );
    });
  }, [providers, search]);

  // ===============================
  // APPROVE PROVIDER
  // ===============================

  const handleApprove = async (id) => {
    try {
      console.log("Approve Provider ID:", id);

      const response = await approveProvider(id);

      toast.success(response.message || "Provider approved successfully");

      await fetchProviders();
    } catch (error) {
      console.error("Approve Provider Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to approve provider",
      );
    }
  };

  // ===============================
  // REJECT PROVIDER
  // ===============================

  const handleReject = async (id) => {
    try {
      const response = await rejectProvider(id);

      toast.success(response.message || "Provider rejected successfully");

      await fetchProviders();
    } catch (error) {
      console.error("Reject Provider Error:", error);

      toast.error(error.response?.data?.message || "Failed to reject provider");
    }
  };

  // ===============================
  // VIEW PROVIDER
  // ===============================

  const handleView = (provider) => {
    setSelectedProvider(provider);
    setDialogOpen(true);
  };

  // ===============================
  // LOADING
  // ===============================

  if (loading && providers.length === 0) {
    return <Loading />;
  }

  return (
    <section className="space-y-6">
      {/* =========================================
          HEADER
      ========================================= */}

      <div className="rounded-2xl border border-[#F0E1BE] bg-[#FFFDF7] p-6 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF6E2] dark:bg-[#2A2210]">
              <Users className="h-6 w-6 text-[#FF9500]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#241C0F] dark:text-[#FFF6E2] md:text-3xl">
                Providers
              </h1>

              <p className="mt-1 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                Manage provider verification and account status.
              </p>
            </div>
          </div>

          {/* Refresh */}

          <Button
            type="button"
            variant="outline"
            onClick={fetchProviders}
            disabled={loading}
            className="h-10 w-full gap-2 rounded-xl border-[#F0E1BE] bg-white px-5 text-[#241C0F] hover:bg-[#FFF6E2] hover:text-[#241C0F] md:w-auto dark:border-[#3A2E17] dark:bg-[#211B10] dark:text-[#FFF6E2] dark:hover:bg-[#2A2210]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />

            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* =========================================
          SUMMARY
      ========================================= */}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#F0E1BE] bg-white p-5 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
          <p className="text-sm text-[#6B5D45] dark:text-[#C9B896]">
            Total Providers
          </p>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
              {providers.length}
            </h2>

            <div className="rounded-xl bg-[#FFF6E2] p-2.5 dark:bg-[#2A2210]">
              <Users className="h-5 w-5 text-[#FF9500]" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#F0E1BE] bg-white p-5 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
          <p className="text-sm text-[#6B5D45] dark:text-[#C9B896]">
            Showing Results
          </p>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
              {filteredProviders.length}
            </h2>

            <div className="rounded-xl bg-[#FFF6E2] p-2.5 dark:bg-[#2A2210]">
              <Search className="h-5 w-5 text-[#FF9500]" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          SEARCH
      ========================================= */}

      <div className="rounded-2xl border border-[#F0E1BE] bg-white p-4 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5D45] dark:text-[#C9B896]" />

          <Input
            placeholder="Search provider by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl border-[#F0E1BE] bg-[#FFFDF7] pl-10 text-[#241C0F] placeholder:text-[#8B7B61] focus-visible:ring-1 focus-visible:ring-[#FF9500] dark:border-[#3A2E17] dark:bg-[#17130C] dark:text-[#FFF6E2] dark:placeholder:text-[#9C8C6B]"
          />
        </div>
      </div>

      {/* =========================================
          PROVIDER TABLE
      ========================================= */}

      <ProviderTable
        providers={filteredProviders}
        onView={handleView}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* =========================================
          DETAILS DIALOG
      ========================================= */}

      <ProviderDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        provider={selectedProvider}
      />
    </section>
  );
};

export default Providers;
