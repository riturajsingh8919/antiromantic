"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

function AboutSectionFour() {
  // Central icon - continuous pulse effect
  const iconVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      rotate: -180,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    pulse: {
      scale: [1, 1.15, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Radial burst animation - from center outward
  const radialVariants = (delay) => ({
    hidden: {
      opacity: 0,
      scale: 0,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1,
        ease: [0.34, 1.56, 0.64, 1],
        delay: delay,
      },
    },
  });

  // Glow effect
  const glowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.3, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative md:px-10 bg-[url('/about/about-sec-4-bg.png')] bg-cover bg-center bg-no-repeat text-white flex items-center justify-center py-16 min-h-[60vh]">
      <div className="container">
        <div className="flex items-center justify-center">
          <motion.div
            className="relative flex items-center justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            {/* Glow effect behind icon */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-white/20 blur-xl -z-10"
              variants={glowVariants}
            />

            {/* Central Icon */}
            <motion.div variants={iconVariants} animate="pulse">
              <Image
                src="/about/about-sec-4-icon.svg"
                alt="About Section 4 Image"
                width={100}
                height={75}
                className="w-[75px] h-auto object-contain z-10"
              />
            </motion.div>

            {/* Top text - intentional */}
            <motion.h3
              className="text-2xl absolute -top-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
              variants={radialVariants(0.3)}
            >
              intentional
            </motion.h3>

            {/* Left text - warm */}
            <motion.h3
              className="text-2xl absolute top-1/2 -left-30 transform -translate-y-1/2 -rotate-90 whitespace-nowrap"
              variants={radialVariants(0.5)}
            >
              warm
            </motion.h3>

            {/* Right text - personal */}
            <motion.h3
              className="text-2xl absolute top-1/2 -right-30 transform -translate-y-1/2 rotate-90 whitespace-nowrap"
              variants={radialVariants(0.7)}
            >
              personal
            </motion.h3>

            {/* Bottom text - thoughtfully simple */}
            <motion.h3
              className="text-2xl absolute -bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
              variants={radialVariants(0.9)}
            >
              thoughtfully simple
            </motion.h3>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AboutSectionFour;
