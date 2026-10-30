import api from "./api";

// ===============================
// CREATE CENTER
// ===============================
export const createCenter = async (formData) => {
  const { data } = await api.post("/centers", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

// ===============================
// GET ALL CENTERS Publically Accessible
// ===============================
export const getCenters = async (params = {}) => {
  const { data } = await api.get("/centers", {
    params,
  });

  return data;
};

// ===============================
// GET FEATURED CENTERS
// ===============================
export const getFeaturedCenters = async () => {
  const { data } = await api.get("/centers/featured");
  return data;
};

export const getCenterDetails = async (id) => {
  const response = await api.get(`/centers/${id}`);
  return response.data;
};

// ===============================
// GET SINGLE CENTER BY SLUG
// ===============================
export const getCenterBySlug = async (slug) => {
  const { data } = await api.get(`/centers/slug/${slug}`);

  return data;
};

// ===============================
// GET LOGGED-IN PROVIDER CENTER
// ===============================
export const getMyCenters = async () => {
  const { data } = await api.get("/centers/my-centers");
  return data;
};

// ===============================
// UPDATE CENTER
// ===============================
export const updateCenter = async (id, formData) => {
  const { data } = await api.put(`/centers/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

// ===============================
// DELETE CENTER
// ===============================
export const deleteCenter = async (id) => {
  const { data } = await api.delete(`/centers/${id}`);

  return data;
};
