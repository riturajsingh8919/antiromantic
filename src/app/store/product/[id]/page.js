"use client";

import React from "react";
import SingleProductPage from "@/components/ProductDetail/SingleProductPage";

// This would be a dynamic route: app/store/product/[id]/page.js
const ProductPage = ({ params }) => {
  // In a real app, you would fetch the product data based on params.id
  const resolvedParams = React.use(params);
  const productId = resolvedParams?.id || "1";

  return <SingleProductPage productId={productId} />;
};

export default ProductPage;
