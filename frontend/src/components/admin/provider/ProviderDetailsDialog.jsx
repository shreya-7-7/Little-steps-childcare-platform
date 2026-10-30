import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BriefcaseBusiness,
  ShieldCheck,
  CalendarDays,
  CreditCard,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProviderDetailsDialog = ({ open, onOpenChange, provider }) => {
  if (!provider) return null;

  const name = provider.user?.name || "Unknown Provider";

  const getInitials = (value = "") => {
    return value
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const statusConfig = {
    approved: {
      label: "Approved",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    pending: {
      label: "Pending",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
    },
    rejected: {
      label: "Rejected",
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400",
    },
  };

  const status =
    statusConfig[provider.verificationStatus] || statusConfig.pending;

  const infoItems = [
    {
      label: "Email Address",
      value: provider.user?.email || "N/A",
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: provider.phone || "N/A",
      icon: Phone,
    },
    {
      label: "Address",
      value: provider.address || "N/A",
      icon: MapPin,
    },
    {
      label: "Qualification",
      value: provider.qualification || "N/A",
      icon: GraduationCap,
    },
    {
      label: "Experience",
      value:
        provider.experience !== undefined
          ? `${provider.experience} Years`
          : "N/A",
      icon: BriefcaseBusiness,
    },
    {
      label: "Government ID",
      value: provider.governmentId || "N/A",
      icon: CreditCard,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl border-[#F0E1BE] bg-[#FFFDF7] p-0 text-[#241C0F] shadow-[0_24px_70px_rgba(36,28,15,0.16)] dark:border-[#3A2E17] dark:bg-[#17130C] dark:text-[#FFF6E2]">
        {/* Header */}
        <div className="border-b border-[#F0E1BE] bg-gradient-to-r from-[#FFF6E2] to-[#FFFDF7] px-6 py-6 dark:border-[#3A2E17] dark:from-[#2A2210] dark:to-[#17130C] md:px-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="rounded-xl bg-[#FF9500]/10 p-2.5">
                <User className="h-5 w-5 text-[#FF9500]" />
              </div>
              Provider Details
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-7 p-6 md:p-8">
          {/* Profile Hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 rounded-2xl border border-[#F0E1BE] bg-white p-6 dark:border-[#3A2E17] dark:bg-[#211B10] md:flex-row md:items-center"
          >
            <Avatar className="h-28 w-28 border-4 border-[#FFF6E2] shadow-md dark:border-[#2A2210]">
              <AvatarImage src={provider.profileImage || ""} alt={name} />

              <AvatarFallback className="bg-[#FF9500]/10 text-2xl font-bold text-[#FF9500]">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">{name}</h2>

                <Badge
                  variant="outline"
                  className={`rounded-full px-3 py-1 font-medium ${status.className}`}
                >
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  {status.label}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                Childcare Service Provider
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                <CalendarDays className="h-4 w-4 text-[#FF9500]" />
                Joined{" "}
                {provider.createdAt
                  ? new Date(provider.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          </motion.div>

          {/* Information */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold">Provider Information</h3>

              <p className="mt-1 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                Registered account and verification information.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {infoItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.04,
                    }}
                    className="rounded-2xl border border-[#F0E1BE] bg-white p-4 transition-colors hover:border-[#FF9500]/50 dark:border-[#3A2E17] dark:bg-[#211B10]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#FF9500]/10 p-2">
                        <Icon className="h-4 w-4 text-[#FF9500]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-[#6B5D45] dark:text-[#C9B896]">
                          {item.label}
                        </p>

                        <p className="mt-1 break-words font-semibold">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <Separator className="bg-[#F0E1BE] dark:bg-[#3A2E17]" />

          {/* Verification */}
          <div className="rounded-2xl border border-[#F0E1BE] bg-[#FFF6E2]/50 p-5 dark:border-[#3A2E17] dark:bg-[#2A2210]/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold">Verification Status</h3>

                <p className="mt-1 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                  Current provider verification state.
                </p>
              </div>

              <Badge
                variant="outline"
                className={`rounded-full px-4 py-1.5 ${status.className}`}
              >
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderDetailsDialog;
