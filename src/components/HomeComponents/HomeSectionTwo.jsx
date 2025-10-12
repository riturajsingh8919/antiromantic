"use client";

import Image from "next/image";
import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function HomeSectionTwo() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  // Fade in with stagger delays
  const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: delay,
      },
    },
  });

  // Video zoom in
  const zoomIn = {
    initial: { scale: 0.5, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.5,
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
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <motion.h2
              className="text-[#827C71] text-xl lg:text-3xl"
              initial="initial"
              animate={isInView ? "animate" : "initial"}
              variants={fadeIn(0)}
            >
              Where Every Stitch{" "}
            </motion.h2>
            <motion.p
              className="text-[#827C71] flex gap-2 items-center text-base"
              initial="initial"
              animate={isInView ? "animate" : "initial"}
              variants={fadeIn(0.2)}
            >
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
            </motion.p>
          </div>
          <div className="flex gap-4 items-center">
            <motion.h2
              className="text-[#827C71] text-xl lg:text-3xl"
              initial="initial"
              animate={isInView ? "animate" : "initial"}
              variants={fadeIn(0.4)}
            >
              speaks
            </motion.h2>
            <motion.div
              initial="initial"
              animate={isInView ? "animate" : "initial"}
              variants={zoomIn}
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
            <motion.h2
              className="text-[#827C71] text-xl lg:text-3xl"
              initial="initial"
              animate={isInView ? "animate" : "initial"}
              variants={fadeIn(0.6)}
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
