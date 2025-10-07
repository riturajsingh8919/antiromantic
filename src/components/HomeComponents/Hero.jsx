"use client";

import Image from "next/image";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Hero() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCTA, setShowCTA] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMouseEnter = () => {
    setShowCTA(true);
  };

  const handleMouseLeave = () => {
    setShowCTA(false);
  };

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };
  return (
    <section className="relative w-full lg:h-screen">
      <div className="container1">
        <div className="flex flex-col-reverse md:flex-row relative">
          <div className="md:w-[30%] bg-[url('/bg-img.png')] bg-no-repeat bg-covers flex items-end justify-end overflow-hidden">
            <Image
              src="/hero-left.png"
              alt="Hero Image"
              width={300}
              height={275}
              className="w-full md:w-[95%] h-auto object-cover relative bottom-0 -right-10"
            />
          </div>
          <div
            ref={containerRef}
            className="md:w-[70%] col-span-2 relative flex items-center justify-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            <video
              ref={videoRef}
              src="/hero.mov"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[80vh] lg:h-screen object-cover"
              style={{
                WebkitPlaysinline: true,
              }}
            >
              {/* Fallback for browsers that don't support the video */}
              <Image
                src="/hero-right.png"
                alt="Hero Image"
                width={700}
                height={475}
                className="w-full h-[80vh] lg:h-screen object-cover"
              />
            </video>

            {/* Play/Pause CTA */}
            <AnimatePresence>
              {showCTA && (
                <motion.button
                  onClick={togglePlayPause}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: mousePosition.x - 40, // Center button on cursor (40px = half button width)
                    y: mousePosition.y - 40, // Center button on cursor (40px = half button height)
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    opacity: { duration: 0.3, ease: "easeInOut" },
                    scale: { duration: 0.3, ease: "easeInOut" },
                    x: { duration: 0.1, ease: "easeOut" },
                    y: { duration: 0.1, ease: "easeOut" },
                  }}
                  className="absolute top-0 left-0 bg-[#e1dbcf] text-[#28251F] w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-bold text-base md:text-base shadow-lg hover:shadow-xl z-10 pointer-events-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    transform: `translate(${mousePosition.x - 40}px, ${
                      mousePosition.y - 40
                    }px)`,
                  }}
                >
                  {isPlaying ? "PAUSE" : "PLAY"}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
