import api from "./api";

export const createSubscription = async (subscriptionData) => {
  const response = await api.post("/subscriptions", subscriptionData);
  return response.data;
};

export const createSubscriptionOrder = async (data) => {
  const response = await api.post("/payments/create-order", data);
  return response.data;
};

export const getMySubscriptions = async () => {
  const response = await api.get("/subscriptions/my-subscriptions");
  return response.data;
};

export const getSubscriptionDetails = async (id) => {
  const response = await api.get(`/subscriptions/${id}`);
  return response.data;
};

export const cancelSubscription = async (id) => {
  const response = await api.put(`/subscriptions/cancel/${id}`);
  return response.data;
};

export const verifySubscriptionPayment = async (data) => {
  const response = await api.post("/payments/verify", data);
  return response.data;
};
