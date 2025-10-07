"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/admin/products/${id}`);
        const result = await response.json();

        if (result.success) {
          setProduct(result.data);
        } else {
          console.error("Failed to fetch product:", result.message);
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params, router]);

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

  return <ProductForm product={product} isEdit={true} />;
}
