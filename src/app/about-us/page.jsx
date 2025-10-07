import AboutPageHeader from "@/components/AboutComponents/AboutPageHeader";
import AboutSectionFive from "@/components/AboutComponents/AboutSectionFive";
import AboutSectionFour from "@/components/AboutComponents/AboutSectionFour";
import AboutSectionThree from "@/components/AboutComponents/AboutSectionThree";
import AboutSectionTwo from "@/components/AboutComponents/AboutSectionTwo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React from "react";

function AboutUs() {
  return (
    <>
      <Header />
      <AboutPageHeader heading="About Us" imageUrl="/about/about-head.png" />
      <AboutSectionTwo />
      <AboutSectionThree />
      <AboutSectionFour />
      <AboutSectionFive />
      <Footer />
    </>
  );
}

export default AboutUs;
