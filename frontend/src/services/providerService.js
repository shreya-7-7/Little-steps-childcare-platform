import api from "./api";

export const getProviderProfile = async () => {
  const response = await api.get("/providers/profile");

  return response.data;
};

/* Update logged-in provider profile */
export const updateProviderProfile = async (data) => {
  const response = await api.put("/providers/profile", data);
  return response.data;
};

// Provider Bookings
export const getProviderBookings = async () => {
  const response = await api.get("/bookings/provider");
  return response.data;
};

// Provider Center
export const getCenters = async () => {
  const response = await api.get("/centers");
  return response.data;
};

export const getMyCenter = async () => {
  const response = await api.get("/centers/my-center");
  return response.data;
};

// Update Center
export const updateCenter = async (id, formData) => {
  const response = await api.put(`/centers/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
export const getDashboardStats = async () => {
  console.log("Calling dashboard stats...");

  try {
    const response = await api.get("/providers/dashboard/stats");

    console.log(response);

    return response.data;
  } catch (err) {
    console.log("STATUS :", err.response?.status);
    console.log("DATA :", err.response?.data);
    console.log("URL :", err.config?.url);

    throw err;
  }
};

export const getRecentBookings = async () => {
  const response = await api.get("/providers/dashboard/recent-bookings");

  return response.data;
};

export const getMonthlyRevenue = async () => {
  const response = await api.get("/providers/dashboard/monthly-revenue");

  return response.data;
};

export const getDashboardNotifications = async () => {
  const response = await api.get("/providers/dashboard/notifications");

  return response.data;
};
