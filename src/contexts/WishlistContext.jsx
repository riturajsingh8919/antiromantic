"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

const WishlistContext = createContext({});

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load wishlist when user authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWishlistFromServer();
    } else {
      // Clear wishlist when user logs out
      setWishlistItems([]);
      // Also clear any localStorage wishlist data
      if (typeof window !== "undefined") {
        localStorage.removeItem("wishlist");
      }
    }
  }, [isAuthenticated, user]);

  // Migrate localStorage wishlist to database
  const migrateLocalStorageWishlist = async () => {
    try {
      if (typeof window === "undefined") return;

      const savedWishlist = localStorage.getItem("wishlist");
      if (!savedWishlist) return;

      const parsedWishlist = JSON.parse(savedWishlist);
      if (!Array.isArray(parsedWishlist) || parsedWishlist.length === 0) return;

      // Add each item from localStorage to the database
      for (const item of parsedWishlist) {
        try {
          await axios.post("/api/wishlist", {
            productId: item._id,
          });
        } catch (error) {
          // Continue with other items if one fails
          console.log(
            `Failed to migrate item ${item._id}:`,
            error.response?.data?.error || error.message
          );
        }
      }

      // Clear localStorage after migration
      localStorage.removeItem("wishlist");
    } catch (error) {
      console.error("Error migrating wishlist:", error);
    }
  };

  // Load wishlist from server
  const loadWishlistFromServer = async () => {
    try {
      setLoading(true);

      // First migrate any existing localStorage data
      await migrateLocalStorageWishlist();

      // Then load from server
      const response = await axios.get("/api/wishlist");
      if (response.data.success) {
        setWishlistItems(response.data.wishlist || []);
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (product) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        if (typeof window !== "undefined") {
          const { toast } = await import("react-hot-toast");
          toast.error("Please login to add items to wishlist");
        }
        return;
      }

      setLoading(true);

      // Check if item already exists
      const existingItem = wishlistItems.find(
        (item) => item._id === product._id
      );
      if (existingItem) {
        if (typeof window !== "undefined") {
          const { toast } = await import("react-hot-toast");
          toast.error("Item already in wishlist");
        }
        return;
      }

      // Add to server
      const response = await axios.post("/api/wishlist", {
        productId: product._id,
      });

      if (response.data.success) {
        // Add to local state
        setWishlistItems((prev) => [...prev, response.data.product]);

        // Show success feedback
        if (typeof window !== "undefined") {
          const { toast } = await import("react-hot-toast");
          toast.success(`${product.name} added to wishlist!`);
        }
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      if (typeof window !== "undefined") {
        const { toast } = await import("react-hot-toast");
        if (error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error("Failed to add to wishlist");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        if (typeof window !== "undefined") {
          const { toast } = await import("react-hot-toast");
          toast.error("Please login to manage wishlist");
        }
        return;
      }

      setLoading(true);

      const itemToRemove = wishlistItems.find((item) => item._id === productId);

      // Remove from server
      const response = await axios.delete(
        `/api/wishlist?productId=${productId}`
      );

      if (response.data.success) {
        // Remove from local state
        setWishlistItems((prev) =>
          prev.filter((item) => item._id !== productId)
        );

        // Show success feedback
        if (typeof window !== "undefined" && itemToRemove) {
          const { toast } = await import("react-hot-toast");
          toast.success(`${itemToRemove.name} removed from wishlist!`);
        }
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      if (typeof window !== "undefined") {
        const { toast } = await import("react-hot-toast");
        if (error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error("Failed to remove from wishlist");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (product) => {
    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        if (typeof window !== "undefined") {
          const { toast } = await import("react-hot-toast");
          toast.error("Please login to manage wishlist");
        }
        return;
      }

      setLoading(true);

      // Clear from server
      const response = await axios.delete("/api/wishlist/clear");

      if (response.data.success) {
        // Clear local state
        setWishlistItems([]);

        if (typeof window !== "undefined") {
          const { toast } = await import("react-hot-toast");
          toast.success("Wishlist cleared!");
        }
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      if (typeof window !== "undefined") {
        const { toast } = await import("react-hot-toast");
        if (error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error("Failed to clear wishlist");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  // Refresh wishlist from server
  const refreshWishlist = async () => {
    if (isAuthenticated && user) {
      await loadWishlistFromServer();
    }
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

export default WishlistContext;
