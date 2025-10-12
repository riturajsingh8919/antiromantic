"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

function AboutSectionThree() {
  // Container for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  // Simple fade animation for text
  const textFadeVariants = {
    hidden: {
      opacity: 0,
      y: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Simple fade animation for image
  const imageFadeVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative bg-[url('/about/about-sec-2-bg.jpg')] bg-no-repeat bg-cover overflow-x-hidden -mt-1">
      <div className="relative flex flex-col-reverse md:flex-row lg:items-center">
        {/* Left side - Text content */}
        <motion.div
          className="w-full md:w-[45%] flex items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="flex flex-col gap-8 px-4 md:px-0 md:max-w-[80%] mx-auto py-16 md:py-0">
            {/* Icon */}
            <motion.div variants={textFadeVariants}>
              <Image
                src="/about/home-sec-3-icon.svg"
                alt="About Section Image"
                width={80}
                height={104}
                className="w-fit h-[80px] object-cover"
              />
            </motion.div>

            {/* Heading */}
            <motion.h2
              className="text-text text-3xl lg:text-4xl relative"
              variants={textFadeVariants}
            >
              positioning
            </motion.h2>

            {/* Paragraphs */}
            <motion.div className="flex flex-col gap-3">
              <motion.p variants={textFadeVariants}>
                Love isn't something you chase, it's something you choose. And
                that choice should always include your wardrobe.
              </motion.p>
              <motion.p variants={textFadeVariants}>
                Thoughtfully crafted in small batches, using natural fabrics and
                responsible practices — we take the silhouettes you know and
                rework them with details that make them unmistakably yours.
                These are the pieces that bring you comfort, ones you keep
                coming back to, ones that feel like home. Antiromantic is made
                to be worn, loved, and lived in—not just for a season, but for
                years to come. Because the things you love should love you back.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Image */}
        <motion.div
          className="w-full md:w-[55%] flex items-center justify-baseline md:justify-end pl-16 md:pl-0 py-16 pr-16 bg-[url('/about/section-3-right-bg.png')] bg-no-repeat bg-cover"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={imageFadeVariants}
        >
          <Image
            src="/about/section-3-img.png"
            alt="About Section Image"
            width={500}
            height={300}
            className="w-full md:w-fit md:h-[70vh] object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSectionThree;
