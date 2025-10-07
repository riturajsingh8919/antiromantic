"use client";

import Image from "next/image";
import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import CurtainRevealSection from "@/components/CurtainRevealSection";

function HomeSectionTwo() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.2 });
  const [curtainOpened, setCurtainOpened] = useState(false);

  // Start content animations when curtain is halfway open for better UX
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setCurtainOpened(true);
        // Start video playback immediately when content animates
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {
              // Handle any playback errors silently
            });
          }
        }, 300); // Start video shortly after content begins animating
      }, 2500); // Start animations when curtain is halfway open (2.5s instead of 5s)

      return () => clearTimeout(timer);
    }
  }, [isInView]);
  return (
    <CurtainRevealSection curtainColor="bg-[#e1dbcf]">
      <section
        ref={sectionRef}
        className="relative bg-[url('/home-sec-2-bg.png')] bg-no-repeat bg-cover py-16 md:px-10"
      >
        <div className="container">
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4">
            <motion.div
              className="flex flex-col md:flex-row gap-2 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={
                curtainOpened ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: 0,
              }}
            >
              <motion.h2
                className="text-[#827C71] text-xl lg:text-3xl"
                initial={{ opacity: 0, x: -15 }}
                animate={
                  curtainOpened ? { opacity: 1, x: 0 } : { opacity: 0, x: -15 }
                }
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.05,
                }}
              >
                Where Every Stitch{" "}
              </motion.h2>
              <motion.div
                className="text-[#827C71] flex gap-2 items-center text-base"
                initial={{ opacity: 0, x: 15 }}
                animate={
                  curtainOpened ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }
                }
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.1,
                }}
              >
                <span>
                  Our thoughtfully crafted pieces
                  <br /> embrace both ease and elegance
                </span>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                  animate={
                    curtainOpened
                      ? { opacity: 1, scale: 1, rotate: 0 }
                      : { opacity: 0, scale: 0.9, rotate: -5 }
                  }
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                    delay: 0.15,
                  }}
                >
                  <Image
                    src="/home-sec-2-icon.svg"
                    alt="icon"
                    width={40}
                    height={36}
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex gap-4 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={
                curtainOpened ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: 0.15,
              }}
            >
              <motion.h2
                className="text-[#827C71] text-xl lg:text-3xl"
                initial={{ opacity: 0, x: -15 }}
                animate={
                  curtainOpened ? { opacity: 1, x: 0 } : { opacity: 0, x: -15 }
                }
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.2,
                }}
              >
                speaks
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={
                  curtainOpened
                    ? { opacity: 1, scale: 1, y: 0 }
                    : { opacity: 0, scale: 0.95, y: 15 }
                }
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.25,
                }}
              >
                <video
                  ref={videoRef}
                  src="/hero.mov"
                  loop
                  muted
                  playsInline
                  className="w-[200px] h-auto object-cover"
                  style={{
                    WebkitPlaysinline: true,
                  }}
                />
              </motion.div>

              <motion.h2
                className="text-[#827C71] text-xl lg:text-3xl"
                initial={{ opacity: 0, x: 15 }}
                animate={
                  curtainOpened ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }
                }
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.3,
                }}
              >
                self-love
              </motion.h2>
            </motion.div>
          </div>
        </div>
      </section>
    </CurtainRevealSection>
  );
}

export default HomeSectionTwo;
