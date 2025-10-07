"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

function CharitySectionTwo() {
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

  // Paragraph animation
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

  // Image animations - different for each
  const imageTopVariants = {
    hidden: {
      opacity: 0,
      x: 80,
      y: -50,
      scale: 0.85,
      rotate: 10,
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

  const imageBottomVariants = {
    hidden: {
      opacity: 0,
      x: 60,
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

  // Right side container
  const rightContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section className="relative bg-[url('/about/about-sec-2-bg.jpg')] bg-no-repeat bg-cover md:px-10 xl:px-22 overflow-x-hidden">
      <div className="container">
        <div className="relative flex flex-col lg:flex-row items-center gap-8 xl:gap-[11.7%]">
          {/* Left side - Text content */}
          <motion.div
            className="flex-1/2 flex flex-col gap-8 px-4 lg:px-0 pt-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={leftContentVariants}
          >
            {/* Icon */}
            <motion.div variants={iconVariants}>
              <Image
                src="/icon-1.svg"
                alt="About Section Image"
                width={80}
                height={104}
                className="w-[90px] h-[90px] object-cover -ml-2"
              />
            </motion.div>

            {/* Heading */}
            <motion.h2
              className="text-text text-3xl lg:text-4xl relative"
              variants={headingVariants}
            >
              Fashion That Fights
              <span className="block relative lg:left-[35%]">for her</span>
            </motion.h2>

            {/* Paragraph */}
            <motion.div
              className="flex flex-col gap-3"
              variants={paragraphVariants}
            >
              <p>
                This isn't just fashion—it's a movement. antiromantic stands
                with women. We invest in <strong>global</strong> and{" "}
                <strong>local organizations</strong> that fight for{" "}
                <strong>
                  gender equity, support survivors, and amplify female voices.
                </strong>{" "}
                Behind our collections is a commitment to change. From rural
                artisans to urban entrepreneurs, our charity partnerships help
                women write new chapters of independence and success. Your
                purchase plays a part in her story. And that's something worth
                wearing.
              </p>
            </motion.div>
          </motion.div>

          {/* Right side - Images */}
          <motion.div
            className="flex-1/2 flex flex-col gap-4 self-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={rightContainerVariants}
          >
            <motion.div variants={imageTopVariants}>
              <Image
                src="/charity/sec-1-a.png"
                alt="About Section Image"
                width={500}
                height={300}
                className="w-auto h-[50vh] object-contain self-start"
              />
            </motion.div>
            <motion.div variants={imageBottomVariants}>
              <Image
                src="/charity/sec-1-b.png"
                alt="About Section Image"
                width={500}
                height={300}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CharitySectionTwo;
