import { motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Users,
  IndianRupee,
  Clock3,
  Star,
  CheckCircle2,
  User,
  Mail,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

const CenterDetailsDialog = ({ open, onOpenChange, center }) => {
  if (!center) return null;

  const isActive = center.status === "active";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl border-[#F0E1BE] bg-[#FFFDF7] p-0 text-[#241C0F] shadow-2xl dark:border-[#3A2E17] dark:bg-[#211B10] dark:text-[#FFF6E2]">
        {/* Header */}
        <div className="border-b border-[#F0E1BE] bg-[#FFF6E2]/70 px-6 py-5 dark:border-[#3A2E17] dark:bg-[#2A2210]">
          <DialogHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                  <Building2 className="h-6 w-6 text-[#FF9500]" />
                  {center.centerName}
                </DialogTitle>

                <div className="mt-2 flex items-center gap-2 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                  <MapPin className="h-4 w-4 text-[#FF9500]" />
                  {center.city}, {center.state}
                </div>
              </div>

              <Badge
                className={
                  isActive
                    ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                    : "rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                }
              >
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-6 p-6">
          {/* Images */}
          {center.centerImages?.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {center.centerImages.map((image, index) => (
                <motion.div
                  key={image.public_id || index}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group overflow-hidden rounded-2xl border border-[#F0E1BE] bg-white dark:border-[#3A2E17] dark:bg-[#211B10]"
                >
                  <img
                    src={image.url}
                    alt={center.centerName}
                    className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Provider */}
          <div className="rounded-2xl border border-[#F0E1BE] bg-white p-5 dark:border-[#3A2E17] dark:bg-[#211B10]">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-xl bg-[#FF9500]/10 p-2">
                <User className="h-5 w-5 text-[#FF9500]" />
              </div>

              <div>
                <h3 className="font-semibold">Provider Information</h3>
                <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
                  Center owner details
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
                  Provider
                </p>

                <p className="mt-1 font-medium">
                  {center.provider?.user?.name || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
                  Email
                </p>

                <p className="mt-1 flex items-center gap-2 font-medium">
                  <Mail className="h-4 w-4 text-[#FF9500]" />
                  {center.provider?.user?.email || "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={Users}
              label="Capacity"
              value={center.capacity || 0}
            />

            <InfoCard
              icon={IndianRupee}
              label="Monthly Fee"
              value={`₹${center.monthlyFee || 0}`}
            />

            <InfoCard
              icon={Clock3}
              label="Timings"
              value={`${center.openingTime || "--"} - ${
                center.closingTime || "--"
              }`}
            />

            <InfoCard
              icon={Star}
              label="Rating"
              value={`${center.rating || 0} / 5`}
            />
          </div>

          {/* Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="City" value={center.city} />
            <DetailItem label="State" value={center.state} />
            <DetailItem label="Pincode" value={center.pincode} />
            <DetailItem label="Age Group" value={center.ageGroup} />

            <DetailItem
              label="Featured"
              value={center.isFeatured ? "Yes" : "No"}
            />

            <DetailItem
              label="Reviews"
              value={`${center.reviewCount || 0} Reviews`}
            />
          </div>

          {/* Address */}
          <div className="rounded-2xl border border-[#F0E1BE] bg-[#FFF6E2]/60 p-5 dark:border-[#3A2E17] dark:bg-[#2A2210]">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#FF9500]" />

              <div>
                <p className="text-sm font-semibold">Address</p>
                <p className="mt-1 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                  {center.address || "No address available"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 font-semibold">Description</h3>

            <p className="rounded-2xl border border-[#F0E1BE] bg-white p-5 text-sm leading-6 text-[#6B5D45] dark:border-[#3A2E17] dark:bg-[#211B10] dark:text-[#C9B896]">
              {center.description || "No description available."}
            </p>
          </div>

          {/* Facilities */}
          {center.facilities?.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#FF9500]" />
                <h3 className="font-semibold">Facilities</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {center.facilities.map((item, index) => (
                  <Badge
                    key={index}
                    className="rounded-full border border-[#F0E1BE] bg-[#FFF6E2] px-3 py-1 text-[#6B5D45] hover:bg-[#FFF6E2] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#C9B896]"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="rounded-2xl border border-[#F0E1BE] bg-white p-4 dark:border-[#3A2E17] dark:bg-[#211B10]">
      <div className="mb-3 inline-flex rounded-xl bg-[#FF9500]/10 p-2">
        <Icon className="h-5 w-5 text-[#FF9500]" />
      </div>

      <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">{label}</p>

      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
};

const DetailItem = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-[#F0E1BE] bg-white p-4 dark:border-[#3A2E17] dark:bg-[#211B10]">
      <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">{label}</p>

      <p className="mt-1 font-medium">{value || "Not available"}</p>
    </div>
  );
};

export default CenterDetailsDialog;
