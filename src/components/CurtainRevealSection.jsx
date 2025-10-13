"use client";

import { motion } from "framer-motion";

export default function CurtainRevealSection({ children }) {
  return (
    <motion.div
      initial={{
        scaleY: 0,
        opacity: 0,
      }}
      whileInView={{
        scaleY: 1,
        opacity: 1,
      }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        opacity: { duration: 0.5 },
      }}
      viewport={{ once: true, amount: 0.2 }}
      style={{ originY: 0 }}
    >
      {children}
    </motion.div>
  );
}
