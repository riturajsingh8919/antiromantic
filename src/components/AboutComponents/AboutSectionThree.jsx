"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

function AboutSectionThree() {
  // Icon animation - bouncy entrance
  const iconVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      rotate: 180,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        bounce: 0.6,
        duration: 1.2,
      },
    },
  };

  // Heading animation
  const headingVariants = {
    hidden: {
      opacity: 0,
      x: -50,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // Paragraph line-by-line animation
  const paragraphVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Image animation from right
  const imageVariants = {
    hidden: {
      opacity: 0,
      x: 100,
      scale: 0.9,
      rotateY: 20,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Left content stagger
  const leftContentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.2,
      },
    },
  };

  // Paragraph container stagger
  const paragraphContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section className="relative bg-[url('/about/section-3-bg.jpg')] bg-no-repeat bg-cover md:px-10 xl:px-22 overflow-x-hidden py-16 -mt-1">
      <div className="container">
        <div className="relative flex flex-col-reverse lg:flex-row lg:items-center gap-8 xl:gap-[12%]">
          {/* Left side - Text content */}
          <motion.div
            className="flex-1/2 flex flex-col gap-8 px-4 lg:px-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={leftContentVariants}
          >
            {/* Icon */}
            <motion.div variants={iconVariants}>
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
              variants={headingVariants}
            >
              positioning
            </motion.h2>

            {/* Paragraphs - line by line */}
            <motion.div
              className="flex flex-col gap-3"
              variants={paragraphContainerVariants}
            >
              <motion.p variants={paragraphVariants}>
                Love isn't something you chase, it's something you choose. And
                that choice should always include your wardrobe.
              </motion.p>
              <motion.p variants={paragraphVariants}>
                Thoughtfully crafted in small batches, using natural fabrics and
                responsible practices — we take the silhouettes you know and
                rework them with details that make them unmistakably yours.
                These are the pieces that bring you comfort, ones you keep
                coming back to, ones that feel like home. Antiromantic is made
                to be worn, loved, and lived in—not just for a season, but for
                years to come. Because the things you love should love you back.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Right side - Image */}
          <motion.div
            className="flex-1/2 flex items-center justify-baseline lg:justify-end"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={imageVariants}
          >
            <Image
              src="/about/section-3-img.png"
              alt="About Section Image"
              width={500}
              height={300}
              className="w-full lg:w-fit lg:h-[70vh] object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AboutSectionThree;
