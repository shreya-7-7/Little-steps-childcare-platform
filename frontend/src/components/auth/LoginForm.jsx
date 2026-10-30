import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import useAuth from "../../hooks/useAuth";
import { resolveSafeRedirect } from "../../utils/redirectHelper";

const inputClass =
  "border-[#F0E1BE] focus-visible:ring-[#FF9500] focus-visible:border-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2] dark:placeholder:text-[#8A7A5C]";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Preserve intended destination from router state or query param
  const fromDestination = location.state?.from || null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await login(data);
      toast.success(response?.message || "Logged in successfully");

      const userRole = response?.user?.role;
      const targetPath = resolveSafeRedirect(fromDestination, userRole);

      navigate(targetPath, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label className="dark:text-[#FFF6E2]">Email</Label>
        <Input
          type="email"
          placeholder="Enter your email"
          className={inputClass}
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="dark:text-[#FFF6E2]">Password</Label>
          <Link
            to="/forgot-password"
            state={{ from: fromDestination }}
            className="text-xs font-medium text-[#FF9500] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={`${inputClass} pr-10`}
            {...register("password", { required: "Password is required" })}
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

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      <p className="text-center text-sm text-[#6B5D45] dark:text-[#C9B896]">
        Don't have an account?{" "}
        <Link
          to="/register"
          state={{ from: fromDestination }}
          className="font-medium text-[#FF9500] hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
