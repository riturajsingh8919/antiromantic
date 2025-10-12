"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Eye, Heart, Minus, Plus, X } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import Link from "next/link";
import HomeSectionSix from "../HomeComponents/HomeSectionSix";
import { toast } from "react-hot-toast";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const CartPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getShippingCost,
    getFinalTotal,
    shippingSettings,
  } = useCart();
  const [activeTab, setActiveTab] = useState("cart");
  const [productImages, setProductImages] = useState({});

  // Fetch product images from image manager
  const fetchProductImages = async () => {
    try {
      const response = await fetch("/api/admin/image-manager?limit=1000");
      const result = await response.json();

      if (result.success) {
        // Create a mapping of productId to images
        const imageMap = {};
        result.data.forEach((item) => {
          // Handle different productId formats
          let productIdString;
          if (typeof item.productId === "string") {
            productIdString = item.productId;
          } else if (item.productId && item.productId._id) {
            productIdString = item.productId._id;
          } else if (item.productId && item.productId.$oid) {
            productIdString = item.productId.$oid;
          } else {
            productIdString = item.productId.toString();
          }

          imageMap[productIdString] = {
            normal: item.normalImage,
            hover: item.hoverImage,
          };
        });
        setProductImages(imageMap);
      }
    } catch (error) {
      console.error("Error fetching product images:", error);
    }
  };

  // Handle URL parameter for active tab
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "wishlist" || tabParam === "cart") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Fetch product images from image manager
  useEffect(() => {
    fetchProductImages();
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newUrl = `/cart?tab=${tab}`;
    router.replace(newUrl, { scroll: false });
  };

  const [discountCode, setDiscountCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Calculate totals using context functions
  const orderValue = getCartTotal();
  const shipping = getShippingCost();
  const total = getFinalTotal();

  const handleUpdateQuantity = (id, change) => {
    const currentItem = cartItems.find((item) => item.id === id);
    if (currentItem) {
      const newQuantity = Math.max(1, currentItem.quantity + change);
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveCartItem = (id) => {
    removeFromCart(id);
  };

  const removeWishlistItem = (id) => {
    removeFromWishlist(id);
    toast.success("Item removed from wishlist");
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to proceed with checkout");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    router.push("/checkout");
  };

  const handleProductClick = (product) => {
    if (product.slug) {
      router.push(`/store/${product.slug}`);
    } else if (product._id) {
      // Fallback to ID-based navigation if slug is not available
      router.push(`/store/product/${product._id}`);
    } else {
      toast.error("Unable to navigate to product page");
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    const result = await applyCoupon(discountCode.trim());
    if (result) {
      setDiscountCode("");
    }
    setIsValidatingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setDiscountCode("");
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-[url('/store/store-sec-bg.png')] px-4 md:px-10 py-16 pt-[100px]">
        <div className="container">
          {/* User Info */}
          <div className="mb-4">
            <p className="text-base text-[#28251F]">
              {activeTab === "wishlist"
                ? `${user?.username || "your"}'s wishlist`
                : "your cart item's"}
            </p>
          </div>

          {/* Tabs */}
          <div className="relative">
            <div className="flex">
              <button
                onClick={() => handleTabChange("wishlist")}
                className={`px-0 py-4 mr-8 text-lg xl:text-2xl font-normal transition-colors cursor-pointer ${
                  activeTab === "wishlist"
                    ? "text-[#656056]"
                    : "text-[#A7A091] hover:text-[#28251F]"
                }`}
              >
                wishlist
              </button>
              <button
                onClick={() => handleTabChange("cart")}
                className={`px-0 py-4 text-lg xl:text-2xl font-normal transition-colors cursor-pointer ${
                  activeTab === "cart"
                    ? "text-[#656056]"
                    : "text-[#A7A091] hover:text-[#28251F]"
                }`}
              >
                cart
              </button>
            </div>
          </div>

          {/* Cart Tab Content */}
          {activeTab === "cart" && (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
              {/* Cart Items */}
              <div className="flex-1 border-t border-[#D0C9BE] pt-8">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-[#736C5F] text-lg">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div
                        key={`${item.id}-${item.size}`}
                        className="flex gap-8 p-4 "
                      >
                        {/* Product Image */}
                        <div className="w-24 h-32 flex-shrink-0 bg-white">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col gap-6 lg:flex-row items-start justify-between">
                          <div>
                            <h3 className="text-base font-normal text-[#28251F]">
                              {item.name}
                            </h3>
                            <p className="text-base text-[#28251F]">
                              size{" "}
                              <span className="!uppercase ml-1">
                                {item.size}
                              </span>
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center border border-[#736C5F] hover:border-[#736C5F] hover:bg-[#736C5F] hover:text-[#E4DFD3] transition-colors cursor-pointer"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-base font-medium text-[#28251F] w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center border border-[#736C5F] hover:border-[#736C5F] hover:bg-[#736C5F] hover:text-[#E4DFD3] transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          {/* Price */}
                          <div className="relative">
                            <p className="text-lg font-black text-[#736C5F]">
                              inr{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveCartItem(item.id)}
                            className="text-[#28251F] hover:text-[#28251F] transition-colors text-base underline cursor-pointer"
                          >
                            remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-[40%] -mt-11">
                <h3 className="text-lg text-[#656056] mb-4">total</h3>
                <div className="flex flex-col gap-8 border-t border-[#D0C9BE] pt-8">
                  {/* Totals */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between text-base">
                      <span className="text-[#28251F]">order value</span>
                      <span className="text-[#736C5F] font-black text-lg">
                        inr {orderValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[#28251F]">
                        shipping
                        {shipping === 0 && (
                          <span className="text-gray-700 text-base ml-2">
                            (Free above inr
                            {shippingSettings.freeShippingThreshold})
                          </span>
                        )}
                      </span>
                      <span className="text-[#736C5F] font-black text-lg">
                        {shipping === 0 ? "FREE" : `inr ${shipping}`}
                      </span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-base">
                        <span className="text-[#28251F]">
                          discount ({appliedCoupon.code})
                          {appliedCoupon.discountType === "percentage" && (
                            <span className="text-base text-[#656056] ml-1">
                              {appliedCoupon.discountValue}% off
                            </span>
                          )}
                        </span>
                        <span className="text-[#736C5F] font-black text-lg">
                          -inr{" "}
                          {Math.round(
                            appliedCoupon.discountAmount
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <hr className="border-[#D0C9BE]" />
                  </div>

                  {/* Discount Code */}
                  <div className="flex flex-col gap-4">
                    {appliedCoupon ? (
                      <div className="bg-transparent border border-[#736C5F] p-3 flex justify-between items-center">
                        <div>
                          <p className="text-base text-[#28251F] font-medium">
                            discount code applied: {appliedCoupon?.code}
                          </p>
                          {appliedCoupon?.description && (
                            <p className="text-base text-[#656056] mt-1">
                              {appliedCoupon.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-[#736C5F] hover:text-[#28251F] transition-colors text-base underline"
                        >
                          remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex">
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) =>
                            setDiscountCode(e.target.value.toUpperCase())
                          }
                          placeholder="enter discount code here"
                          className="flex-1 px-3 py-2 text-base border-b border-[#D0C9BE] bg-transparent focus:outline-none focus:border-[#28251F] placeholder-[#28251F]"
                          disabled={isValidatingCoupon}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyDiscount();
                            }
                          }}
                        />
                        <button
                          onClick={handleApplyDiscount}
                          disabled={isValidatingCoupon || !discountCode.trim()}
                          className={`px-4 py-2 text-base font-black transition-colors cursor-pointer ${
                            isValidatingCoupon || !discountCode.trim()
                              ? "text-[#D0C9BE] cursor-not-allowed"
                              : "text-[#736C5F] hover:text-black"
                          }`}
                        >
                          {isValidatingCoupon ? "validating..." : "apply"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Final Total */}
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="flex justify-between">
                      <span className="text-base font-normal text-[#28251F]">
                        total
                      </span>
                      <span className="text-lg font-black text-[#736C5F]">
                        inr {total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#E4DFD3] text-[#736C5F] py-3 px-6 text-lg font-medium tracking-wider hover:bg-[#736C5F] hover:text-[#E4DFD3] transition-colors flex items-center justify-center gap-2 border-b-1 border-[#736C5F] cursor-pointer"
                  >
                    checkout now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Tab Content */}
          {activeTab === "wishlist" && (
            <div className="border-t border-[#D0C9BE] pt-12">
              {/* Wishlist Header */}
              {wishlistItems.length > 0 && (
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-normal text-[#28251F]">
                    Wishlist ({wishlistItems.length}{" "}
                    {wishlistItems.length === 1 ? "item" : "items"})
                  </h3>
                  <button
                    onClick={() => {
                      clearWishlist();
                      toast.success("Wishlist cleared");
                    }}
                    className="text-[#736C5F] hover:text-gray-700 transition-colors text-base font-medium"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center py-16">
                  <div className="mb-4">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  </div>
                  <p className="text-[#736C5F] text-lg mb-4">
                    Your wishlist is empty
                  </p>
                  <p className="text-gray-500 text-base mb-6">
                    Save items you love by clicking the heart icon on any
                    product
                  </p>
                  <Link href="/store">
                    <button className="bg-[#E4DFD3] text-[#736C5F] py-3 px-6 text-lg font-medium tracking-wider hover:bg-[#736C5F] hover:text-[#E4DFD3] transition-colors flex items-center justify-center gap-2 border-b-1 border-[#736C5F] cursor-pointer">
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                  {wishlistItems.map((product) => (
                    <div key={product._id} className="group cursor-pointer">
                      {/* Product Image Container */}
                      <div
                        className="relative bg-gray-100 mb-6 overflow-hidden cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        {/* Normal Image */}
                        <img
                          src={
                            productImages[product._id]?.normal?.url ||
                            product.images?.[0]?.url ||
                            "/store/product1.png"
                          }
                          alt={
                            productImages[product._id]?.normal?.alt ||
                            product.images?.[0]?.alt ||
                            product.name
                          }
                          className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-0"
                        />

                        {/* Hover Image */}
                        {productImages[product._id]?.hover && (
                          <img
                            src={productImages[product._id].hover.url}
                            alt={
                              productImages[product._id].hover.alt ||
                              product.name
                            }
                            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-0"
                          />
                        )}

                        {/* Featured Badge */}
                        {product.isFeatured && (
                          <div className="absolute top-3 left-3 bg-[#28251F] text-white px-2 py-1 text-base font-medium rounded">
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex justify-between items-start">
                        <div
                          className="text-left flex-1 cursor-pointer"
                          onClick={() => handleProductClick(product)}
                        >
                          <h3 className="text-base font-normal text-[#28251F] mb-1 tracking-wide hover:opacity-70 transition-opacity capitalize text-left">
                            {product.name}
                          </h3>

                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg text-[#736C5F] font-medium">
                              inr{product.price.toLocaleString()}
                            </p>
                            {product.comparePrice &&
                              product.comparePrice > product.price && (
                                <p className="text-base text-[#736C5F] line-through">
                                  inr{product.comparePrice.toLocaleString()}
                                </p>
                              )}
                          </div>

                          {/* Color and Stock Info */}
                          <div className="flex items-center gap-2 text-base text-[#736C5F] mb-2">
                            {product.totalStock <= 5 &&
                              product.totalStock > 0 && (
                                <span className="text-[#736C5F] font-medium">
                                  Only {product.totalStock} left
                                </span>
                              )}
                          </div>
                        </div>

                        {/* Remove from Wishlist Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeWishlistItem(product._id);
                          }}
                          className="transition-all duration-300 hover:scale-110 cursor-pointer ml-2"
                          title="Remove from wishlist"
                        >
                          <Heart className="w-5 h-5 text-[#B7CEDA] fill-[#B7CEDA]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <HomeSectionSix />

      <Footer />
    </>
  );
};

const CartPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#736c5f] mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Loading Cart...</h2>
              <p className="text-gray-600">
                Please wait while we load your cart
              </p>
            </div>
          </div>
          <Footer />
        </div>
      }
    >
      <CartPageContent />
    </Suspense>
  );
};

export default CartPage;
