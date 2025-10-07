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

  // Reduced parallax for mobile, full parallax for desktop
  const parallaxRange = isMobile ? 20 : 60;

  // Centered parallax - starts and ends symmetrically around 0
  const y1 = useTransform(
    scrollYProgress,
    [0, 1],
    [-parallaxRange, parallaxRange]
  );
  const y2 = useTransform(
    scrollYProgress,
    [0, 1],
    [parallaxRange * 0.8, -parallaxRange * 0.8]
  );
  const y3 = useTransform(
    scrollYProgress,
    [0, 1],
    [-parallaxRange * 1.2, parallaxRange * 1.2]
  );
  const y4 = useTransform(
    scrollYProgress,
    [0, 1],
    [parallaxRange, -parallaxRange]
  );

  // Advanced stagger animation with 3D effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      y: 80,
      scale: 0.85,
      rotateX: 25,
      rotateY: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      transition: {
        duration: 1,
        ease: [0.22, 0.61, 0.36, 1],
      },
    },
  };

  // Hover effect for desktop
  const hoverEffect = {
    scale: 1.08,
    rotateY: 5,
    rotateX: -5,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-[url('/home-sec-3-bg.png')] bg-no-repeat bg-cover bg-center h-screen md:h-[60vh] lg:h-screen flex items-center py-16 lg:py-0 overflow-hidden"
    >
      <div className="container">
        <motion.div
          className="relative grid grid-cols-2 md:grid-cols-4 gap-10 lg:max-w-[60%] mx-auto"
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
            whileHover={!isMobile ? hoverEffect : {}}
          >
            <Image
              src="/home/sec-5-1.png"
              alt="image"
              width={500}
              height={500}
              className="w-auto lg:h-[50vh] object-cover"
            />
          </motion.div>

          {/* Image 2 */}
          <motion.div
            className="flex items-center justify-center relative -top-[25%] md:top-[25%]"
            variants={imageVariants}
            style={{ y: y2 }}
            whileHover={!isMobile ? hoverEffect : {}}
          >
            <Image
              src="/home/sec-5-2.png"
              alt="image"
              width={500}
              height={500}
              className="w-auto lg:h-[50vh] object-cover"
            />
          </motion.div>

          {/* Image 3 */}
          <motion.div
            className="flex items-center justify-center relative"
            variants={imageVariants}
            style={{ y: y3 }}
            whileHover={!isMobile ? hoverEffect : {}}
          >
            <Image
              src="/home/sec-5-3.png"
              alt="image"
              width={500}
              height={500}
              className="w-auto lg:h-[50vh] object-cover"
            />
          </motion.div>

          {/* Image 4 */}
          <motion.div
            className="flex items-center justify-center relative -top-[25%] md:top-[25%]"
            variants={imageVariants}
            style={{ y: y4 }}
            whileHover={!isMobile ? hoverEffect : {}}
          >
            <Image
              src="/home/sec-5-4.png"
              alt="image"
              width={500}
              height={500}
              className="w-auto lg:h-[50vh] object-cover"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HomeSectionFive;
