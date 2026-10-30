import api from "./api";

/**
 * Public: List published policies.
 */
export const getPublicPolicies = async (params = {}) => {
  const response = await api.get("/api/policies", { params });
  return response.data;
};

/**
 * Public: Get a single published policy by slug.
 */
export const getPublicPolicyBySlug = async (slug) => {
  const response = await api.get(`/api/policies/slug/${slug}`);
  return response.data;
};

/**
 * Admin: List all policies, including drafts and metadata.
 */
export const getAdminPolicies = async (params = {}) => {
  const response = await api.get("/api/policies/admin/all", { params });
  return response.data;
};

/**
 * Admin: Get policy by ID.
 */
export const getAdminPolicyById = async (id) => {
  const response = await api.get(`/api/policies/admin/${id}`);
  return response.data;
};

/**
 * Admin: Create a new policy.
 */
export const createPolicy = async (policyData) => {
  const response = await api.post("/api/policies/admin", policyData);
  return response.data;
};

/**
 * Admin: Update an existing policy.
 */
export const updatePolicy = async (id, policyData) => {
  const response = await api.put(`/api/policies/admin/${id}`, policyData);
  return response.data;
};

/**
 * Admin: Publish or unpublish a policy.
 */
export const togglePolicyPublication = async (id, status) => {
  const payload = status ? { status } : {};
  const response = await api.patch(`/api/policies/admin/${id}/publish`, payload);
  return response.data;
};

/**
 * Admin: Permanently delete a policy.
 */
export const deletePolicy = async (id) => {
  const response = await api.delete(`/api/policies/admin/${id}`);
  return response.data;
};
