"use client";

import React, { useState, useRef, useEffect } from "react";
import { Heart } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import Link from "next/link";
import Image from "next/image";
import RecommendedProductsCarousel from "../storeComponents/RecommendedProductsCarousel";
import HomeSectionSix from "../HomeComponents/HomeSectionSix";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";

const SingleProductPage = ({ productSlug }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, loading: cartLoading } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [rightColumnHeight, setRightColumnHeight] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [productsInner, setProductsInner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  const tabs = [
    { key: "description", label: "description" },
    { key: "materials", label: "materials" },
    { key: "care", label: "care instructions" },
    ...(product?.sizeGuide?.bulletPoints?.length > 0
      ? [{ key: "sizing", label: "size guide" }]
      : []),
  ];

  // Fetch product data from API
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productSlug) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch product data
        const productResponse = await fetch(`/api/products/${productSlug}`);
        const productResult = await productResponse.json();

        if (productResult.success) {
          setProduct(productResult.data);

          // Fetch product inner data
          const innerResponse = await fetch(
            `/api/product-inner?productId=${productResult.data._id}`
          );
          const innerResult = await innerResponse.json();

          if (innerResult.success) {
            setProductsInner(innerResult.data);
          }

          // Fetch recommended products with comprehensive strategy
          try {
            console.log(
              "Fetching recommendations for product:",
              productResult.data.name,
              "Category:",
              productResult.data.category
            );

            // Strategy 1: Get all products first, then prioritize same category
            const allProductsResponse = await fetch(
              `/api/products?limit=50&sort=featured`
            );
            const allProductsResult = await allProductsResponse.json();

            let recommendedProducts = [];

            if (
              allProductsResult.success &&
              allProductsResult.data.length > 0
            ) {
              // Filter out current product
              const availableProducts = allProductsResult.data.filter(
                (p) => p._id !== productResult.data._id
              );

              console.log(
                "Available products for recommendations:",
                availableProducts.length
              );

              if (availableProducts.length > 0) {
                // Separate same category and other products
                const sameCategoryProducts = availableProducts.filter(
                  (p) => p.category === productResult.data.category
                );
                const otherProducts = availableProducts.filter(
                  (p) => p.category !== productResult.data.category
                );

                console.log(
                  "Same category products:",
                  sameCategoryProducts.length
                );
                console.log("Other category products:", otherProducts.length);

                // Prioritize same category products, then add others
                recommendedProducts = [
                  ...sameCategoryProducts.slice(0, 6), // Up to 6 from same category
                  ...otherProducts.slice(
                    0,
                    8 - sameCategoryProducts.slice(0, 6).length
                  ), // Fill remaining with others
                ].slice(0, 8); // Ensure max 8 products
              }
            }

            console.log(
              "Final recommended products count:",
              recommendedProducts.length
            );
            setRecommendedProducts(recommendedProducts);
          } catch (error) {
            console.error("Error fetching recommended products:", error);
            // Set empty array but carousel will show default products
            setRecommendedProducts([]);
          }
        } else {
          setError(productResult.error || "Product not found");
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setError("Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productSlug]);

  // Calculate right column height based on left column
  useEffect(() => {
    const calculateHeight = () => {
      if (leftColumnRef.current) {
        const leftHeight = leftColumnRef.current.scrollHeight;
        setRightColumnHeight(leftHeight);
      }
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const success = await addToCart(product, selectedSize, quantity);
    if (success) {
      // Reset form
      setQuantity(1);
      // Keep size selected for easier multiple additions
    }
  };

  const handleWishlistToggle = () => {
    if (product) {
      toggleWishlist(product);
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[url('/store/store-sec-bg.png')] px-4 md:px-10 pt-[64px]">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 py-16">
              <div className="flex-1 lg:w-[40%]">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 aspect-square rounded"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="flex-1 lg:w-[60%] lg:p-8">
                <div className="animate-pulse space-y-8">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[url('/store/store-sec-bg.png')] px-4 md:px-10 pt-[64px]">
          <div className="container py-16">
            <div className="text-center">
              <h1 className="text-2xl font-light text-[#656056] mb-4">
                {error || "Product not found"}
              </h1>
              <Link
                href="/store"
                className="inline-block px-6 py-3 bg-[#28251F] text-white rounded hover:bg-[#1a1715] transition-colors"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <Header />

      <div className="min-h-screen bg-[url('/store/store-sec-bg.png')] px-4 md:px-10 pt-[64px]">
        {/* Main Product Section */}
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Left Column - Scrollable Images (40%) */}
            <div ref={leftColumnRef} className="flex-1 lg:w-[40%]">
              <div className="relative">
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <div key={index} className="w-full">
                      <img
                        src={image.url || image}
                        alt={image.alt || `${product.name} ${index + 1}`}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="w-full aspect-square bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Static Product Details (60%) */}
            <div className="flex-1 lg:w-[60%] lg:p-8">
              <div
                ref={rightColumnRef}
                className="lg:sticky lg:top-16 space-y-12 pb-8"
              >
                {/* Product Info */}
                <div className="space-y-8">
                  {/* Title and Favorite */}
                  <div className="flex justify-between items-start">
                    <h1 className="text-2xl md:text-3xl font-light text-[#656056] tracking-wide">
                      {product.name}
                    </h1>
                    <button
                      onClick={handleWishlistToggle}
                      className="p-2 hover:scale-110 transition-transform"
                      title={
                        product && isInWishlist(product._id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          product && isInWishlist(product._id)
                            ? "text-[#B7CEDA] fill-[#B7CEDA]"
                            : "text-[#28251F]"
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-bold text-[#736C5F]">
                        inr{product.price.toLocaleString()}
                      </p>
                      {product.comparePrice &&
                        product.comparePrice > product.price && (
                          <>
                            <p className="text-lg text-gray-400 line-through">
                              inr{product.comparePrice.toLocaleString()}
                            </p>
                            <span className="bg-[#B7CEDA] text-gray-900 px-2 py-1 text-base rounded">
                              {Math.round(
                                (1 - product.price / product.comparePrice) * 100
                              )}
                              % OFF
                            </span>
                          </>
                        )}
                    </div>
                    <p className="text-base text-[#28251F] tracking-wide">
                      inclusive of all taxes
                    </p>
                  </div>

                  {/* Size Selection */}
                  <div className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-base font-medium text-[#28251F] tracking-wide">
                        select size
                      </label>
                      <button
                        onClick={() => {
                          if (
                            product?.sizeGuide?.image ||
                            product?.sizeGuide?.bulletPoints?.length > 0
                          ) {
                            setShowSizeGuide(true);
                          } else {
                            alert("Size guide not available for this product");
                          }
                        }}
                        className="text-base text-[#736C5F] underline hover:text-[#28251F]"
                      >
                        size guide
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {product.sizeStock && product.sizeStock.length > 0 ? (
                        product.sizeStock.map((sizeInfo) => (
                          <button
                            key={sizeInfo.size}
                            onClick={() => handleSizeSelect(sizeInfo.size)}
                            disabled={sizeInfo.stock === 0}
                            className={`w-12 h-12 text-base font-medium transition-colors relative ${
                              selectedSize === sizeInfo.size
                                ? "border-[#736C5F] border text-[#736C5F] !font-bold"
                                : sizeInfo.stock === 0
                                ? "border-[#D0C9BE] text-gray-400 cursor-not-allowed"
                                : "border-[#D0C9BE] text-[#736C5F] hover:border-[#736C5F] cursor-pointer"
                            }`}
                          >
                            {sizeInfo.size}
                            {sizeInfo.stock === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-px bg-gray-400 transform rotate-45"></div>
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500">No sizes available</p>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading || !product}
                    className="w-full bg-[#E4DFD3] text-[#736C5F] py-3 px-6 text-lg font-bold tracking-wider hover:bg-[#28251F] hover:text-white transition-colors flex items-center justify-center gap-2 border-b-2 border-[#736C5F] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cartLoading ? "Adding..." : "add to cart"}
                  </button>

                  <hr className="mt-12 mb-8 border-[#D0C9BE] " />

                  {/* Color Info */}
                  <div className="space-y-2 mt-8">
                    <p className="text-base font-black text-[#736C5F] tracking-wide">
                      color
                    </p>
                    <p className="text-base text-[#28251F]">
                      {product.colorName}
                    </p>
                  </div>

                  {/* Product Details Tabs */}
                  <div className="relative">
                    {/* Tab Navigation */}
                    <div className="mb-6">
                      <nav className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {tabs.map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-3 text-base font-medium transition-colors cursor-pointer ${
                              activeTab === tab.key
                                ? "text-[#736C5F] border-b-2 border-[#28251F] !font-black"
                                : "text-[#736C5F] hover:text-[#736C5F]"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <div>
                      {activeTab === "description" && (
                        <div className="space-y-4">
                          <p className="text-[#28251F] leading-relaxed text-base">
                            {product.description}
                          </p>
                        </div>
                      )}

                      {activeTab === "materials" && (
                        <div className="space-y-4">
                          <p className="text-[#28251F] text-base">
                            {product.material ||
                              "Material information not available"}
                          </p>
                        </div>
                      )}

                      {activeTab === "care" && (
                        <div className="space-y-4">
                          <p className="text-[#28251F] text-base">
                            {product.careInstructions ||
                              "Care instructions not available"}
                          </p>
                        </div>
                      )}

                      {activeTab === "sizing" && (
                        <div className="space-y-4">
                          {product.sizeGuide?.image && (
                            <div className="mb-4">
                              <img
                                src={product.sizeGuide.image}
                                alt="Size Guide"
                                className="w-full max-w-md mx-auto"
                              />
                            </div>
                          )}
                          {product.sizeGuide?.bulletPoints?.length > 0 && (
                            <ul className="space-y-2">
                              {product.sizeGuide.bulletPoints.map(
                                (point, index) => (
                                  <li
                                    key={index}
                                    className="text-[#28251F] text-base flex items-start"
                                  >
                                    <span className="inline-block w-2 h-2 bg-[#28251F] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    {point}
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-0 bg-[url('/store/store-sec-bg.png')]">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <div className="text-base text-muted-foreground">Loading...</div>
          </div>
        ) : (
          productsInner.map((item) => {
            if (item.type === "image") {
              // Render all images for image type items
              return item.images?.map((image, imageIndex) => (
                <div
                  key={`${item._id}-${imageIndex}`}
                  className="relative w-full h-full flex"
                >
                  <Image
                    src={image.url}
                    alt={`product-${item._id}-${imageIndex}`}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
              ));
            } else {
              // Render text content
              return (
                <div key={item._id} className="relative w-full h-full flex">
                  <div className="flex flex-col p-8 lg:pr-20 justify-center text-left space-y-4">
                    <p className="text-[#13120F]">{item.description}</p>
                    <Link
                      href={item.link}
                      className=" text-[#28251F] underline hover:text-[#736C5F] tracking-wide"
                    >
                      {item.buttonText}
                    </Link>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>

      <div className="bg-[url('/store/store-sec-bg.png')] bg-no-repeat bg-cover bg-center py-20">
        <RecommendedProductsCarousel
          products={recommendedProducts}
          title="recommended products"
          onProductClick={(product) => {
            if (product.slug) {
              window.location.href = `/store/${product.slug}`;
            } else {
              // For default products without slugs, create a fallback
              console.log("Clicked product without slug:", product);
            }
          }}
          onFavoriteClick={(productId) =>
            console.log("Toggle favorite:", productId)
          }
          showNavigation={true}
          showViewAll={true}
          autoSlideInterval={4000}
        />
      </div>
      <HomeSectionSix />
      {/* Footer */}
      <Footer />

      {/* Size Guide Modal */}
      {showSizeGuide &&
        (product?.sizeGuide?.image ||
          product?.sizeGuide?.bulletPoints?.length > 0) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSizeGuide(false)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
              >
                <span className="text-gray-600 text-xl">×</span>
              </button>

              {/* Modal Content */}
              <div className="p-6">
                <h3 className="text-2xl font-medium text-[#28251F] mb-4 capitalize">
                  {product.name} - Size Guide
                </h3>

                {/* Size Guide Image */}
                {product.sizeGuide?.image && (
                  <div className="mb-6">
                    <img
                      src={product.sizeGuide.image}
                      alt="Size Guide"
                      className="w-full h-auto max-w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default SingleProductPage;
