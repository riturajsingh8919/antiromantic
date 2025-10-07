import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeSectionSix from "@/components/HomeComponents/HomeSectionSix";
import StorePageHead from "@/components/storeComponents/StorePageHead";
import StoreProducts from "@/components/storeComponents/StoreProducts";
import React from "react";

function page() {
  return (
    <>
      <Header />
      <StorePageHead />
      <StoreProducts />
      <HomeSectionSix />
      <Footer />
    </>
  );
}

export default page;
