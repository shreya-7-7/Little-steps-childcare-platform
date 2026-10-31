
import { createContext, useEffect, useState } from "react";

import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../services/authService";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================
  // Get Current User
  // ==========================
  const fetchCurrentUser = async () => {
    // Check if any valid auth token exists before querying the backend
    if (typeof window !== "undefined") {
      const hasStoredToken =
        Boolean(localStorage.getItem("token")) ||
        Boolean(localStorage.getItem("token_parent")) ||
        Boolean(localStorage.getItem("token_provider")) ||
        Boolean(localStorage.getItem("token_admin"));

      if (!hasStoredToken) {
        setUser(null);
        setLoading(false);
        return;
      }
    }

    try {
      const data = await getCurrentUser();
      if (data?.token && typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        if (data.user?.role) {
          localStorage.setItem(`token_${data.user.role}`, data.token);
        }
      }
      if (data?.user && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role) {
          localStorage.setItem(`user_${data.user.role}`, JSON.stringify(data.user));
        }
      }
      setUser(data.user);
    } catch (error) {
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname || "";
        if (pathname.startsWith("/admin")) {
          localStorage.removeItem("token_admin");
          localStorage.removeItem("user_admin");
        } else if (pathname.startsWith("/provider")) {
          localStorage.removeItem("token_provider");
          localStorage.removeItem("user_provider");
        } else if (pathname.startsWith("/parent")) {
          localStorage.removeItem("token_parent");
          localStorage.removeItem("user_parent");
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Register
  // ==========================
  const register = async (userData) => {
    const data = await registerUser(userData);
    if (data?.token && typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
      if (data.user?.role) {
        localStorage.setItem(`token_${data.user.role}`, data.token);
      }
    }
    if (data?.user && data.user.role === "parent") {
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_parent", JSON.stringify(data.user));
      }
      setUser(data.user);
    }
    return data;
  };

  // ==========================
  // Login
  // ==========================
  const login = async (userData) => {
    const data = await loginUser(userData);

    if (data?.token && typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
      if (data.user?.role) {
        localStorage.setItem(`token_${data.user.role}`, data.token);
      }
    }
    if (data?.user && typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role) {
        localStorage.setItem(`user_${data.user.role}`, JSON.stringify(data.user));
      }
    }

    setUser(data.user);

    return data;
  };

  // ==========================
  // Logout
  // ==========================
  const logout = async () => {
    try {
      const data = await logoutUser();
      return data;
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (typeof window !== "undefined") {
        if (user?.role) {
          localStorage.removeItem(`token_${user.role}`);
          localStorage.removeItem(`user_${user.role}`);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    if (updatedUser && typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (updatedUser.role) {
        localStorage.setItem(`user_${updatedUser.role}`, JSON.stringify(updatedUser));
      }
    }
    setUser(updatedUser);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        fetchCurrentUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
