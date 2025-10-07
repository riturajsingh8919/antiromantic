"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // If response is not successful, clear user state
        setUser(null);
      }
    } catch (error) {
      console.log("Not authenticated");
      // Clear user state on any error (including deleted user)
      setUser(null);
      // Clear any existing auth token if user is deleted/invalid
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 404)
      ) {
        // Clear localStorage for invalid users
        if (typeof window !== "undefined") {
          localStorage.removeItem("wishlist");
          localStorage.removeItem("cart");
          localStorage.removeItem("appliedCoupon");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);

      // Clear localStorage data related to user-specific data
      if (typeof window !== "undefined") {
        localStorage.removeItem("wishlist");
        localStorage.removeItem("cart");
        localStorage.removeItem("appliedCoupon");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear user state and localStorage even if logout API fails
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("wishlist");
        localStorage.removeItem("cart");
        localStorage.removeItem("appliedCoupon");
      }
    }
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      if (response.data.success) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        // If response is not successful, clear user state
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // Clear user state on any error (including deleted user)
      setUser(null);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 404)
      ) {
        // Clear localStorage for invalid users
        if (typeof window !== "undefined") {
          localStorage.removeItem("wishlist");
          localStorage.removeItem("cart");
          localStorage.removeItem("appliedCoupon");
        }
      }
    }
    return null;
  };

  const value = {
    user,
    loading,
    logout,
    checkAuth,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC for protected routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }

    return <Component {...props} />;
  };
}

// HOC for admin-only routes
export function withAdminAuth(Component) {
  return function AdminAuthenticatedComponent(props) {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div
            className="animate-spin rounded-full h-32 w-32 border-b-2"
            style={{ borderColor: "#736c5f" }}
          ></div>
        </div>
      );
    }

    if (!user) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }

    if (user.role !== "admin") {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      return null;
    }

    return <Component {...props} />;
  };
}
