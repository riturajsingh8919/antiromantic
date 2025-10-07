"use client";

import React, { useState, useEffect } from "react";
import { Grid, List, ArrowRight, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutPageHeader from "@/components/AboutComponents/AboutPageHeader";

function CollectionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();

        if (result.success) {
          setCategories(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    const categorySlug =
      category.key ||
      category.slug ||
      (category.name && category.name.toLowerCase()) ||
      category.label;
    if (categorySlug === "all") {
      router.push("/store");
    } else {
      router.push(`/store?category=${categorySlug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E4DFD3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#736C5F] mx-auto mb-4"></div>
          <p className="text-[#28251F] text-lg">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E4DFD3] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-[#736C5F] mx-auto mb-4" />
          <p className="text-[#28251F] text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#736C5F] text-white px-6 py-2 rounded hover:bg-[#28251F] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      {/* Hero Section with AboutPageHeader style */}
      <div className="relative">
        <AboutPageHeader
          heading="Our Collections"
          imageUrl="/about/about-head.png"
        />
      </div>

      <div className="min-h-screen bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat py-16 px-4 md:px-10">
        {/* Main Content */}
        <div className="container">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#28251F] mb-4">
                Explore Categories
              </h2>
              <p className="text-[#827C71] text-lg max-w-2xl">
                From casual essentials to statement pieces, find your perfect
                style in our thoughtfully organized collections
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-white/85 rounded-lg p-1 shadow-sm border border-[#827C71]/20 w-fit">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#736C5F] text-white"
                    : "text-[#827C71] hover:text-[#28251F]"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-[#736C5F] text-white"
                    : "text-[#827C71] hover:text-[#28251F]"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Categories Grid/List */}
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
                : "space-y-4"
            }`}
          >
            {categories.map((category) => (
              <div
                key={category._id || category.key}
                onClick={() => handleCategoryClick(category)}
                className={`group cursor-pointer transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-white/25 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-[#827C71]/10 hover:border-[#736C5F]/30"
                    : "bg-white/25 rounded-lg p-6 shadow-sm hover:shadow-lg border border-[#827C71]/10 hover:border-[#736C5F]/30 flex items-center justify-between"
                }`}
              >
                {viewMode === "grid" ? (
                  <>
                    {/* Category Image */}
                    <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-[#E4DFD3] to-[#91B3C7]/20 overflow-hidden">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.label || category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-16 h-16 text-[#827C71]/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Category Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-[#28251F] capitalize group-hover:text-[#736C5F] transition-colors">
                          {category.label || category.name}
                        </h3>
                        <ArrowRight className="w-5 h-5 text-[#827C71] group-hover:text-[#736C5F] group-hover:translate-x-1 transition-all duration-300" />
                      </div>

                      {category.description && (
                        <p className="text-[#827C71] text-base mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-[#736C5F] font-medium text-base">
                          {category.count || 0} Products
                        </span>
                        <div className="w-8 h-1 bg-[#E4DFD3] rounded-full group-hover:bg-[#736C5F] transition-colors duration-300"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#E4DFD3] to-[#91B3C7]/20 rounded-lg flex items-center justify-center">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.label || category.name}
                            width={64}
                            height={64}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-[#827C71]/60" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#28251F] capitalize group-hover:text-[#736C5F] transition-colors">
                          {category.label || category.name}
                        </h3>
                        <p className="text-[#827C71] text-base">
                          {category.count || 0} Products available
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#827C71] group-hover:text-[#736C5F] group-hover:translate-x-1 transition-all duration-300" />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {categories.length === 0 && !loading && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-[#827C71]/60 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#28251F] mb-2">
                No Collections Available
              </h3>
              <p className="text-[#827C71] mb-6">
                We&apos;re currently updating our collections. Please check back
                soon!
              </p>
              <button
                onClick={() => router.push("/store")}
                className="bg-[#736C5F] text-white px-6 py-3 rounded-lg hover:bg-[#28251F] transition-colors"
              >
                Browse All Products
              </button>
            </div>
          )}

          {/* Call to Action */}
          {categories.length > 0 && (
            <div className="mt-16 lg:mt-20 text-center">
              <div className="bg-white/20 rounded-2xl p-8 lg:p-12 shadow-lg border border-[#827C71]/10">
                <h3 className="text-2xl lg:text-3xl font-bold text-[#28251F] mb-4">
                  Can&apos;t Find What You&apos;re Looking For?
                </h3>
                <p className="text-[#827C71] text-lg mb-8 max-w-2xl mx-auto">
                  Browse our complete product catalog or get personalized
                  recommendations from our style experts
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push("/store")}
                    className="bg-[#E4DFD3] text-[#736C5F] py-2 px-6 text-lg font-bold tracking-wider hover:bg-[#28251F] hover:text-white transition-colors flex items-center justify-center gap-2 border-b-2 border-[#736C5F] cursor-pointer"
                  >
                    View All Products
                  </button>
                  <button
                    onClick={() => router.push("/faqs")}
                    className="bg-[#E4DFD3] text-[#736C5F] py-2 px-6 text-lg font-bold tracking-wider hover:bg-[#28251F] hover:text-white transition-colors flex items-center justify-center gap-2 border-b-2 border-[#736C5F] cursor-pointer"
                  >
                    Get Help
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CollectionPage;
