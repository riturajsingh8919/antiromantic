"use client";

import React, { useState } from "react";
import RecommendedProductsCarousel from "../storeComponents/RecommendedProductsCarousel";

const CarouselDemo = () => {
  const [favorites, setFavorites] = useState([]);

  // Sample product data (you can replace this with your actual data)
  const sampleProducts = [
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

  const handleProductClick = (product) => {
    console.log("Product clicked:", product);
    // Add your navigation logic here
    // e.g., router.push(`/store/product/${product.id}`)
  };

  const handleFavoriteClick = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleViewAllClick = () => {
    console.log("View all clicked");
    // Add your navigation logic here
    // e.g., router.push('/store')
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-light text-[#656056] mb-4">
            Recommended Products Carousel Demo
          </h1>
          <p className="text-lg text-[#736C5F]">
            A production-ready, responsive carousel component matching the exact
            design from the attached image.
          </p>
        </div>
      </div>

      {/* Demo Sections */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Default Carousel - Matches Attached Image */}
        <section>
          <h2 className="text-2xl font-semibold text-[#28251F] mb-6">
            Default Configuration (Matches Attached Image)
          </h2>
          <RecommendedProductsCarousel
            products={sampleProducts}
            title="recommended"
            onProductClick={handleProductClick}
            onFavoriteClick={handleFavoriteClick}
            onViewAllClick={handleViewAllClick}
            favorites={favorites}
          />
        </section>

        {/* Custom Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-[#28251F] mb-6">
            Custom Configuration
          </h2>
          <RecommendedProductsCarousel
            products={sampleProducts}
            title="you might also like"
            autoSlideInterval={3000}
            slidesToShow={{
              mobile: 1,
              tablet: 3,
              desktop: 5,
            }}
            onProductClick={handleProductClick}
            onFavoriteClick={handleFavoriteClick}
            onViewAllClick={handleViewAllClick}
            favorites={favorites}
            className="bg-white p-8 rounded-lg shadow-sm"
          />
        </section>

        {/* No Auto-slide */}
        <section>
          <h2 className="text-2xl font-semibold text-[#28251F] mb-6">
            Manual Navigation Only
          </h2>
          <RecommendedProductsCarousel
            products={sampleProducts}
            title="new arrivals"
            autoSlideInterval={0}
            slidesToShow={{
              mobile: 1,
              tablet: 2,
              desktop: 3,
            }}
            onProductClick={handleProductClick}
            onFavoriteClick={handleFavoriteClick}
            onViewAllClick={handleViewAllClick}
            favorites={favorites}
          />
        </section>

        {/* Without View All Button */}
        <section>
          <h2 className="text-2xl font-semibold text-[#28251F] mb-6">
            Without View All Button
          </h2>
          <RecommendedProductsCarousel
            products={sampleProducts.slice(0, 4)}
            title="best sellers"
            showDots={false}
            showViewAll={false}
            autoSlideInterval={0}
            onProductClick={handleProductClick}
            onFavoriteClick={handleFavoriteClick}
            favorites={favorites}
          />
        </section>
      </div>

      {/* Usage Instructions */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-semibold text-[#28251F] mb-6">
            Usage Instructions
          </h2>
          <div className="prose max-w-none text-[#736C5F]">
            <h3 className="text-xl font-medium text-[#28251F] mb-4">
              Basic Usage
            </h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-base overflow-x-auto">
              {`import RecommendedProductsCarousel from './components/storeComponents/RecommendedProductsCarousel';

<RecommendedProductsCarousel
  products={products}
  title="recommended"
  onProductClick={(product) => router.push(\`/store/product/\${product.id}\`)}
  onFavoriteClick={(productId) => toggleFavorite(productId)}
  onViewAllClick={() => router.push('/store')}
  favorites={userFavorites}
/>`}
            </pre>

            <h3 className="text-xl font-medium text-[#28251F] mb-4 mt-8">
              Props
            </h3>
            <ul className="space-y-2">
              <li>
                <strong>products</strong>: Array of product objects (falls back
                to demo data if empty)
              </li>
              <li>
                <strong>title</strong>: Section title (default: "recommended")
              </li>
              <li>
                <strong>autoSlideInterval</strong>: Auto-slide interval in ms (0
                to disable, default: 5000)
              </li>
              <li>
                <strong>showNavigation</strong>: Show arrow navigation (default:
                true)
              </li>
              <li>
                <strong>showDots</strong>: Show dot indicators (default: true)
              </li>
              <li>
                <strong>showViewAll</strong>: Show view all button (default:
                true)
              </li>
              <li>
                <strong>slidesToShow</strong>: Responsive slides configuration
              </li>
              <li>
                <strong>onProductClick</strong>: Callback for product clicks
              </li>
              <li>
                <strong>onFavoriteClick</strong>: Callback for favorite button
                clicks
              </li>
              <li>
                <strong>onViewAllClick</strong>: Callback for view all button
                clicks
              </li>
              <li>
                <strong>favorites</strong>: Array of favorite product IDs
              </li>
              <li>
                <strong>className</strong>: Additional CSS classes
              </li>
            </ul>

            <h3 className="text-xl font-medium text-[#28251F] mb-4 mt-8">
              Features
            </h3>
            <ul className="space-y-2">
              <li>✅ Matches exact design from StoreProducts component</li>
              <li>✅ Navigation arrows matching attached image design</li>
              <li>✅ View all button in header section</li>
              <li>✅ Fully responsive (mobile, tablet, desktop)</li>
              <li>✅ Smooth animations and transitions</li>
              <li>✅ Touch/swipe support for mobile</li>
              <li>✅ Mouse drag support for desktop</li>
              <li>✅ Auto-slide with pause on hover</li>
              <li>✅ Infinite loop navigation</li>
              <li>✅ Production-ready with error handling</li>
            </ul>

            <h3 className="text-xl font-medium text-[#28251F] mb-4 mt-8">
              Design Changes
            </h3>
            <ul className="space-y-2">
              <li>🎨 Updated product cards to match StoreProducts exactly</li>
              <li>
                🎨 Changed heart icon position to bottom right (same as store)
              </li>
              <li>🎨 Updated navigation arrows to simple border buttons</li>
              <li>
                🎨 Added header section with title and navigation/view all
              </li>
              <li>🎨 Removed rounded corners from product images</li>
              <li>🎨 Updated spacing and typography to match store design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselDemo;
