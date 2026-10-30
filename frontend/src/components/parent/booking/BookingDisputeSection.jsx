import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createDispute } from "@/services/disputeService";

const CATEGORIES = [
  "Safety",
  "Facility",
  "Staff Behavior",
  "Billing/Pricing",
  "Cancellation/Schedule",
  "Other",
];

const BookingDisputeSection = ({ booking }) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Safety");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || title.trim().length < 3) {
      toast.error("Please provide a title of at least 3 characters.");
      return;
    }

    if (!description || description.trim().length < 10) {
      toast.error("Please describe your concern with at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);
      await createDispute({
        bookingId: booking._id,
        category,
        title: title.trim(),
        description: description.trim(),
      });

      setSubmitted(true);
      toast.success("Dispute submitted successfully. Our admin team will investigate.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit dispute.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-[#F0E1BE] dark:border-[#3A2E17] dark:bg-[#211B10]">
      <CardHeader className="cursor-pointer pb-3" onClick={() => setOpen(!open)}>
        <CardTitle className="flex items-center justify-between text-base font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Have a concern about this booking?
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#8C7A5E] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </CardTitle>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 pt-1">
          {submitted ? (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Your dispute has been logged under Open review. You can track progress in your Disputes dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                  Concern Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#F0E1BE] bg-white p-2.5 text-xs text-[#241C0F] focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D] dark:text-[#FFF6E2]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Center schedule conflict, facility concern..."
                  maxLength={150}
                  required
                  className="mt-1 w-full rounded-xl border border-[#F0E1BE] bg-white p-2.5 text-xs text-[#241C0F] focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D] dark:text-[#FFF6E2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what happened in detail..."
                  maxLength={2000}
                  required
                  className="mt-1 w-full rounded-xl border border-[#F0E1BE] bg-white p-2.5 text-xs text-[#241C0F] focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D] dark:text-[#FFF6E2]"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 text-white hover:bg-amber-600 text-xs h-9"
                >
                  {submitting ? "Submitting..." : "Submit Dispute"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default BookingDisputeSection;
