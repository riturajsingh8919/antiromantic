import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/HomeComponents/Hero";
import HomeSectionFive from "@/components/HomeComponents/HomeSectionFive";
import HomeSectionFour from "@/components/HomeComponents/HomeSectionFour";
import HomeSectionSix from "@/components/HomeComponents/HomeSectionSix";
import HomeSectionThree from "@/components/HomeComponents/HomeSectionThree";
import HomeSectionTwo from "@/components/HomeComponents/HomeSectionTwo";
import React from "react";

function page() {
  return (
    <>
      <Header />
      <Hero />
      <HomeSectionTwo />
      <HomeSectionThree />
      <HomeSectionFour />
      <HomeSectionFive />
      <HomeSectionSix />
      <Footer />
    </>
  );
}

export default page;
