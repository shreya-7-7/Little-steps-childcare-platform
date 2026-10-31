import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Bearer token with route-aware resolution and fallback
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      let token = null;
      const pathname = window.location.pathname || "";
      const reqUrl = config.url || "";

      // 1. Role-aware endpoint & route resolution
      if (reqUrl.startsWith("/admin") || pathname.startsWith("/admin")) {
        token = localStorage.getItem("token_admin");
      } else if (reqUrl.startsWith("/providers") || pathname.startsWith("/provider")) {
        token = localStorage.getItem("token_provider");
      } else if (
        reqUrl.startsWith("/payments") ||
        reqUrl.startsWith("/subscriptions") ||
        pathname.startsWith("/parent") ||
        pathname.startsWith("/centers") ||
        pathname.startsWith("/caregivers") ||
        pathname.startsWith("/book") ||
        pathname.startsWith("/my-") ||
        pathname.startsWith("/matching") ||
        pathname.startsWith("/payments") ||
        pathname.startsWith("/bookings")
      ) {
        token = localStorage.getItem("token_parent");
      }

      // 2. Fallback to generic token if role-specific key is not set
      if (!token) {
        token = localStorage.getItem("token");
      }

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
