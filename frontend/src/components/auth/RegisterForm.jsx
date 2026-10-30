import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, User, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import useAuth from "../../hooks/useAuth";
import { resolveSafeRedirect } from "../../utils/redirectHelper";

const inputClass =
  "border-[#F0E1BE] focus-visible:ring-[#FF9500] focus-visible:border-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2] dark:placeholder:text-[#8A7A5C]";

const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Preserve intended destination across registration and login transitions
  const fromDestination = location.state?.from || null;

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      role: "parent",
      phone: "",
      address: "",
      qualification: "",
      experience: "",
      governmentId: "",
    },
  });

  const role = watch("role");

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
      };

      if (data.role === "provider") {
        payload.phone = data.phone.trim();
        payload.address = data.address.trim();
        payload.qualification = data.qualification.trim();
        payload.experience = Number(data.experience);
        payload.governmentId = data.governmentId ? data.governmentId.trim() : "";
      }

      const response = await registerUser(payload);
      toast.success(response.message || "Registration successful");

      if (payload.role === "parent") {
        const targetPath = resolveSafeRedirect(fromDestination, "parent");
        navigate(targetPath, { replace: true });
      } else {
        // Pass forward the preserved intended destination into login
        navigate("/login", {
          state: { from: fromDestination, registeredEmail: payload.email },
          replace: true,
        });
      }
    } catch (error) {
      console.error("REGISTRATION ERROR:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Role */}
      <div className="space-y-2">
        <Label className="dark:text-[#FFF6E2]">Register as</Label>

        <div className="grid grid-cols-2 gap-2 rounded-full bg-[#FFF6E2] p-1 dark:bg-[#2A2210]">
          {[
            {
              value: "parent",
              label: "Parent",
              icon: User,
            },
            {
              value: "provider",
              label: "Provider",
              icon: Briefcase,
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
                role === opt.value
                  ? "bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F]"
                  : "text-[#6B5D45] dark:text-[#C9B896]"
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                className="hidden"
                {...register("role")}
              />
              <opt.icon className="h-4 w-4" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label className="dark:text-[#FFF6E2]">Full Name</Label>
        <Input
          placeholder="Enter your full name"
          className={inputClass}
          {...register("name", {
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label className="dark:text-[#FFF6E2]">Email</Label>
        <Input
          type="email"
          placeholder="Enter your email"
          className={inputClass}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label className="dark:text-[#FFF6E2]">Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password (min. 8 characters)"
            className={`${inputClass} pr-10`}
            {...register("password", {
              required: "Password is required",
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

      {/* Provider Specific Fields */}
      {role === "provider" && (
        <div className="space-y-4 rounded-2xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-950/40 dark:bg-orange-950/10">
          <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">
            Provider Professional Details
          </p>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-xs dark:text-[#FFF6E2]">Phone Number</Label>
            <Input
              placeholder="e.g. +91 98765 43210"
              className={inputClass}
              {...register("phone", {
                required: role === "provider" ? "Phone number is required" : false,
              })}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-xs dark:text-[#FFF6E2]">Center / Office Address</Label>
            <Input
              placeholder="Full address of center or operations"
              className={inputClass}
              {...register("address", {
                required: role === "provider" ? "Address is required" : false,
              })}
            />
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* Qualification */}
          <div className="space-y-1.5">
            <Label className="text-xs dark:text-[#FFF6E2]">Primary Qualification / Certification</Label>
            <Input
              placeholder="e.g. Early Childhood Education Diploma / Montessori Certified"
              className={inputClass}
              {...register("qualification", {
                required:
                  role === "provider" ? "Qualification is required" : false,
              })}
            />
            {errors.qualification && (
              <p className="text-xs text-red-500">{errors.qualification.message}</p>
            )}
          </div>

          {/* Experience */}
          <div className="space-y-1.5">
            <Label className="text-xs dark:text-[#FFF6E2]">Years of Childcare Experience</Label>
            <Input
              type="number"
              min="0"
              max="50"
              placeholder="e.g. 5"
              className={inputClass}
              {...register("experience", {
                required:
                  role === "provider" ? "Experience is required" : false,
                min: { value: 0, message: "Experience cannot be negative" },
              })}
            />
            {errors.experience && (
              <p className="text-xs text-red-500">{errors.experience.message}</p>
            )}
          </div>

          {/* Government ID */}
          <div className="space-y-1.5">
            <Label className="text-xs dark:text-[#FFF6E2]">Government ID / Registration Number (Optional)</Label>
            <Input
              placeholder="e.g. Aadhaar / PAN / Childcare License No."
              className={inputClass}
              {...register("governmentId")}
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90"
      >
        {isSubmitting ? "Creating account..." : "Register"}
      </Button>

      <p className="text-center text-sm text-[#6B5D45] dark:text-[#C9B896]">
        Already have an account?{" "}
        <Link
          to="/login"
          state={{ from: fromDestination }}
          className="font-medium text-[#FF9500] hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
