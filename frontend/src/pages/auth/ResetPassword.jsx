import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, Lock } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "../../services/authService";

const inputClass =
  "border-[#F0E1BE] focus-visible:ring-[#FF9500] focus-visible:border-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2] dark:placeholder:text-[#8A7A5C]";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const newPassword = watch("password");

  const onSubmit = async (data) => {
    try {
      const response = await resetPassword(token, data.password);
      toast.success(response.message || "Password reset successfully!");
      setResetSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      toast.error(
        error.response?.data?.message ||
          "Password reset failed. Link may be invalid or expired.",
      );
    }
  };

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter and confirm your new secure password"
    >
      {resetSuccess ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
              Password Updated!
            </h3>
            <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
              Your password has been reset successfully. Redirecting you to login...
            </p>
          </div>

          <Link
            to="/login"
            className="inline-block rounded-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] px-6 py-2.5 text-xs font-semibold text-[#241C0F]"
          >
            Go to Login Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <div className="space-y-2">
            <Label className="dark:text-[#FFF6E2]">New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                className={`${inputClass} pr-10`}
                {...register("password", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5D45] dark:text-[#C9B896]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="dark:text-[#FFF6E2]">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your new password"
                className={`${inputClass} pr-10`}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === newPassword || "Passwords do not match",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5D45] dark:text-[#C9B896]"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90"
          >
            {isSubmitting ? "Resetting password..." : "Update Password"}
          </Button>

          <p className="text-center text-xs text-[#6B5D45] dark:text-[#C9B896]">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-[#FF9500] hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
