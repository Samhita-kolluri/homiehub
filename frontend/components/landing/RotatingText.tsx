"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const phrases = [
  "Find roommates who respect quiet hours.",
  "Find roommates who wake up when you do.",
  "Find roommates who share your budget ceiling.",
  "Find roommates who match your lifestyle.",
  "Find roommates your future self will thank you for.",
];

export function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-24 md:h-20 flex items-center justify-center md:justify-start">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -20, rotateX: 90 }}
          transition={{ duration: 0.5 }}
          className="text-xl md:text-2xl text-gray-700 font-medium"
        >
          {phrases[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
