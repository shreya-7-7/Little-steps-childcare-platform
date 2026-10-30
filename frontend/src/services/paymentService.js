import api from "./api";

// Create Razorpay or Demo Order
export const createOrder = async (payload) => {
  const response = await api.post("/payments/create-order", payload);
  return response.data;
};

// Verify Razorpay Payment
export const verifyPayment = async (paymentData) => {
  const response = await api.post("/payments/verify", paymentData);
  return response.data;
};

// Get My Payments
export const getMyPayments = async () => {
  const response = await api.get("/payments/my-payments");
  return response.data;
};

// Get Single Payment
export const getPaymentDetails = async (id) => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

// Verify Demo Simulated Payment (Development only)
export const verifyDemoPayment = async (payload) => {
  const response = await api.post("/payments/demo-verify", payload);
  return response.data;
};

// Fail Demo Simulated Payment (Development only)
export const failDemoPayment = async (payload) => {
  const response = await api.post("/payments/demo-fail", payload);
  return response.data;
};
