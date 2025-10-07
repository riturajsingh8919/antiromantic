"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

function CharitySectionThree() {
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
      x: 50,
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

  // Image animation from left
  const imageVariants = {
    hidden: {
      opacity: 0,
      x: -100,
      scale: 0.9,
      rotateY: -20,
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

  // Right content stagger
  const rightContentVariants = {
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
    <section className="relative bg-[url('/charity/sec-2-bg.png')] bg-no-repeat bg-cover md:px-10 xl:px-22 overflow-x-hidden py-16 -mt-1">
      <div className="container">
        <div className="relative flex flex-col-reverse lg:flex-row lg:items-center gap-8 xl:gap-[19%]">
          {/* Left side - Image */}
          <motion.div
            className="flex-1/2 flex items-center justify-baseline lg:justify-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={imageVariants}
          >
            <Image
              src="/charity/sec-2-img.png"
              alt="About Section Image"
              width={500}
              height={300}
              className="w-full lg:w-fit lg:h-[70vh] object-contain"
            />
          </motion.div>

          {/* Right side - Text content */}
          <motion.div
            className="flex-1/2 flex flex-col gap-8 px-4 lg:px-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={rightContentVariants}
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
              Every stitch we sell{" "}
              <span className="block relative left-[30%]">
                carries strength
              </span>
            </motion.h2>

            {/* Paragraphs - line by line */}
            <motion.div
              className="flex flex-col gap-3"
              variants={paragraphContainerVariants}
            >
              <motion.p variants={paragraphVariants}>
                At antiromantic, we believe true luxury uplifts more than just
                style—it uplifts lives. That's why a portion of every purchase
                supports <strong>women-led charities</strong> and{" "}
                <strong>initiatives around the world.</strong>
              </motion.p>
              <motion.p variants={paragraphVariants}>
                We partner with trusted organizations to ensure transparency and
                real impact. When you choose antiromantic, you're not just
                wearing fashion— <strong>you're wearing purpose.</strong>
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CharitySectionThree;
