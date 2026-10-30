import { motion } from "framer-motion";
import { Eye, MapPin, Users, IndianRupee, Power } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CenterTable = ({ centers, onView, onStatus }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#F0E1BE] bg-white shadow-[0_8px_30px_rgba(36,28,15,0.06)] dark:border-[#3A2E17] dark:bg-[#211B10] dark:shadow-none">
      {/* Table Header */}
      <div className="border-b border-[#F0E1BE] bg-[#FFF6E2]/60 px-6 py-4 dark:border-[#3A2E17] dark:bg-[#2A2210]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Childcare Centers</h2>
            <p className="mt-1 text-xs text-[#6B5D45] dark:text-[#C9B896]">
              Manage registered childcare centers
            </p>
          </div>

          <Badge className="rounded-full border border-[#FF9500]/20 bg-[#FF9500]/10 px-3 py-1 text-[#D97706] dark:text-[#FFAA00]">
            {centers.length} Centers
          </Badge>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#F0E1BE] text-left dark:border-[#3A2E17]">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
                Center
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
                Provider
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
                Location
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
                Fee
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
                Capacity
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
                Status
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#6B5D45] dark:text-[#C9B896]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {centers.map((center, index) => {
              const isActive = center.status === "active";

              return (
                <motion.tr
                  key={center._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="border-b border-[#F0E1BE]/70 transition-colors hover:bg-[#FFF6E2]/50 dark:border-[#3A2E17]/70 dark:hover:bg-[#2A2210]"
                >
                  {/* Center */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#F0E1BE] bg-[#FFF6E2] dark:border-[#3A2E17] dark:bg-[#2A2210]">
                        <img
                          src={
                            center.centerImages?.[0]?.url ||
                            "https://placehold.co/100x100?text=Center"
                          }
                          alt={center.centerName}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {center.centerName}
                        </p>

                        <p className="mt-1 text-xs text-[#6B5D45] dark:text-[#C9B896]">
                          {center.ageGroup || "All age groups"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Provider */}
                  <td className="px-4 py-5">
                    <p className="font-medium">
                      {center.provider?.user?.name || "Unknown"}
                    </p>

                    <p className="mt-1 max-w-[180px] truncate text-xs text-[#6B5D45] dark:text-[#C9B896]">
                      {center.provider?.user?.email || "No email"}
                    </p>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#FF9500]" />

                      <div>
                        <p className="font-medium">{center.city}</p>

                        <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
                          {center.state}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Fee */}
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-1 font-semibold">
                      <IndianRupee className="h-4 w-4 text-[#FF9500]" />
                      {center.monthlyFee}
                    </div>

                    <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
                      / month
                    </p>
                  </td>

                  {/* Capacity */}
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#FF9500]" />

                      <span className="font-medium">{center.capacity}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-5">
                    <Badge
                      className={
                        isActive
                          ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                          : "rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                      }
                    >
                      <span
                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />

                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onView(center)}
                        className="h-9 w-9 rounded-xl border-[#F0E1BE] hover:border-[#FF9500] hover:bg-[#FFF6E2] dark:border-[#3A2E17] dark:hover:bg-[#2A2210]"
                        title="View center"
                      >
                        <Eye className="h-4 w-4 text-[#FF9500]" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onStatus(center._id, isActive ? "inactive" : "active")
                        }
                        className={
                          isActive
                            ? "h-9 rounded-xl border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950"
                            : "h-9 rounded-xl border-emerald-200 px-3 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900 dark:hover:bg-emerald-950"
                        }
                      >
                        <Power className="mr-1.5 h-4 w-4" />

                        {isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}

            {!centers.length && (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="mb-4 rounded-2xl bg-[#FFF6E2] p-4 dark:bg-[#2A2210]">
                      <Building2Icon />
                    </div>

                    <h3 className="text-lg font-semibold">No Centers Found</h3>

                    <p className="mt-1 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                      There are no childcare centers matching your search.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Building2Icon = () => (
  <svg
    className="h-7 w-7 text-[#FF9500]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M3 21h18" />
    <path d="M6 21V4l6-2 6 2v17" />
    <path d="M9 8h1" />
    <path d="M14 8h1" />
    <path d="M9 12h1" />
    <path d="M14 12h1" />
    <path d="M9 16h1" />
    <path d="M14 16h1" />
  </svg>
);

export default CenterTable;
