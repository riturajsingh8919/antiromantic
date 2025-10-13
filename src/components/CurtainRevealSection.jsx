"use client";

import { motion } from "framer-motion";

export default function CurtainRevealSection({
  children,
  curtainColor = "bg-[#e7e1d5]",
}) {
  return (
    <div className="relative overflow-hidden">
      {/* The actual section content */}
      {children}

      {/* Top curtain panel */}
      <motion.div
        className={`absolute inset-x-0 top-0 h-1/2 ${curtainColor} z-50 origin-bottom`}
        initial={{ translateY: "0%" }}
        whileInView={{ translateY: "-100%" }}
        transition={{
          duration: 2,
          ease: [0.42, 0, 0.58, 1],
        }}
        viewport={{ once: true, amount: 0.3 }}
      />

      {/* Bottom curtain panel */}
      <motion.div
        className={`absolute inset-x-0 bottom-0 h-1/2 ${curtainColor} z-50 origin-top`}
        initial={{ translateY: "0%" }}
        whileInView={{ translateY: "100%" }}
        transition={{
          duration: 2,
          ease: [0.42, 0, 0.58, 1],
        }}
        viewport={{ once: true, amount: 0.3 }}
      />
    </div>
  );
}
