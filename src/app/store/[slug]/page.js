"use client";

import React, { useState, useEffect } from "react";
import SingleProductPage from "@/components/ProductDetail/SingleProductPage";

// Dynamic route: app/store/[slug]/page.js
const ProductPage = ({ params }) => {
  const [productSlug, setProductSlug] = React.useState(null);

  React.useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setProductSlug(resolvedParams?.slug);
    };
    getParams();
  }, [params]);

  if (!productSlug) {
    return <div>Loading...</div>;
  }

  return <SingleProductPage productSlug={productSlug} />;
};

export default ProductPage;
