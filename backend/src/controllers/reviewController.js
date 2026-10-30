import Review from "../models/Review.js";
import Center from "../models/Center.js";
import Booking from "../models/Booking.js";

/**
 * Recalculates and updates center's average rating and reviewCount
 * strictly from genuine persisted reviews in the database.
 */
const recalculateCenterRating = async (centerId) => {
  const stats = await Review.aggregate([
    { $match: { center: centerId } },
    {
      $group: {
        _id: "$center",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const roundedRating = Math.round(stats[0].avgRating * 10) / 10;
    await Center.findByIdAndUpdate(centerId, {
      rating: roundedRating,
      reviewCount: stats[0].totalReviews,
    });
  } else {
    await Center.findByIdAndUpdate(centerId, {
      rating: 0,
      reviewCount: 0,
    });
  }
};

/**
 * Submits a new review for a completed childcare booking.
 */
const createReview = async (req, res) => {
  try {
    const { bookingId, centerId, rating, comment } = req.body;

    if (!bookingId || !centerId || rating === undefined || !comment) {
      return res.status(400).json({
        success: false,
        message: "Booking ID, Center ID, rating, and review comment are required.",
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";
    if (trimmedComment.length < 3 || trimmedComment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Review comment must be between 3 and 1000 characters.",
      });
    }

    // Verify Center existence
    const center = await Center.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found.",
      });
    }

    // Verify Booking existence
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Eligibility check 1: Parent must own the booking
    if (booking.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only review your own childcare bookings.",
      });
    }

    // Eligibility check 2: Booking must belong to the specified center
    if (booking.center.toString() !== center._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "The specified booking does not belong to this center.",
      });
    }

    // Eligibility check 3: Booking must be genuinely Completed
    if (booking.status?.toLowerCase() !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Reviews can only be submitted for completed childcare bookings.",
      });
    }

    // Eligibility check 4: Duplicate review prevention
    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "A review has already been submitted for this booking.",
      });
    }

    // Create the review
    const review = await Review.create({
      parent: req.user._id,
      center: center._id,
      booking: booking._id,
      rating: numRating,
      comment: trimmedComment,
    });

    // Recalculate center aggregate rating and count
    await recalculateCenterRating(center._id);

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A review has already been submitted for this booking.",
      });
    }
    console.error("CREATE REVIEW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Public read endpoint: retrieves reviews for a center with safe reviewer details.
 */
const getCenterReviews = async (req, res) => {
  try {
    const { centerId } = req.params;

    const center = await Center.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found.",
      });
    }

    const reviews = await Review.find({ center: centerId })
      .populate("parent", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET CENTER REVIEWS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createReview, getCenterReviews, recalculateCenterRating };
