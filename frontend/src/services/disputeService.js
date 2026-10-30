import api from "./api";

/**
 * Parent: Submit a new dispute for a booking.
 */
export const createDispute = async (disputeData) => {
  const response = await api.post("/disputes", disputeData);
  return response.data;
};

/**
 * Parent: Fetch list of disputes owned by the current parent.
 */
export const getMyDisputes = async (params = {}) => {
  const response = await api.get("/disputes/my-disputes", { params });
  return response.data;
};

/**
 * Parent: Fetch single dispute details.
 */
export const getMyDisputeDetails = async (id) => {
  const response = await api.get(`/disputes/my-disputes/${id}`);
  return response.data;
};

/**
 * Admin: List and filter all platform disputes.
 */
export const getAdminDisputes = async (params = {}) => {
  const response = await api.get("/disputes/admin", { params });
  return response.data;
};

/**
 * Admin: View full details of a dispute.
 */
export const getAdminDisputeDetails = async (id) => {
  const response = await api.get(`/disputes/admin/${id}`);
  return response.data;
};

/**
 * Admin: Update dispute status and record resolution notes.
 */
export const updateDisputeStatus = async (id, data) => {
  const response = await api.patch(`/disputes/admin/${id}/status`, data);
  return response.data;
};
