import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Camera,
  Pencil,
  Building2,
  ShieldCheck,
  GraduationCap,
  BriefcaseBusiness,
} from "lucide-react";

import { getProviderProfile } from "../../services/providerService";
import Loading from "../../components/common/Loading";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProviderProfile();
      setProvider(response.provider);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const user = provider?.user;

  if (!provider || !user) {
    return (
      <div className="rounded-2xl border border-dashed border-[#F0E1BE] py-20 text-center dark:border-[#3A2E17]">
        <h2 className="text-2xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
          Profile Not Found
        </h2>
        <p className="mt-2 text-[#6B5D45] dark:text-[#C9B896]">
          Unable to load your provider profile information.
        </p>
      </div>
    );
  }

  const isVerified =
    provider.verificationStatus === "approved" || user.isApproved;

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 bg-[#FFFDF7] p-1 dark:bg-[#17130C]"
    >
      {/* Header */}
      <div className="flex flex-col gap-5 rounded-2xl border border-[#F0E1BE] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#241C0F] dark:text-[#FFF6E2]">
            Provider Profile
          </h1>
          <p className="mt-2 text-[#6B5D45] dark:text-[#C9B896]">
            View and manage your provider account information.
          </p>
        </div>

        <Link
          to="/provider/edit-profile"
          className="inline-flex items-center justify-center rounded-xl bg-[#FF9500] px-5 py-2.5 text-sm font-semibold text-[#241C0F] transition-colors hover:bg-[#FFAA00]"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-3xl border border-[#F0E1BE] bg-white shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div className="p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="relative">
              <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-[#FFF6E2] shadow-lg dark:border-[#2A2210]">
                {provider.profileImage ? (
                  <img
                    src={provider.profileImage}
                    alt={user.name || "Provider"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
                    {user.name?.charAt(0)?.toUpperCase() || "P"}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#FF9500] text-[#241C0F] shadow-sm transition-colors hover:bg-[#FFAA00]"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-bold text-[#241C0F] dark:text-[#FFF6E2]">
                  {user.name || "Provider"}
                </h2>
                <span className="rounded-full bg-[#FFF6E2] px-3 py-1 text-xs font-semibold capitalize text-[#241C0F] dark:bg-[#2A2210] dark:text-[#FFF6E2]">
                  {user.role}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    isVerified
                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                  {isVerified ? "Verified" : "Pending Approval"}
                </span>
              </div>

              <p className="mt-2 text-[#6B5D45] dark:text-[#C9B896]">
                Childcare Service Provider
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-[#241C0F] dark:text-[#FFF6E2]">
                  <Mail className="h-5 w-5 text-[#FF9500]" />
                  <span>{user.email || "Not Available"}</span>
                </div>

                <div className="flex items-center gap-3 text-[#241C0F] dark:text-[#FFF6E2]">
                  <Phone className="h-5 w-5 text-[#FF9500]" />
                  <span>{provider.phone || "Not Available"}</span>
                </div>

                <div className="flex items-center gap-3 text-[#241C0F] dark:text-[#FFF6E2]">
                  <MapPin className="h-5 w-5 text-[#FF9500]" />
                  <span>{provider.address || "Not Available"}</span>
                </div>

                <div className="flex items-center gap-3 text-[#241C0F] dark:text-[#FFF6E2]">
                  <GraduationCap className="h-5 w-5 text-[#FF9500]" />
                  <span>{provider.qualification || "Not Specified"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Experience */}
      <div className="rounded-3xl border border-[#F0E1BE] bg-white shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div className="border-b border-[#F0E1BE] p-6 dark:border-[#3A2E17]">
          <h3 className="text-lg font-bold text-[#241C0F] dark:text-[#FFF6E2]">
            Provider Credentials
          </h3>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-3">
          <div className="rounded-xl border border-[#F0E1BE] bg-[#FFF6E2] p-5 dark:border-[#3A2E17] dark:bg-[#2A2210]">
            <p className="text-sm text-[#6B5D45] dark:text-[#C9B896]">
              Experience
            </p>
            <p className="mt-1 font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
              {provider.experience !== undefined
                ? `${provider.experience} year${provider.experience === 1 ? "" : "s"}`
                : "Not Specified"}
            </p>
          </div>

          <div className="rounded-xl border border-[#F0E1BE] bg-[#FFF6E2] p-5 dark:border-[#3A2E17] dark:bg-[#2A2210]">
            <p className="text-sm text-[#6B5D45] dark:text-[#C9B896]">
              Verification Status
            </p>
            <p className="mt-1 font-semibold capitalize text-[#241C0F] dark:text-[#FFF6E2]">
              {provider.verificationStatus || "Pending"}
            </p>
          </div>

          <div className="rounded-xl border border-[#F0E1BE] bg-[#FFF6E2] p-5 dark:border-[#3A2E17] dark:bg-[#2A2210]">
            <p className="text-sm text-[#6B5D45] dark:text-[#C9B896]">
              Account Status
            </p>
            <p className="mt-1 font-semibold capitalize text-[#241C0F] dark:text-[#FFF6E2]">
              {user.status || "Active"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-3xl border border-[#F0E1BE] bg-white shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div className="border-b border-[#F0E1BE] p-6 dark:border-[#3A2E17]">
          <h3 className="text-lg font-bold text-[#241C0F] dark:text-[#FFF6E2]">
            Quick Actions
          </h3>
        </div>

        <div className="flex flex-wrap gap-4 p-6">
          <Link
            to="/provider/edit-profile"
            className="inline-flex items-center justify-center rounded-xl bg-[#FF9500] px-5 py-2.5 text-sm font-semibold text-[#241C0F] transition-colors hover:bg-[#FFAA00]"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>

          <Link
            to="/provider/center"
            className="inline-flex items-center justify-center rounded-xl border border-[#F0E1BE] bg-white px-5 py-2.5 text-sm font-semibold text-[#241C0F] transition-colors hover:bg-[#FFF6E2] dark:border-[#3A2E17] dark:bg-[#211B10] dark:text-[#FFF6E2] dark:hover:bg-[#2A2210]"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Manage Centers
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default Profile;
