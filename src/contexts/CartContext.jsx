"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const CartContext = createContext({});

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 2000,
    standardShipping: 50,
  });

  // Load cart and coupon from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedCoupon = localStorage.getItem("appliedCoupon");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        setCartItems([]);
      }
    }

    if (savedCoupon) {
      try {
        const parsedCoupon = JSON.parse(savedCoupon);
        setAppliedCoupon(parsedCoupon);
      } catch (error) {
        console.error("Error parsing coupon from localStorage:", error);
        setAppliedCoupon(null);
      }
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Save coupon to localStorage whenever appliedCoupon changes
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("appliedCoupon");
    }
  }, [appliedCoupon]);

  // Add item to cart
  const addToCart = async (product, selectedSize, quantity = 1) => {
    try {
      setLoading(true);

      if (!selectedSize) {
        toast.error("Please select a size");
        return false;
      }

      // Check if the exact item (product + size) already exists
      const existingItemIndex = cartItems.findIndex(
        (item) => item.productId === product._id && item.size === selectedSize
      );

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += quantity;
        setCartItems(updatedItems);
        toast.success(`Updated quantity in cart`);
      } else {
        // Add new item to cart
        const cartItem = {
          id: `${product._id}-${selectedSize}`, // Unique ID for cart item
          productId: product._id,
          name: product.name,
          price: product.price,
          comparePrice: product.comparePrice,
          image: product.images?.[0]?.url || "/store/product1.png",
          size: selectedSize,
          quantity: quantity,
          slug: product.slug,
          addedAt: new Date().toISOString(),
        };

        setCartItems((prev) => [...prev, cartItem]);
        toast.success(`${product.name} added to cart!`);
      }

      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const item = cartItems.find((item) => item.id === itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));

      if (item) {
        toast.success(`${item.name} removed from cart`);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove from cart");
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);
      setCartItems([]);
      // Also clear localStorage explicitly
      localStorage.removeItem("cart");
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  // Get cart item count
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Check if product is in cart
  const isInCart = (productId, size = null) => {
    if (size) {
      return cartItems.some(
        (item) => item.productId === productId && item.size === size
      );
    }
    return cartItems.some((item) => item.productId === productId);
  };

  // Apply coupon
  const applyCoupon = async (couponCode) => {
    try {
      setLoading(true);
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: couponCode,
          orderTotal: getCartTotal(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Transform the API response to match our expected structure
        const couponData = {
          code: result.data.coupon.code,
          discountType: result.data.coupon.discountType,
          discountValue: result.data.coupon.discountValue,
          description: result.data.coupon.description,
          discountAmount: result.data.discount.amount,
        };
        setAppliedCoupon(couponData);
        toast.success(
          `Coupon applied! You saved inr${result.data.discount.amount}`
        );
        return couponData;
      } else {
        toast.error(result.message || result.error || "Invalid coupon code");
        return null;
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast.error("Failed to validate coupon");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  // Calculate shipping
  const getShippingCost = () => {
    const cartTotal = getCartTotal();
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const totalAfterDiscount = cartTotal - discountAmount;

    if (totalAfterDiscount >= shippingSettings.freeShippingThreshold) {
      return 0;
    }
    return shippingSettings.standardShipping;
  };

  // Get final total with shipping and discount
  const getFinalTotal = () => {
    const cartTotal = getCartTotal();
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const shipping = getShippingCost();
    return cartTotal - discountAmount + shipping;
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    isInCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getShippingCost,
    getFinalTotal,
    shippingSettings,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
