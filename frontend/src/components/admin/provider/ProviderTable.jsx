import { motion } from "framer-motion";
import { Eye, CheckCircle2, XCircle, Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProviderTable = ({ providers, onView, onApprove, onReject }) => {
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusStyle = (status) => {
    if (status === "approved") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400";
    }

    if (status === "rejected") {
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400";
    }

    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400";
  };

  if (!providers.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#F0E1BE] bg-[#FFFDF7] px-6 py-16 text-center dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF9500]/10">
          <CheckCircle2 className="h-6 w-6 text-[#FF9500]" />
        </div>

        <h3 className="mt-5 text-lg font-bold">No Providers Found</h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-[#6B5D45] dark:text-[#C9B896]">
          No providers match your current search or there are no registered
          providers yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[#F0E1BE] bg-white shadow-[0_8px_30px_rgba(36,28,15,0.05)] dark:border-[#3A2E17] dark:bg-[#211B10] dark:shadow-none">
      {/* Table Header */}
      <div className="hidden border-b border-[#F0E1BE] bg-[#FFF6E2]/60 px-6 py-4 dark:border-[#3A2E17] dark:bg-[#2A2210]/50 lg:grid lg:grid-cols-[2fr_2fr_1.3fr_1fr_1.6fr] lg:items-center lg:gap-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
          Provider
        </p>

        <p className="text-xs font-bold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
          Contact
        </p>

        <p className="text-xs font-bold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
          Experience
        </p>

        <p className="text-xs font-bold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
          Status
        </p>

        <p className="text-right text-xs font-bold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
          Actions
        </p>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#F0E1BE] dark:divide-[#3A2E17]">
        {providers.map((provider, index) => {
          const name = provider.user?.name || "Unknown Provider";
          const email = provider.user?.email || "N/A";

          return (
            <motion.div
              key={provider._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: index * 0.04,
              }}
              className="grid gap-5 p-5 transition-colors hover:bg-[#FFFDF7] dark:hover:bg-[#2A2210]/40 lg:grid-cols-[2fr_2fr_1.3fr_1fr_1.6fr] lg:items-center lg:gap-4 lg:px-6"
            >
              {/* Provider */}
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border border-[#F0E1BE] dark:border-[#3A2E17]">
                  <AvatarImage src={provider.profileImage || ""} alt={name} />

                  <AvatarFallback className="bg-[#FF9500]/10 font-bold text-[#FF9500]">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate font-semibold">{name}</p>

                  <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
                    Provider
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-[#FF9500]" />
                  <span className="truncate">{email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                  <Phone className="h-3.5 w-3.5 text-[#FF9500]" />
                  <span>{provider.phone || "N/A"}</span>
                </div>
              </div>

              {/* Experience */}
              <div>
                <p className="text-xs text-[#6B5D45] dark:text-[#C9B896] lg:hidden">
                  Experience
                </p>

                <p className="font-semibold">
                  {provider.experience ?? 0} Years
                </p>
              </div>

              {/* Status */}
              <div>
                <Badge
                  variant="outline"
                  className={`rounded-full px-3 py-1 capitalize ${getStatusStyle(
                    provider.verificationStatus,
                  )}`}
                >
                  {provider.verificationStatus}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onView(provider)}
                  className="h-9 rounded-xl border-[#F0E1BE] bg-transparent px-3 hover:border-[#FF9500] hover:bg-[#FFF6E2] dark:border-[#3A2E17] dark:hover:bg-[#2A2210]"
                >
                  <Eye className="mr-1.5 h-4 w-4 text-[#FF9500]" />
                  View
                </Button>

                {provider.verificationStatus === "pending" && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onApprove(provider._id)}
                      className="h-9 rounded-xl bg-[#FF9500] px-3 text-white shadow-sm hover:bg-[#E68600]"
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Approve
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onReject(provider._id)}
                      className="h-9 rounded-xl border-red-200 bg-red-50 px-3 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProviderTable;
