"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Tag,
  Palette,
  Ruler,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/utils-admin";

export default function ProductViewPage({ params }) {
  const [product, setProduct] = useState(null);
  const [productId, setProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = await params;
        setProductId(id);
        const response = await fetch(`/api/admin/products/${id}`);
        const result = await response.json();

        if (result.success) {
          setProduct(result.data);
        } else {
          console.error("Failed to fetch product:", result.message);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { id } = await params;
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        router.push("/admin/products");
      } else {
        alert(result.message || "Error deleting product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Product not found</div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto p-4 sm:p-6 max-w-7xl"
      style={{ backgroundColor: "#efece3" }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link href="/admin/products">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                {product.name}
              </h1>
              <p className="text-gray-600 text-base sm:text-base">
                Product Details
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href={`/admin/products/${productId}/edit`}
              className="w-full sm:w-auto"
            >
              <Button
                style={{ backgroundColor: "#736c5f", color: "white" }}
                className="w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Product Images */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
                    {product.images.map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        {image && image.url ? (
                          <Image
                            src={image.url}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-contain rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                            <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                            <span className="text-base sm:text-base text-gray-500 mt-2">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                    <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    <span className="text-base sm:text-base text-gray-500 mt-2">
                      No images uploaded
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Details */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Name
                  </label>
                  <p className="text-base sm:text-lg font-semibold break-words">
                    {product.name}
                  </p>
                </div>
                <div>
                  <label className="text-base font-medium text-gray-600">
                    SKU
                  </label>
                  <p className="text-base sm:text-lg font-mono">
                    {product.sku || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Category
                  </label>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Status
                  </label>
                  <Badge
                    variant={
                      product.status === "active" ? "default" : "secondary"
                    }
                  >
                    {product.status}
                  </Badge>
                </div>
              </div>

              {product.shortDescription && (
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Short Description
                  </label>
                  <p className="text-gray-800 mt-1">
                    {product.shortDescription}
                  </p>
                </div>
              )}

              {product.description && (
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Description
                  </label>
                  <p className="text-gray-800 mt-1">{product.description}</p>
                </div>
              )}

              <div>
                <label className="text-base font-medium text-gray-600">
                  Slug
                </label>
                <p className="text-gray-800 font-mono text-base">
                  {product.slug}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Price
                  </label>
                  <p className="text-2xl font-bold text-gray-700">
                    {formatPrice(product.price)}
                  </p>
                </div>
                {product.comparePrice && (
                  <div>
                    <label className="text-base font-medium text-gray-600">
                      Compare Price
                    </label>
                    <p className="text-lg text-gray-500 line-through">
                      {formatPrice(product.comparePrice)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Total Stock
                  </label>
                  <p className="text-lg font-semibold">{product.totalStock}</p>
                </div>
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Low Stock Threshold
                  </label>
                  <p className="text-lg">{product.lowStockThreshold}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color & Size Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Color & Size Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-base font-medium text-gray-600">
                  Color
                </label>
                <p className="text-lg font-semibold">{product.colorName}</p>
              </div>

              {product.sizeStock && product.sizeStock.length > 0 && (
                <div>
                  <label className="text-base font-medium text-gray-600 mb-2 block">
                    Size Stock
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {product.sizeStock.map((item) => (
                      <div
                        key={item.size}
                        className="border rounded-lg p-3 text-center"
                      >
                        <div className="font-semibold">{item.size}</div>
                        <div className="text-base text-gray-600">
                          {item.stock} units
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Features */}
          <Card>
            <CardHeader>
              <CardTitle>Product Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Featured Product
                  </label>
                  <Badge variant={product.isFeatured ? "default" : "secondary"}>
                    {product.isFeatured ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Weight (grams)
                  </label>
                  <p className="text-gray-800">{product.weight || 0}g</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Shipping Class
                  </label>
                  <Badge variant="outline">{product.shippingClass}</Badge>
                </div>
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Estimated Delivery
                  </label>
                  <p className="text-gray-800">
                    {product.estimatedDeliveryDays} days
                  </p>
                </div>
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Special Handling
                  </label>
                  <Badge
                    variant={
                      product.requiresSpecialHandling
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {product.requiresSpecialHandling
                      ? "Required"
                      : "Not Required"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews & Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews & Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Average Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-yellow-600">
                      {product.averageRating.toFixed(1)}
                    </p>
                    <span className="text-yellow-500">★</span>
                  </div>
                </div>
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Total Reviews
                  </label>
                  <p className="text-2xl font-bold text-gray-800">
                    {product.reviewCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Material & Care */}
          {(product.material || product.careInstructions) && (
            <Card>
              <CardHeader>
                <CardTitle>Material & Care</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.material && (
                  <div>
                    <label className="text-base font-medium text-gray-600">
                      Material
                    </label>
                    <p className="text-gray-800">{product.material}</p>
                  </div>
                )}
                {product.careInstructions && (
                  <div>
                    <label className="text-base font-medium text-gray-600">
                      Care Instructions
                    </label>
                    <p className="text-gray-800">{product.careInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Customer Assistance */}
          {(product.sizeGuide?.bulletPoints?.length > 0 ||
            product.sizeGuide?.image ||
            product.faqSection?.length > 0 ||
            product.customerSupportNotes?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Assistance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Size Guide */}
                {(product.sizeGuide?.bulletPoints?.length > 0 ||
                  product.sizeGuide?.image) && (
                  <div>
                    <label className="text-base font-medium text-gray-600 mb-3 block">
                      Size Guide
                    </label>
                    <div className="space-y-3">
                      {/* Size Guide Image */}
                      {product.sizeGuide?.image && (
                        <div className="w-full max-w-md">
                          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={product.sizeGuide.image}
                              alt="Size Guide"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="text-base text-gray-500 mt-1">
                            Size Guide Image
                          </p>
                        </div>
                      )}

                      {/* Size Guide Bullet Points */}
                      {product.sizeGuide?.bulletPoints?.length > 0 && (
                        <div>
                          <ul className="list-disc list-inside space-y-1 text-gray-800">
                            {product.sizeGuide.bulletPoints.map(
                              (point, index) => (
                                <li
                                  key={index}
                                  className="text-base break-words"
                                >
                                  {point}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FAQ Section */}
                {product.faqSection?.length > 0 && (
                  <div>
                    <label className="text-base font-medium text-gray-600 mb-3 block">
                      Frequently Asked Questions
                    </label>
                    <div className="space-y-4">
                      {product.faqSection.map((faq, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-gray-200 pl-4"
                        >
                          <div className="mb-2">
                            <span className="text-base font-medium text-gray-700">
                              Q:
                            </span>
                            <p className="text-base text-gray-800 mt-1 break-words">
                              {faq.question}
                            </p>
                          </div>
                          <div>
                            <span className="text-base font-medium text-gray-700">
                              A:
                            </span>
                            <p className="text-base text-gray-600 mt-1 break-words">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Support Notes */}
                {product.customerSupportNotes?.length > 0 && (
                  <div>
                    <label className="text-base font-medium text-gray-600 mb-3 block">
                      Customer Support Notes
                    </label>
                    <ul className="list-disc list-inside space-y-1">
                      {product.customerSupportNotes.map((note, index) => (
                        <li
                          key={index}
                          className="text-base text-gray-800 break-words"
                        >
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* SEO */}
          {(product.metaTitle || product.metaDescription) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.metaTitle && (
                  <div>
                    <label className="text-base font-medium text-gray-600">
                      Meta Title
                    </label>
                    <p className="text-gray-800">{product.metaTitle}</p>
                  </div>
                )}
                {product.metaDescription && (
                  <div>
                    <label className="text-base font-medium text-gray-600">
                      Meta Description
                    </label>
                    <p className="text-gray-800">{product.metaDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Created
                  </label>
                  <p className="text-gray-800">
                    {formatDate(product.createdAt)}
                  </p>
                  <p className="text-base text-gray-500">
                    by {product.createdBy}
                  </p>
                </div>
                <div>
                  <label className="text-base font-medium text-gray-600">
                    Updated
                  </label>
                  <p className="text-gray-800">
                    {formatDate(product.updatedAt)}
                  </p>
                  <p className="text-base text-gray-500">
                    by {product.updatedBy}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
