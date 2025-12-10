"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Home } from "lucide-react";

const features = [
  "Semantic embeddings",
  "LLM roommate scoring",
  "Preference-aware filters",
  "Drift detection & fairness checks",
];

export function ScrollingInfographic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={containerRef} className="relative h-[800px] overflow-hidden w-full">
      <div className="sticky top-1/2 -translate-y-1/2 flex items-center justify-center">
        <motion.div
          style={{
            scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]),
            opacity: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]),
          }}
          className="relative w-64 h-80 bg-gradient-to-br from-accent/20 to-accent/5 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <Home className="w-16 h-16 text-accent" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Your perfect match</p>
            </div>
          </div>
        </motion.div>

        {features.map((feature, i) => {
          const angle = (i / features.length) * 2 * Math.PI;
          const radius = 200;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          // Calculate horizontal expansion distance - use viewport width
          const expandX = x > 0 ? 1200 : -1200; // Expand far beyond screen edges
          const expandY = y * 2; // Slight vertical spread

          return (
            <motion.div
              key={feature}
              style={{
                x: useTransform(scrollYProgress, [0, 0.25, 0.45, 0.65, 0.85, 1], [0, x * 0.3, x, expandX * 0.5, expandX, expandX * 1.5]),
                y: useTransform(scrollYProgress, [0, 0.25, 0.45, 0.65, 0.85, 1], [0, y * 0.3, y, expandY * 0.5, expandY, expandY]),
                scale: useTransform(scrollYProgress, [0, 0.25, 0.45, 0.65, 0.85, 1], [0.3, 0.8, 1, 1.8, 2.5, 3]),
                opacity: useTransform(scrollYProgress, [0, 0.2, 0.45, 0.75, 0.9, 1], [0, 1, 1, 1, 0.3, 0]),
              }}
              className="absolute text-sm font-medium whitespace-nowrap shadow-2xl backdrop-blur-sm px-3 py-1.5 rounded-full bg-accent/10 text-accent dark:bg-gray-800 dark:text-gray-200 dark:border dark:border-gray-700"
            >
              {feature}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
