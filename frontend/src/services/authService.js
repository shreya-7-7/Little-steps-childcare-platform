import api from "./api";

// Register User (Parent / Provider)
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Login User
export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

// Logout User
export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

// Get Current Logged In User
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Update Profile
export const updateProfile = async (userData) => {
  const response = await api.put("/auth/profile", userData);
  return response.data;
};

// Request Password Reset Link
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

// Reset Password with Token
export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};
