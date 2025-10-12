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
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  // Simple fade animation for items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Background image subtle fade
  const bgImageVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 0.7,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative bg-[url('/home-sec-2-bg.png')] bg-no-repeat bg-cover px-4 md:px-10 py-16">
      <div className="container">
        <motion.div
          className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 lg:max-w-[90%] mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {/* Item 1 */}
          <motion.div
            className="flex gap-3 items-center"
            variants={itemVariants}
          >
            <Image
              src="/home/sec-six-icon.svg"
              alt="Background Image"
              width={40}
              height={40}
              className="w-[40px] h-[40px] object-contain -top-1 relative"
            />
            <h2 className="text-[#817C73] text-lg xl:text-3xl">
              Unfiltered.{" "}
              <span className="block ml-12">Unapologetically You</span>
            </h2>
          </motion.div>

          {/* Item 2 */}
          <motion.div
            className="flex gap-3 items-center"
            variants={itemVariants}
          >
            <Image
              src="/home/sec-six-icon.svg"
              alt="Background Image"
              width={40}
              height={40}
              className="w-[40px] h-[40px] object-contain -top-1 relative"
            />
            <h2 className="text-[#817C73] text-lg xl:text-3xl">
              Unfiltered.{" "}
              <span className="block ml-12">Unapologetically You</span>
            </h2>
          </motion.div>

          {/* Item 3 */}
          <motion.div
            className="flex gap-3 items-center"
            variants={itemVariants}
          >
            <Image
              src="/home/sec-six-icon.svg"
              alt="Background Image"
              width={40}
              height={40}
              className="w-[40px] h-[40px] object-contain -top-1 relative"
            />
            <h2 className="text-[#817C73] text-lg xl:text-3xl">
              Unfiltered.{" "}
              <span className="block ml-12">Unapologetically You</span>
            </h2>
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
