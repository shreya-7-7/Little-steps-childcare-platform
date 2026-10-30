import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "../../services/authService";

const inputClass =
  "border-[#F0E1BE] focus-visible:ring-[#FF9500] focus-visible:border-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2] dark:placeholder:text-[#8A7A5C]";

const ForgotPassword = () => {
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState(null);

  const fromDestination = location.state?.from || null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await forgotPassword(data.email.trim().toLowerCase());
      toast.success(response.message || "Reset link generated");
      setSubmitted(true);
      if (response.devResetUrl) {
        setDevResetUrl(response.devResetUrl);
      }
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to process request",
      );
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive recovery instructions"
    >
      {submitted ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
              Check your inbox
            </h3>
            <p className="text-xs text-[#6B5D45] dark:text-[#C9B896]">
              If an account exists with that email address, password reset instructions have been generated.
            </p>
          </div>

          {devResetUrl && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs dark:border-amber-950 dark:bg-amber-950/20">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                Local Testing Link:
              </p>
              <a
                href={devResetUrl}
                className="mt-1 block break-all text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
              >
                {devResetUrl}
              </a>
            </div>
          )}

          <Link
            to="/login"
            state={{ from: fromDestination }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF9500] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label className="dark:text-[#FFF6E2]">Registered Email</Label>
            <div className="relative">
              <Input
                type="email"
                placeholder="name@example.com"
                className={inputClass}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90"
          >
            {isSubmitting ? "Generating link..." : "Send Reset Link"}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              state={{ from: fromDestination }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B5D45] hover:text-[#241C0F] dark:text-[#C9B896] dark:hover:text-[#FFF6E2]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
