"use client";

import Image from "next/image";
import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function HomeSectionTwo() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  // First div - opens from middle to TOP
  const curtainRevealTop = {
    initial: {
      opacity: 0,
      scaleY: 0,
    },
    animate: {
      opacity: 1,
      scaleY: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2,
      },
    },
  };

  // Second div - opens from middle to BOTTOM
  const curtainRevealBottom = {
    initial: {
      opacity: 0,
      scaleY: 0,
    },
    animate: {
      opacity: 1,
      scaleY: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.5,
      },
    },
  };

  // Video reveal
  const videoReveal = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.7,
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-[url('/home-sec-2-bg.png')] bg-no-repeat bg-cover py-16 md:px-10"
    >
      <div className="container">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4">
          {/* First div - opens to TOP */}
          <motion.div
            className="flex flex-col md:flex-row gap-2 md:gap-4"
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={curtainRevealTop}
            style={{ transformOrigin: "center bottom" }}
          >
            <h2 className="text-[#827C71] text-xl lg:text-3xl">
              Where Every Stitch{" "}
            </h2>
            <p className="text-[#827C71] flex gap-2 items-center text-base">
              <span>
                Our thoughtfully crafted pieces
                <br />
                embrace both ease and elegance
              </span>
              <Image
                src="/home-sec-2-icon.svg"
                alt="icon"
                width={40}
                height={36}
              />
            </p>
          </motion.div>

          {/* Second div - opens to BOTTOM */}
          <motion.div
            className="flex gap-4 items-center"
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={curtainRevealBottom}
            style={{ transformOrigin: "center top" }}
          >
            <h2 className="text-[#827C71] text-xl lg:text-3xl">speaks</h2>
            <motion.div
              initial="initial"
              animate={isInView ? "animate" : "initial"}
              variants={videoReveal}
            >
              <video
                src="/home2.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-[180px] h-auto object-cover"
                style={{
                  WebkitPlaysinline: true,
                }}
              />
            </motion.div>
            <h2 className="text-[#827C71] text-xl lg:text-3xl">self-love</h2>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HomeSectionTwo;
