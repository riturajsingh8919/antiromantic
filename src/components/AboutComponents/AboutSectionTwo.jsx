"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

function AboutSectionTwo() {
  // Container for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  // Image animations - different for each
  const imageLeftTopVariants = {
    hidden: {
      opacity: 0,
      x: -80,
      y: -50,
      scale: 0.85,
      rotate: -10,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const imageLeftBottomVariants = {
    hidden: {
      opacity: 0,
      x: -60,
      y: 80,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2,
      },
    },
  };

  // Icon animation - bouncy entrance
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
        bounce: 0.5,
        duration: 1,
      },
    },
  };

  // Text line animations
  const textLineVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // Right side content stagger
  const rightContentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <section className="relative bg-[url('/about/about-sec-2-bg.jpg')] bg-no-repeat bg-cover md:px-10 xl:px-22 overflow-x-hidden">
      <div className="container">
        <div className="relative flex flex-col lg:flex-row items-center gap-8 xl:gap-[12%]">
          {/* Left side - Images */}
          <motion.div
            className="flex-1/2 flex flex-col gap-4 self-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.div variants={imageLeftTopVariants}>
              <Image
                src="/about/about-sec-2a.png"
                alt="About Section Image"
                width={500}
                height={300}
                className="w-auto h-[50vh] object-contain self-end"
              />
            </motion.div>
            <motion.div variants={imageLeftBottomVariants}>
              <Image
                src="/about/about-sec-2b.png"
                alt="About Section Image"
                width={500}
                height={300}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Right side - Text content */}
          <motion.div
            className="flex-1/2 flex flex-col gap-8 px-4 lg:px-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={rightContentVariants}
          >
            {/* Icon */}
            <motion.div variants={iconVariants}>
              <Image
                src="/about/about-sec-2-icon.svg"
                alt="About Section Image"
                width={80}
                height={104}
                className="w-fit h-[80px] object-cover"
              />
            </motion.div>

            {/* Heading - animate each line */}
            <motion.h2
              className="text-text text-3xl lg:text-4xl relative"
              variants={textLineVariants}
            >
              A LITTLE ROMANCE FOR YOU,
              <motion.span
                className="block relative lg:left-[53%]"
                variants={textLineVariants}
              >
                from you
              </motion.span>
            </motion.h2>

            {/* Paragraphs - line by line */}
            <motion.div
              className="flex flex-col gap-3"
              variants={containerVariants}
            >
              <motion.p variants={textLineVariants}>
                Antiromantic is about the kind of love that starts from within.
                It's in the way you wear your favourite things, the ease of
                being yourself, and the little details that make all the
                difference in your everyday life. That's why it's time to
                rethink what love looks like. For us, it starts with{" "}
                <strong>you</strong>.
              </motion.p>
              <motion.p variants={textLineVariants}>
                Designed for slow mornings to late nights, work to weekends -
                Antiromantic moves with you. What you wear should feel as good
                as it looks. After all, clothing is self-care too
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AboutSectionTwo;
