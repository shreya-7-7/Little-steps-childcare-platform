import api from "./api";

export const getCaregivers = async (params = {}) => {
  const response = await api.get("/caregivers", {
    params,
  });

  return response.data;
};

// Provider
export const getProviderCaregivers = async () => {
  const response = await api.get("/caregivers/provider");

  return response.data;
};

export const getCaregiverDetails = async (id) => {
  const response = await api.get(`/caregivers/${id}`);

  return response.data;
};

// Create
export const createCaregiver = async (formData) => {
  const response = await api.post("/caregivers", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Update

export const updateCaregiver = async (id, formData) => {
  const response = await api.put(`/caregivers/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Delete

export const deleteCaregiver = async (id) => {
  const response = await api.delete(`/caregivers/${id}`);

  return response.data;
};
