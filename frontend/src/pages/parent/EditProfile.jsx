import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import useAuth from "../../hooks/useAuth";
import { updateProfile } from "../../services/authService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inputClass =
  "border-[#F0E1BE] focus-visible:ring-[#FF9500] focus-visible:border-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await updateProfile(data);

      updateUser(response.user);

      toast.success(response.message);

      navigate("/parent/profile", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    }
  };

  return (
    <div className="max-w-xl">
      <h1
        className="mb-6 text-3xl font-bold text-[#241C0F] dark:text-[#FFF6E2]"
        style={{ fontFamily: "Fraunces, serif" }}
      >
        Edit profile
      </h1>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border border-[#F0E1BE] bg-white p-6 dark:border-[#3A2E17] dark:bg-[#211B10]"
      >
        <div className="space-y-2">
          <Label className="dark:text-[#FFF6E2]">Name</Label>

          <Input
            className={inputClass}
            {...register("name", { required: "Name is required" })}
          />

          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="dark:text-[#FFF6E2]">Email</Label>

          <Input
            value={user?.email}
            disabled
            className={`${inputClass} opacity-70`}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90"
        >
          {isSubmitting ? "Updating..." : "Update profile"}
        </Button>
      </motion.form>
    </div>
  );
};

export default EditProfile;
