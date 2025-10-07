"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  MoveRight,
  MoveLeft,
} from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";

/**
 * RecommendedProductsCarousel - A reusable carousel component for displaying product recommend      // If no custom handler provided, navigate to product page
      if (onProductClick && typeof onProductClick === 'function') {
        onProductClick(product);
      } else if (product.slug) {
        window.location.href = `/store/${product.slug}`;
      } else {
        // For products without slugs (default products), we can't navigate
        console.log('Product clicked but no slug available:', product.name);
      }
 *
 * @param {Object} props
 * @param {Array} props.products - Array of product objects to display
 * @param {string} props.title - Title for the carousel section
 * @param {number} props.autoSlideInterval - Auto-slide interval in milliseconds (0 to disable)
 * @param {boolean} props.showNavigation - Whether to show navigation arrows
 * @param {number} props.slidesToShow - Number of slides to show at once (responsive)
 * @param {Function} props.onProductClick - Callback when a product is clicked
 * @param {Function} props.onFavoriteClick - Callback when favorite button is clicked
 * @param {Array} props.favorites - Array of favorite product IDs
 * @param {boolean} props.showViewAll - Whether to show the view all button
 * @param {string} props.className - Additional CSS classes
 */
const RecommendedProductsCarousel = ({
  products = [],
  title = "recommended",
  autoSlideInterval = 5000,
  showNavigation = true,
  slidesToShow = {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  onProductClick = () => {},
  onFavoriteClick = () => {},
  showViewAll = true,
  className = "",
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  const carouselRef = useRef(null);
  const touchStartRef = useRef(null);
  const autoSlideRef = useRef(null);

  // Default product data matching the store structure
  const defaultProducts = [
    {
      id: 1,
      name: "linen shirt",
      price: 2999,
      image: "/store/product1.png",
      category: "tops",
      size: ["S", "M", "L", "XL"],
      featured: true,
    },
    {
      id: 2,
      name: "bell tunic dress",
      price: 1799,
      image: "/store/product2.png",
      category: "dresses",
      size: ["XS", "S", "M", "L"],
      featured: false,
    },
    {
      id: 3,
      name: "long mesh dress",
      price: 6499,
      image: "/store/product3.png",
      category: "dresses",
      size: ["S", "M", "L"],
      featured: true,
    },
    {
      id: 4,
      name: "linen blend shorts",
      price: 2999,
      image: "/store/product4.png",
      category: "bottoms",
      size: ["XS", "S", "M", "L", "XL"],
      featured: false,
    },
    {
      id: 5,
      name: "linen lemon shirt",
      price: 1999,
      image: "/store/product5.png",
      category: "tops",
      size: ["S", "M", "L"],
      featured: false,
    },
    {
      id: 6,
      name: "wide linen blend trousers",
      price: 2999,
      image: "/store/product6.png",
      category: "bottoms",
      size: ["XS", "S", "M", "L", "XL"],
      featured: true,
    },
  ];

  // Transform dynamic products to match expected format
  const transformedProducts = products.map((product) => ({
    id: product._id || product.id,
    name: product.name || "Unnamed Product",
    price: product.price || 0,
    image: product.images?.[0]?.url || product.image || "/store/product1.png",
    category: product.category || "uncategorized",
    size:
      product.sizeStock?.filter((s) => s.stock > 0).map((s) => s.size) ||
      product.size ||
      [],
    featured: product.isFeatured || product.featured || false,
    slug: product.slug,
  }));

  const displayProducts =
    transformedProducts.length > 0 ? transformedProducts : defaultProducts;

  // Debug logging
  console.log("RecommendedProductsCarousel props:", {
    productsCount: products.length,
    transformedCount: transformedProducts.length,
    displayCount: displayProducts.length,
  });

  // Responsive breakpoint detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Get current slides to show based on screen size
  const getCurrentSlidesToShow = useCallback(() => {
    if (isMobile) return slidesToShow.mobile;
    if (isTablet) return slidesToShow.tablet;
    return slidesToShow.desktop;
  }, [isMobile, isTablet, isDesktop, slidesToShow]);

  const currentSlidesToShow = getCurrentSlidesToShow();
  const totalSlides = Math.max(
    0,
    displayProducts.length - currentSlidesToShow + 1
  );

  // Auto-slide functionality
  useEffect(() => {
    if (autoSlideInterval > 0 && !isHovered && !isDragging && totalSlides > 1) {
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, autoSlideInterval);
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [autoSlideInterval, isHovered, isDragging, totalSlides]);

  // Navigation functions
  const goToSlide = useCallback(
    (index) => {
      const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
      setCurrentSlide(clampedIndex);
    },
    [totalSlides]
  );

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Touch/Mouse drag handlers
  const handleDragStart = useCallback((clientX) => {
    setIsDragging(true);
    setDragStart(clientX);
    setDragOffset(0);
  }, []);

  const handleDragMove = useCallback(
    (clientX) => {
      if (!isDragging || dragStart === null) return;

      const diff = clientX - dragStart;
      setDragOffset(diff);
    },
    [isDragging, dragStart]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    const threshold = 50; // minimum drag distance to trigger slide change

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragOffset(0);
  }, [isDragging, dragOffset, nextSlide, prevSlide]);

  // Mouse events
  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      handleDragStart(e.clientX);
    },
    [handleDragStart]
  );

  const handleMouseMove = useCallback(
    (e) => {
      handleDragMove(e.clientX);
    },
    [handleDragMove]
  );

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Touch events
  const handleTouchStart = useCallback(
    (e) => {
      const touch = e.touches[0];
      touchStartRef.current = touch.clientX;
      handleDragStart(touch.clientX);
    },
    [handleDragStart]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!touchStartRef.current) return;
      const touch = e.touches[0];
      handleDragMove(touch.clientX);
    },
    [handleDragMove]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    handleDragEnd();
  }, [handleDragEnd]);

  // Add global mouse event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle product click
  const handleProductClick = useCallback(
    (product, e) => {
      // Don't trigger click if we were dragging
      if (Math.abs(dragOffset) > 5) {
        e.preventDefault();
        return;
      }

      // If no custom handler provided, navigate to product page
      if (onProductClick && typeof onProductClick === "function") {
        onProductClick(product);
      } else if (product.slug) {
        window.location.href = `/store/product/${product.slug}`;
      }
    },
    [dragOffset, onProductClick]
  );

  // Handle wishlist toggle
  const handleWishlistToggle = (product, e) => {
    e.stopPropagation();
    // Find the original product from the products array
    const originalProduct = products.find(
      (p) => p._id === product.id || p._id === product._id
    );
    if (originalProduct) {
      toggleWishlist(originalProduct);
    } else {
      // For default products, create a compatible product object
      const productForWishlist = {
        _id: product.id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        images: [{ url: product.image, alt: product.name }],
        slug: product.slug || `product-${product.id}`,
        category: product.category,
        colorName: "Default",
        sizeStock: product.size
          ? product.size.map((s) => ({ size: s, stock: 1 }))
          : [],
        totalStock: product.size ? product.size.length : 1,
        isFeatured: product.featured || false,
      };
      toggleWishlist(productForWishlist);
    }
  };

  // Always show the carousel - either with dynamic products or default products
  if (displayProducts.length === 0) {
    console.warn("RecommendedProductsCarousel: No products to display");
    return null;
  }

  // Calculate proper slide width and movement accounting for margins
  const marginSize = isMobile ? 16 : 15; // 16px mobile, 15px desktop

  // Calculate card width: (100% - total gaps) / number of cards
  const totalGaps = (currentSlidesToShow - 1) * marginSize;
  const containerWidth = carouselRef.current?.offsetWidth || 1;
  const availableWidthPercentage = 100 - (totalGaps / containerWidth) * 100;
  const cardWidth = availableWidthPercentage / currentSlidesToShow;

  // For translation, we move by card width + gap
  const marginPercentage = (marginSize / containerWidth) * 100;
  const slideStep = cardWidth + marginPercentage;

  const translateX =
    -(currentSlide * slideStep) +
    (isDragging ? (dragOffset / containerWidth) * 100 : 0);

  return (
    <div
      className={`relative bg-[url('/store/store-sec-bg.png')] bg-no-repeat bg-cover bg-center px-4 md:px-10 ${className}`}
    >
      <div className="container">
        {/* Header with Title and View All/Navigation */}
        <div className="flex justify-between items-center mb-16 border-b border-[#D0C9BE] pb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-light text-[#656056] tracking-wide">
              {title}
            </h2>

            {/* Navigation Arrows */}
            {showNavigation && totalSlides > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className={`w-8 h-8 flex items-center justify-center rounded-full bg-[#656056] hover:bg-[#28251F] transition-colors cursor-pointer ${
                    currentSlide === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={currentSlide === 0}
                >
                  <MoveLeft className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={nextSlide}
                  className={`w-8 h-8 flex items-center justify-center rounded-full bg-[#656056] hover:bg-[#28251F] transition-colors cursor-pointer ${
                    currentSlide === totalSlides - 1
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={currentSlide === totalSlides - 1}
                >
                  <MoveRight className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* View All Button */}
          {showViewAll && (
            <Link
              href="/store"
              className="hidden md:block text-lg font-medium text-[#28251F] hover:text-black transition-colors cursor-pointer"
            >
              view all
            </Link>
          )}
        </div>

        {/* Carousel Container */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Products Slider */}
          <div
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-out cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(${translateX}%)`,
              transitionDuration: isDragging ? "0ms" : "500ms",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {displayProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex-none"
                style={{
                  width: `${cardWidth}%`,
                  marginRight:
                    index < displayProducts.length - 1
                      ? `${marginSize}px`
                      : "0",
                }}
              >
                <div
                  className="group cursor-pointer select-none"
                  onClick={(e) => handleProductClick(product, e)}
                >
                  {/* Product Image Container */}
                  <div className="relative bg-gray-100 mb-6 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      draggable={false}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <h3 className="text-base font-medium text-[#28251F] mb-1 tracking-wide leading-normal">
                        {product.name}
                      </h3>
                      <p className="text-lg text-[#736C5F] font-bold">
                        inr{product.price.toLocaleString()}
                      </p>
                    </div>
                    {/* Wishlist Heart Icon */}
                    <button
                      onClick={(e) => handleWishlistToggle(product, e)}
                      className="transition-all duration-300 hover:scale-110 cursor-pointer"
                      title={
                        isInWishlist(product.id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isInWishlist(product.id)
                            ? "text-[#B7CEDA] fill-[#B7CEDA]"
                            : "text-[#28251F] hover:text-[#28251F]"
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedProductsCarousel;
