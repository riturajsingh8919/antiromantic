"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

function HomeSectionSix() {
  // Container for staggering items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.2,
      },
    },
  };

  // Icon animation - bouncy spring with rotation
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
        type: "spring",
        bounce: 0.6,
        duration: 1.2,
      },
    },
  };

  // Text animation - smooth slide and fade
  const textVariants = {
    hidden: {
      opacity: 0,
      x: -30,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // Background image subtle fade
  const bgImageVariants = {
    hidden: {
      opacity: 0,
      scale: 1.1,
    },
    visible: {
      opacity: 0.7,
      scale: 1,
      transition: {
        duration: 1.5,
        ease: "easeOut",
      },
    },
  };

  // Item container for combined icon + text
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Hover effect for each item
  const hoverEffect = {
    scale: 1.05,
    transition: {
      type: "spring",
      bounce: 0.5,
      duration: 0.6,
    },
  };

  return (
    <section className="relative bg-[url('/home-sec-2-bg.png')] bg-no-repeat bg-cover px-4 md:px-10 py-16">
      <div className="container">
        <motion.div
          className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:max-w-[90%] mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {/* Item 1 */}
          <motion.div
            className="flex gap-3 items-center"
            variants={itemVariants}
            whileHover={hoverEffect}
          >
            <motion.div variants={iconVariants}>
              <Image
                src="/home/sec-six-icon.svg"
                alt="Background Image"
                width={40}
                height={40}
                className="w-[40px] h-[40px] object-contain -top-1 relative"
              />
            </motion.div>
            <motion.h2
              className="text-[#817C73] text-xl xl:text-3xl"
              variants={textVariants}
            >
              Unfiltered.{" "}
              <span className="block ml-12">Unapologetically You</span>
            </motion.h2>
          </motion.div>

          {/* Item 2 */}
          <motion.div
            className="flex gap-3 items-center"
            variants={itemVariants}
            whileHover={hoverEffect}
          >
            <motion.div variants={iconVariants}>
              <Image
                src="/home/sec-six-icon.svg"
                alt="Background Image"
                width={40}
                height={40}
                className="w-[40px] h-[40px] object-contain -top-1 relative"
              />
            </motion.div>
            <motion.h2
              className="text-[#817C73] text-xl xl:text-3xl"
              variants={textVariants}
            >
              Unfiltered.{" "}
              <span className="block ml-12">Unapologetically You</span>
            </motion.h2>
          </motion.div>

          {/* Item 3 */}
          <motion.div
            className="flex gap-3 items-center"
            variants={itemVariants}
            whileHover={hoverEffect}
          >
            <motion.div variants={iconVariants}>
              <Image
                src="/home/sec-six-icon.svg"
                alt="Background Image"
                width={40}
                height={40}
                className="w-[40px] h-[40px] object-contain -top-1 relative"
              />
            </motion.div>
            <motion.h2
              className="text-[#817C73] text-xl xl:text-3xl"
              variants={textVariants}
            >
              Unfiltered.{" "}
              <span className="block ml-12">Unapologetically You</span>
            </motion.h2>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Image with smooth fade */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={bgImageVariants}
      >
        <Image
          src="/home/sec-six-bg-icon.png"
          alt="Background Image"
          width={300}
          height={300}
          className="absolute left-[13%] z-0 w-fit h-full top-0 object-contain opacity-70"
        />
      </motion.div>
    </section>
  );
}

export default HomeSectionSix;
