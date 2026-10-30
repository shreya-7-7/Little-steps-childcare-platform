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
    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
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
    }
    if (data?.user && data.user.role === "parent") {
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
        localStorage.removeItem("token");
      }
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
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
