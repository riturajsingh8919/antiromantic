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
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  // Simple fade animation for images
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

  return (
    <section className="relative bg-[url('/about/about-sec-2-bg.jpg')] bg-no-repeat bg-cover overflow-x-hidden">
      <div className="relative flex flex-col md:flex-row gap-5 md:gap-0 items-center">
        {/* Left side - Images */}
        <motion.div
          className="w-full md:w-[45%] flex flex-col gap-4 self-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div variants={imageFadeVariants} className="self-end">
            <Image
              src="/about/about-sec-2a.png"
              alt="About Section Image"
              width={500}
              height={300}
              className="w-auto h-[35vh] object-contain self-end"
            />
          </motion.div>
          <motion.div variants={imageFadeVariants}>
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
          className="md:w-[55%]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="flex flex-col gap-8 px-4 md:px-0 md:max-w-[60%] mx-auto py-16 md:py-0">
            {/* Icon */}
            <motion.div variants={textFadeVariants}>
              <Image
                src="/about/about-sec-2-icon.svg"
                alt="About Section Image"
                width={80}
                height={104}
                className="w-fit h-[80px] object-cover"
              />
            </motion.div>

            {/* Heading */}
            <motion.h2
              className="text-text text-2xl lg:text-3xl relative"
              variants={textFadeVariants}
            >
              A LITTLE ROMANCE FOR YOU,
              <span className="block relative lg:left-[53%]">from you</span>
            </motion.h2>

            {/* Paragraphs */}
            <motion.div className="flex flex-col gap-3">
              <motion.p variants={textFadeVariants}>
                Antiromantic is about the kind of love that starts from within.
                It's in the way you wear your favourite things, the ease of
                being yourself, and the little details that make all the
                difference in your everyday life. That's why it's time to
                rethink what love looks like. For us, it starts with{" "}
                <strong>you</strong>.
              </motion.p>
              <motion.p variants={textFadeVariants}>
                Designed for slow mornings to late nights, work to weekends -
                Antiromantic moves with you. What you wear should feel as good
                as it looks. After all, clothing is self-care too
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSectionTwo;
