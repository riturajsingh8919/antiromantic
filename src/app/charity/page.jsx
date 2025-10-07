import AboutPageHeader from "@/components/AboutComponents/AboutPageHeader";
import CharitySectionThree from "@/components/charityComponents/CharitySectionThree";
import CharitySectionTwo from "@/components/charityComponents/CharitySectionTwo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React from "react";

function Charity() {
  return (
    <>
      <Header />
      <AboutPageHeader heading="charity" imageUrl="/charity/header.jpg" />
      <CharitySectionTwo />
      <CharitySectionThree />
      <Footer />
    </>
  );
}

export default Charity;
