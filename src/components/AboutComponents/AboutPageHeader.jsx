"use client";

import React from "react";
import { motion } from "framer-motion";

function AboutPageHeader({ heading, imageUrl }) {
  // Hero text animation on page load
  const textVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.9,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.3,
      },
    },
  };

  return (
    <section
      className={`relative w-full min-h-[250px] pt-[49px] bg-no-repeat bg-cover overflow-x-hidden`}
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <motion.h1
        className="text-3xl font-normal text-white absolute top-[65%] right-[20%] right-class"
        initial="hidden"
        animate="visible"
        variants={textVariants}
      >
        {heading}
      </motion.h1>
    </section>
  );
}

export default AboutPageHeader;
