import { useState } from "react";
import { Star, MessageSquarePlus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createReview } from "@/services/reviewService";

const BookingReviewSection = ({ booking, onReviewSubmitted }) => {
  const isCompleted = booking?.status?.toLowerCase() === "completed";
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isCompleted) {
      toast.error("Reviews can only be submitted for completed bookings.");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }

    if (!comment || comment.trim().length < 3) {
      toast.error("Please provide a review comment with at least 3 characters.");
      return;
    }

    try {
      setSubmitting(true);
      await createReview({
        bookingId: booking._id,
        centerId: booking.center?._id || booking.center,
        rating,
        comment: comment.trim(),
      });

      setSubmitted(true);
      toast.success("Thank you! Your review has been submitted successfully.");
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to submit review.";
      toast.error(msg);
      if (error.response?.status === 409) {
        setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-[#F0E1BE] dark:border-[#3A2E17] dark:bg-[#211B10]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
          <MessageSquarePlus className="h-5 w-5 text-[#FF9500]" />
          Center Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submitted ? (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Your review has been recorded for this childcare stay. Thank you for your feedback!
            </p>
          </div>
        ) : !isCompleted ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
            <p className="font-medium">Review Unlocks After Care Completion</p>
            <p className="mt-1 text-xs opacity-90">
              You will be able to rate and review this center once your booking status reaches <strong>Completed</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#241C0F] dark:text-[#FFF6E2]">
                Your Rating
              </label>
              <div className="mt-1.5 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoveredRating || rating)
                          ? "fill-[#FF9500] text-[#FF9500]"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-[#6B5D45] dark:text-[#C9B896]">
                  {hoveredRating || rating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="block text-sm font-medium text-[#241C0F] dark:text-[#FFF6E2]"
              >
                Feedback & Experience
              </label>
              <textarea
                id="review-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience regarding caregiver attention, safety, cleanliness, and activities..."
                className="mt-1.5 w-full rounded-xl border border-[#F0E1BE] bg-white p-3 text-sm text-[#241C0F] placeholder:text-[#A8987E] focus:border-[#FF9500] focus:outline-none dark:border-[#3A2E17] dark:bg-[#1A150D] dark:text-[#FFF6E2]"
                maxLength={1000}
                required
              />
              <p className="mt-1 text-right text-xs text-[#A8987E]">
                {comment.length}/1000 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] text-[#241C0F] hover:opacity-90"
            >
              {submitting ? "Submitting Review..." : "Submit Review"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingReviewSection;
