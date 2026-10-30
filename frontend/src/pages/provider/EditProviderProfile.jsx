import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Phone,
  MapPin,
  GraduationCap,
  BriefcaseBusiness,
} from "lucide-react";

import Loading from "../../components/common/Loading";

import {
  getProviderProfile,
  updateProviderProfile,
} from "../../services/providerService";

const EditProviderProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    qualification: "",
    experience: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await getProviderProfile();

      const provider = response?.provider;

      if (!provider) {
        toast.error("Provider profile not found.");
        return;
      }

      setFormData({
        phone: provider.phone || "",
        address: provider.address || "",
        qualification: provider.qualification || "",
        experience:
          provider.experience !== undefined && provider.experience !== null
            ? provider.experience
            : "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load provider profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Address is required.");
      return;
    }

    if (!formData.qualification.trim()) {
      toast.error("Qualification is required.");
      return;
    }

    if (formData.experience === "" || Number(formData.experience) < 0) {
      toast.error("Please enter a valid experience.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        qualification: formData.qualification.trim(),
        experience: Number(formData.experience),
      };

      await updateProviderProfile(payload);

      toast.success("Provider profile updated successfully.");

      navigate("/provider/profile");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update provider profile.",
      );
    } finally {
      setSaving(false);
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
      className="
        space-y-6
        bg-[#FFFDF7]
        p-1
        dark:bg-[#17130C]
      "
    >
      {/* =========================
          HEADER
      ========================= */}
      <div
        className="
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-[#F0E1BE]
          bg-white
          p-6
          shadow-sm
          dark:border-[#3A2E17]
          dark:bg-[#211B10]
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-[#241C0F]
              dark:text-[#FFF6E2]
              sm:text-3xl
            "
          >
            Edit Provider Profile
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-[#6B5D45]
              dark:text-[#C9B896]
              sm:text-base
            "
          >
            Update your provider account information.
          </p>
        </div>

        <Link
          to="/provider/profile"
          className="
            inline-flex
            items-center
            justify-center
            rounded-xl
            border
            border-[#F0E1BE]
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-[#241C0F]
            transition-colors
            hover:bg-[#FFF6E2]
            dark:border-[#3A2E17]
            dark:bg-[#211B10]
            dark:text-[#FFF6E2]
            dark:hover:bg-[#2A2210]
          "
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Link>
      </div>

      {/* =========================
          FORM
      ========================= */}
      <form onSubmit={handleSubmit}>
        <div
          className="
            rounded-3xl
            border
            border-[#F0E1BE]
            bg-white
            shadow-sm
            dark:border-[#3A2E17]
            dark:bg-[#211B10]
          "
        >
          {/* Form Header */}
          <div
            className="
              border-b
              border-[#F0E1BE]
              p-6
              dark:border-[#3A2E17]
            "
          >
            <h2
              className="
                text-lg
                font-bold
                text-[#241C0F]
                dark:text-[#FFF6E2]
              "
            >
              Provider Information
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-[#6B5D45]
                dark:text-[#C9B896]
              "
            >
              Keep your professional information up to date.
            </p>
          </div>

          {/* Fields */}
          <div className="grid gap-6 p-6 md:grid-cols-2">
            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[#241C0F]
                  dark:text-[#FFF6E2]
                "
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  className="
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#FF9500]
                  "
                />

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#F0E1BE]
                    bg-[#FFFDF7]
                    pl-11
                    pr-4
                    text-sm
                    text-[#241C0F]
                    outline-none
                    transition
                    focus:border-[#FF9500]
                    focus:ring-2
                    focus:ring-[#FF9500]/20
                    dark:border-[#3A2E17]
                    dark:bg-[#2A2210]
                    dark:text-[#FFF6E2]
                  "
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[#241C0F]
                  dark:text-[#FFF6E2]
                "
              >
                Address
              </label>

              <div className="relative">
                <MapPin
                  className="
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#FF9500]
                  "
                />

                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#F0E1BE]
                    bg-[#FFFDF7]
                    pl-11
                    pr-4
                    text-sm
                    text-[#241C0F]
                    outline-none
                    transition
                    focus:border-[#FF9500]
                    focus:ring-2
                    focus:ring-[#FF9500]/20
                    dark:border-[#3A2E17]
                    dark:bg-[#2A2210]
                    dark:text-[#FFF6E2]
                  "
                />
              </div>
            </div>

            {/* Qualification */}
            <div>
              <label
                htmlFor="qualification"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[#241C0F]
                  dark:text-[#FFF6E2]
                "
              >
                Qualification
              </label>

              <div className="relative">
                <GraduationCap
                  className="
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#FF9500]
                  "
                />

                <input
                  id="qualification"
                  name="qualification"
                  type="text"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g. Early Childhood Education"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#F0E1BE]
                    bg-[#FFFDF7]
                    pl-11
                    pr-4
                    text-sm
                    text-[#241C0F]
                    outline-none
                    transition
                    focus:border-[#FF9500]
                    focus:ring-2
                    focus:ring-[#FF9500]/20
                    dark:border-[#3A2E17]
                    dark:bg-[#2A2210]
                    dark:text-[#FFF6E2]
                  "
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label
                htmlFor="experience"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[#241C0F]
                  dark:text-[#FFF6E2]
                "
              >
                Experience (Years)
              </label>

              <div className="relative">
                <BriefcaseBusiness
                  className="
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#FF9500]
                  "
                />

                <input
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#F0E1BE]
                    bg-[#FFFDF7]
                    pl-11
                    pr-4
                    text-sm
                    text-[#241C0F]
                    outline-none
                    transition
                    focus:border-[#FF9500]
                    focus:ring-2
                    focus:ring-[#FF9500]/20
                    dark:border-[#3A2E17]
                    dark:bg-[#2A2210]
                    dark:text-[#FFF6E2]
                  "
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-[#F0E1BE]
              p-6
              sm:flex-row
              sm:justify-end
              dark:border-[#3A2E17]
            "
          >
            <Link
              to="/provider/profile"
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-[#F0E1BE]
                bg-white
                px-5
                text-sm
                font-semibold
                text-[#241C0F]
                transition-colors
                hover:bg-[#FFF6E2]
                dark:border-[#3A2E17]
                dark:bg-[#211B10]
                dark:text-[#FFF6E2]
                dark:hover:bg-[#2A2210]
              "
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                bg-[#FF9500]
                px-5
                text-sm
                font-semibold
                text-[#241C0F]
                transition-colors
                hover:bg-[#FFAA00]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <Save className="mr-2 h-4 w-4" />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </motion.section>
  );
};

export default EditProviderProfile;
