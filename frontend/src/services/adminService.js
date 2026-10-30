import api from "./api";

// ================= Dashboard =================

export const getDashboardStats = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

// ================= Users =================

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getSingleUser = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await api.patch(`/admin/users/${id}/status`, {
    status,
  });
  return response.data;
};

// ================= Providers =================

export const getAllProviders = async () => {
  const response = await api.get("/admin/providers");
  return response.data;
};

export const getPendingProviders = async () => {
  const response = await api.get("/admin/providers/pending");
  return response.data;
};

export const getSingleProvider = async (id) => {
  const response = await api.get(`/admin/providers/${id}`);
  return response.data;
};

export const approveProvider = async (id) => {
  console.log("API Approve Provider ID:", id);
  console.log("API URL:", `/admin/providers/${id}/approve`);

  const response = await api.patch(`/admin/providers/${id}/approve`);

  return response.data;
};

export const rejectProvider = async (id) => {
  const response = await api.patch(`/admin/providers/${id}/reject`);
  return response.data;
};

// ================= Centers =================

export const getAllCenters = async () => {
  const response = await api.get("/admin/centers");
  return response.data;
};

export const getSingleCenter = async (id) => {
  const response = await api.get(`/admin/centers/${id}`);
  return response.data;
};

export const updateCenterStatus = async (id, status) => {
  const response = await api.patch(`/admin/centers/${id}/status`, {
    status,
  });
  return response.data;
};

// ================= Bookings =================

export const getAllBookings = async () => {
  const response = await api.get("/admin/bookings");
  return response.data;
};

export const getSingleBooking = async (id) => {
  const response = await api.get(`/admin/bookings/${id}`);
  return response.data;
};

export const getBookingsByStatus = async (status) => {
  const response = await api.get(`/admin/bookings/status/${status}`);
  return response.data;
};

export const getBookingsByPaymentStatus = async (status) => {
  const response = await api.get(`/admin/bookings/payment/${status}`);
  return response.data;
};

// ================= Subscriptions =================

export const getAllSubscriptions = async () => {
  const response = await api.get("/admin/subscriptions");
  return response.data;
};

export const getSingleSubscription = async (id) => {
  const response = await api.get(`/admin/subscriptions/${id}`);
  return response.data;
};

export const getSubscriptionsByStatus = async (status) => {
  const response = await api.get(`/admin/subscriptions/status/${status}`);
  return response.data;
};

// ================= Payments =================

export const getAllPayments = async () => {
  const response = await api.get("/admin/payments");
  return response.data;
};

export const getSinglePayment = async (id) => {
  const response = await api.get(`/admin/payments/${id}`);
  return response.data;
};

export const getPaymentsByStatus = async (status) => {
  const response = await api.get(`/admin/payments/status/${status}`);
  return response.data;
};

// ================= Reports =================

export const getOverviewReport = async (params) => {
  const response = await api.get("/admin/reports/overview", { params });
  return response.data;
};

export const getRevenueReport = async (params) => {
  const response = await api.get("/admin/reports/revenue", { params });
  return response.data;
};

export const getBookingReport = async (params) => {
  const response = await api.get("/admin/reports/bookings", { params });
  return response.data;
};

export const getSubscriptionReport = async (params) => {
  const response = await api.get("/admin/reports/subscriptions", { params });
  return response.data;
};
