"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function HomeSectionFive() {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/tablet devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track scroll progress of this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Subtle parallax
  const parallaxRange = isMobile ? 30 : 80;

  // Simple vertical parallax - alternating directions
  const y1 = useTransform(
    scrollYProgress,
    [0, 1],
    [-parallaxRange, parallaxRange]
  );
  const y2 = useTransform(
    scrollYProgress,
    [0, 1],
    [parallaxRange, -parallaxRange]
  );
  const y3 = useTransform(
    scrollYProgress,
    [0, 1],
    [-parallaxRange * 0.8, parallaxRange * 0.8]
  );
  const y4 = useTransform(
    scrollYProgress,
    [0, 1],
    [parallaxRange * 0.8, -parallaxRange * 0.8]
  );

  // Simple stagger animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-[url('/home-sec-3-bg.png')] bg-no-repeat bg-cover bg-center min-h-screen flex items-center py-16 overflow-hidden"
    >
      <div className="container">
        <motion.div
          className="relative grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 md:max-w-[95%] lg:max-w-[80%] mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Image 1 */}
          <motion.div
            className="flex items-center justify-center relative"
            variants={imageVariants}
            style={{ y: y1 }}
          >
            <Image
              src="/home/sec-5-1.png"
              alt="image"
              width={500}
              height={500}
              className="w-auto h-[30vh] lg:h-[45vh] object-cover"
            />
          </motion.div>

          {/* Image 2 */}
          <motion.div
            className="flex items-center justify-center relative top-[20%] md:top-[25%]"
            variants={imageVariants}
            style={{ y: y2 }}
          >
            <Image
              src="/home/sec-5-2.png"
              alt="image"
              width={500}
              height={500}
              className="w-auto h-[30vh] lg:h-[45vh] object-cover"
            />
          </motion.div>

          {/* Image 3 */}
          <motion.div
            className="flex items-center justify-center relative"
            variants={imageVariants}
            style={{ y: y3 }}
          >
            <Image
              src="/home/sec-5-3.png"
              alt="image"
              width={500}
              height={500}
              className="w-auto h-[30vh] lg:h-[45vh] object-cover"
            />
          </motion.div>

          {/* Image 4 */}
          <motion.div
            className="flex items-center justify-center relative top-[20%] md:top-[25%]"
            variants={imageVariants}
            style={{ y: y4 }}
          >
            <Image
              src="/home/sec-5-4.png"
              alt="image"
              width={500}
              height={500}
              className="w-auto h-[30vh] lg:h-[45vh] object-cover"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HomeSectionFive;
