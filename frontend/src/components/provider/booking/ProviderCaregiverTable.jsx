import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  Trash2,
  GraduationCap,
  Briefcase,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

import { deleteCaregiver } from "../../../services/caregiverService";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

const ProviderCaregiverTable = ({ caregivers, onRefresh }) => {
  const { colors } = useTheme();

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this caregiver?",
    );

    if (!confirmDelete) return;

    try {
      const response = await deleteCaregiver(id);

      toast.success(response.message);

      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete caregiver",
      );
    }
  };

  const getStatusStyle = (available) => {
    return available
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";
  };

  if (!caregivers.length) {
    return (
      <div
        className="rounded-[30px] border p-16 text-center"
        style={{
          background: colors.surface,
          borderColor: colors.border,
        }}
      >
        <h3
          className="text-2xl font-bold"
          style={{
            color: colors.text,
          }}
        >
          No Caregivers Found
        </h3>

        <p
          className="mt-3"
          style={{
            color: colors.textMuted,
          }}
        >
          Create your first caregiver to start managing your childcare center.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-[32px] border shadow-lg"
      style={{
        background: colors.surface,
        borderColor: colors.border,
        boxShadow: "0 12px 40px rgba(0,0,0,.06)",
      }}
    >
      {/* Desktop */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead
            style={{
              background: "#FFF7ED",
            }}
          >
            <tr>
              <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider text-orange-600">
                Caregiver
              </th>

              <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider text-orange-600">
                Qualification
              </th>

              <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider text-orange-600">
                Experience
              </th>

              <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider text-orange-600">
                Status
              </th>

              <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-wider text-orange-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {caregivers.map((caregiver) => (
              <tr
                key={caregiver._id}
                className="border-b transition-all duration-200 hover:bg-orange-50"
                style={{
                  borderColor: colors.border,
                }}
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={caregiver.profileImage?.url || "/default-avatar.png"}
                      alt={caregiver.fullName}
                      className="h-16 w-16 rounded-2xl border-2 border-orange-200 object-cover shadow-sm"
                    />

                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{
                          color: colors.text,
                        }}
                      >
                        {caregiver.fullName}
                      </h3>

                      {caregiver.specialization && (
                        <div className="mt-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                          {caregiver.specialization}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-8 py-6">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-orange-700">
                    <GraduationCap className="h-4 w-4" />
                    {caregiver.qualification}
                  </div>
                </td>

                <td className="px-8 py-6">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
                    <Briefcase className="h-4 w-4" />
                    {caregiver.experience} Years
                  </div>
                </td>

                <td className="px-8 py-6">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusStyle(
                      caregiver.isAvailable,
                    )}`}
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {caregiver.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </td>

                <td className="px-8 py-6">
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                      asChild
                    >
                      <Link
                        to={`/provider/caregivers/${caregiver._id}`}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      className="rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                      asChild
                    >
                      <Link
                        to={`/provider/caregivers/edit/${caregiver._id}`}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => handleDelete(caregiver._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}

      <div className="space-y-5 p-5 lg:hidden">
        {caregivers.map((caregiver) => (
          <motion.div
            key={`${caregiver._id}-mobile`}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="rounded-[28px] border p-6 shadow-sm"
            style={{
              background: colors.surface,
              borderColor: colors.border,
            }}
          >
            <div className="flex items-center gap-4">
              <img
                src={caregiver.profileImage?.url || "/default-avatar.png"}
                alt={caregiver.fullName}
                className="h-16 w-16 rounded-2xl border-2 border-orange-200 object-cover"
              />

              <div className="flex-1">
                <h3
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  {caregiver.fullName}
                </h3>

                {caregiver.specialization && (
                  <div className="mt-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                    {caregiver.specialization}
                  </div>
                )}

                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      caregiver.isAvailable,
                    )}`}
                  >
                    {caregiver.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3" style={{ color: colors.textMuted }}>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-orange-500" />
                <span>{caregiver.qualification}</span>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <span>{caregiver.experience} Years Experience</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button variant="outline" asChild>
                <Link to={`/provider/caregivers/${caregiver._id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>

              <Button className="bg-orange-500 hover:bg-orange-600" asChild>
                <Link to={`/provider/caregivers/edit/${caregiver._id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>

              <Button
                variant="destructive"
                onClick={() => handleDelete(caregiver._id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProviderCaregiverTable;
