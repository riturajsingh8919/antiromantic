"use client";

import Image from "next/image";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

function HomeSectionTwo() {
  const sectionRef = useRef(null);

  // Animation triggers as soon as section enters viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.9", "start 0.3"],
  });

  // Add spring physics for smooth animation
  const springConfig = { stiffness: 150, damping: 25, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  // Video curtain effect - reveals from bottom to top
  const curtainScaleY = useTransform(smoothProgress, [0, 1], [1, 0]);

  // Premium text animations
  const textOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);
  const textBlur = useTransform(smoothProgress, [0, 1], [20, 0]);
  const textY = useTransform(smoothProgress, [0, 1], [30, 0]);
  const textScale = useTransform(smoothProgress, [0, 1], [0.95, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[url('/home-sec-2-bg.png')] bg-no-repeat bg-cover py-16 md:px-10"
    >
      <div className="container">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4">
          {/* First row */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <motion.h2
              className="text-[#827C71] text-xl lg:text-3xl"
              style={{
                opacity: textOpacity,
                filter: `blur(${textBlur}px)`,
                y: textY,
                scale: textScale,
              }}
            >
              Where Every Stitch{" "}
            </motion.h2>

            <motion.p
              className="text-[#827C71] flex gap-2 items-center text-base"
              style={{
                opacity: textOpacity,
                filter: `blur(${textBlur}px)`,
                y: textY,
                scale: textScale,
              }}
            >
              <span>
                Our thoughtfully crafted pieces
                <br /> embrace both ease and elegance
              </span>
              <Image
                src="/home-sec-2-icon.svg"
                alt="icon"
                width={40}
                height={36}
              />
            </motion.p>
          </div>

          {/* Second row */}
          <div className="flex gap-4 items-center">
            <motion.h2
              className="text-[#827C71] text-xl lg:text-3xl"
              style={{
                opacity: textOpacity,
                filter: `blur(${textBlur}px)`,
                y: textY,
                scale: textScale,
              }}
            >
              speaks
            </motion.h2>

            {/* Video with curtain overlay - reveals from bottom */}
            <div className="relative overflow-hidden">
              <video
                src="/hero.mov"
                autoPlay
                loop
                muted
                playsInline
                className="w-[200px] h-auto object-cover"
                style={{ WebkitPlaysinline: true }}
              />
              <motion.div
                className="absolute inset-0 bg-[url('/home-sec-2-bg.png')] bg-cover bg-center"
                style={{
                  scaleY: curtainScaleY,
                  transformOrigin: "bottom", // Reveals from bottom
                }}
              />
            </div>

            <motion.h2
              className="text-[#827C71] text-xl lg:text-3xl"
              style={{
                opacity: textOpacity,
                filter: `blur(${textBlur}px)`,
                y: textY,
                scale: textScale,
              }}
            >
              self-love
            </motion.h2>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeSectionTwo;
