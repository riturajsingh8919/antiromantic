"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function HomeSectionFour() {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const rightColumnRef = useRef(null);
  const imageRefs = useRef([]);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Define the images and corresponding left side images
  const leftImages = [
    {
      src: "/store/product1b.png",
      title: "exclusive",
      subtitle: "linen shirt",
    },
    {
      src: "/store/product2.png",
      title: "premium",
      subtitle: "cotton wear",
    },
    {
      src: "/store/product3.png",
      title: "elegant",
      subtitle: "casual style",
    },
  ];

  const rightImages = [
    "/home/product2.png",
    "/home/product3.png",
    "/home/product2.png",
  ];

  useEffect(() => {
    // Only enable scroll detection on desktop
    if (isMobile) return;

    const handleScroll = () => {
      const viewportCenter = window.innerHeight / 2;

      // Check which image is closest to the center of the viewport
      let closestIndex = 0;
      let closestDistance = Infinity;

      imageRefs.current.forEach((imageRef, index) => {
        if (imageRef) {
          const imageRect = imageRef.getBoundingClientRect();
          const imageCenter = imageRect.top + imageRect.height / 2;
          const distance = Math.abs(imageCenter - viewportCenter);

          // Only consider images that are at least partially visible
          if (imageRect.bottom > 0 && imageRect.top < window.innerHeight) {
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = index;
            }
          }
        }
      });

      if (closestIndex !== activeImageIndex) {
        console.log(`Changing to image ${closestIndex}`); // Debug log
        setActiveImageIndex(closestIndex);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Also trigger on resize
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [activeImageIndex, isMobile]);

  const setImageRef = (index) => (el) => {
    imageRefs.current[index] = el;
  };
  // Mobile version - simple vertical layout
  if (isMobile) {
    return (
      <section className="relative bg-[url('/bg-img.png')] bg-no-repeat bg-cover">
        <div className="container">
          <div className="flex flex-col">
            <p className="text-text text-base p-4 mb-8">
              Our thoughtfully crafted pieces embrace both ease and elegance,
              making self-care part of your everyday wear.
            </p>

            {/* Mobile: Show all images in sequence */}
            {leftImages.map((leftImg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                {/* Left image with title */}
                <div className="relative mb-6">
                  <Image
                    src={leftImg.src}
                    alt="image"
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                  <h2 className="text-[#817C73] text-base absolute top-[10%] left-[2%] font-black">
                    {leftImg.title}{" "}
                    <span className="ml-6 block">{leftImg.subtitle}</span>
                  </h2>
                </div>

                {/* Corresponding right image */}
                <div className="flex justify-center px-4">
                  <Image
                    src={rightImages[index]}
                    alt={`Product ${index + 1}`}
                    width={400}
                    height={400}
                    className="w-auto h-[40vh] object-cover"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Desktop version - sticky left column with scroll detection
  return (
    <section className="relative bg-[url('/bg-img.png')] bg-no-repeat bg-cover">
      <div className="container">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 lg:min-h-[200vh]">
          {/* Left Section - Sticky */}
          <div className="flex relative w-full h-max lg:sticky lg:top-0 lg:self-start md:items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                  y: { type: "spring", stiffness: 100, damping: 20 },
                }}
                className="w-full h-auto relative"
              >
                <Image
                  src={leftImages[activeImageIndex].src}
                  alt="image"
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover"
                />
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-[#817C73] text-xl md:text-2xl absolute top-[30%] md:top-[15%] left-[2%] md:left-[2%] font-black"
                >
                  {leftImages[activeImageIndex].title}{" "}
                  <span className="ml-8 block">
                    {leftImages[activeImageIndex].subtitle}
                  </span>
                </motion.h2>
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Right Section - Scrollable */}
          <div
            ref={rightColumnRef}
            className="p-4 md:p-10 lg:p-20 flex flex-col gap-8 lg:gap-14 lg:min-h-[300vh]"
          >
            <p className="text-text text-base md:max-w-[60%]">
              Our thoughtfully crafted pieces embrace both ease and elegance,
              making self-care part of your everyday wear.
            </p>

            {/* Add extra spacing at the top */}
            <div className="hidden lg:block h-[50vh]"></div>

            <div className="flex flex-col gap-8 lg:gap-[100vh] items-center w-full h-auto">
              {rightImages.map((imageSrc, index) => (
                <motion.div
                  key={index}
                  ref={setImageRef(index)}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative flex items-center justify-center min-h-[50vh]"
                >
                  <Image
                    src={imageSrc}
                    alt={`Product ${index + 1}`}
                    width={500}
                    height={500}
                    className="w-auto h-[50vh] object-cover"
                  />
                </motion.div>
              ))}
            </div>

            {/* Add extra spacing at the bottom */}
            <div className="hidden lg:block h-[50vh]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeSectionFour;
