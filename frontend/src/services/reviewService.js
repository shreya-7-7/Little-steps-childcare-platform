import api from "./api";

/**
 * Fetch public reviews for a childcare center.
 */
export const getCenterReviews = async (centerId) => {
  const response = await api.get(`/api/reviews/center/${centerId}`);
  return response.data;
};

/**
 * Submit a review for a completed childcare booking.
 */
export const createReview = async (reviewData) => {
  const response = await api.post("/api/reviews", reviewData);
  return response.data;
};
