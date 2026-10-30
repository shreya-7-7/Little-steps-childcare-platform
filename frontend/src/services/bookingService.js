import api from "./api";

// Create Booking
export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

// My Bookings
export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};

// Booking Details
export const getBookingDetails = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// Cancel Booking
export const cancelBooking = async (id) => {
  const response = await api.patch(`/bookings/cancel/${id}`);
  return response.data;
};

export const getProviderBookings = async () => {
  console.log("Calling API: /bookings/provider");
  const response = await api.get("/bookings/provider");
  console.log(response.data);
  return response.data;
};

// Approve Booking
// Approve Booking
export const approveBooking = async (id) => {
  try {
    console.log("Approving Booking ID:", id);

    const response = await api.patch(`/bookings/approve/${id}`);

    console.log("Approve Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("========== APPROVE BOOKING ERROR ==========");
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("Message:", error.message);
    console.error("Full Error:", error);
    console.error("===========================================");

    throw error;
  }
};
// Reject Booking
export const rejectBooking = async (id) => {
  try {
    console.log("Rejecting Booking ID:", id);

    const response = await api.patch(`/bookings/reject/${id}`);

    console.log("Reject Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("========== REJECT BOOKING ERROR ==========");
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("Message:", error.message);
    console.error("Full Error:", error);
    console.error("===========================================");

    throw error;
  }
};


// Complete Booking
export const completeBooking = async (id) => {
  try {
    console.log("Completing Booking ID:", id);

    const response = await api.patch(`/bookings/complete/${id}`);

    console.log("Complete Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("========== COMPLETE BOOKING ERROR ==========");
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("Message:", error.message);
    console.error("Full Error:", error);
    console.error("===========================================");

    throw error;
  }
};

// Helper: Check if scheduled service end time has passed
export const isBookingServiceEnded = (booking) => {
  if (!booking?.bookingDate) return false;
  try {
    const [endH, endM] = (booking.endTime || "18:00").split(":").map(Number);
    const [startH, startM] = (booking.startTime || "09:00").split(":").map(Number);
    const isOvernight = (endH * 60 + endM) < (startH * 60 + startM);

    const baseDate = new Date(booking.bookingDate);
    const year = baseDate.getUTCFullYear();
    const month = baseDate.getUTCMonth();
    const day = baseDate.getUTCDate();

    let targetYear = year;
    let targetMonth = month;
    let targetDay = day;

    if (booking.planType === "Monthly") {
      targetMonth += 1;
      if (isOvernight) targetDay += 1;
    } else if (isOvernight) {
      targetDay += 1;
    }

    const endDateTime = new Date(Date.UTC(targetYear, targetMonth, targetDay, endH, endM, 0, 0));
    return Date.now() >= endDateTime.getTime();
  } catch (err) {
    return false;
  }
};
