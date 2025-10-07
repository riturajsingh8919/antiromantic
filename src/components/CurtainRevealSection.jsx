"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function CurtainRevealSection({
  children,
  curtainColor = "bg-[#e1dbcf]",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.2 });

  return (
    <div ref={ref} className="relative overflow-hidden">
      {/* The actual section content */}
      {children}

      {/* Top curtain panel */}
      <motion.div
        className={`absolute inset-x-0 top-0 h-1/2 ${curtainColor} z-50`}
        animate={{
          translateY: isInView ? "-100%" : "0%",
        }}
        transition={{
          duration: 5,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />

      {/* Bottom curtain panel */}
      <motion.div
        className={`absolute inset-x-0 bottom-0 h-1/2 ${curtainColor} z-50`}
        animate={{
          translateY: isInView ? "100%" : "0%",
        }}
        transition={{
          duration: 5,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />
    </div>
  );
}
