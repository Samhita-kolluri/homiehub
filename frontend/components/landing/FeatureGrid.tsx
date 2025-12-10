"use client";

import { motion } from "framer-motion";
import { Bot, Target, GraduationCap, Lock, Scale, Cloud } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Matching",
    description: "Advanced algorithms analyze preferences, lifestyle, and compatibility.",
  },
  {
    icon: Target,
    title: "Preference-Aware",
    description: "Get recommendations based on your budget, location, and lifestyle needs.",
  },
  {
    icon: GraduationCap,
    title: "Student-Focused",
    description: "Built specifically for university students and young professionals.",
  },
  {
    icon: Lock,
    title: "Privacy-First",
    description: "Your data is protected with enterprise-grade security.",
  },
  {
    icon: Scale,
    title: "Fairness Checks",
    description: "Continuous monitoring ensures unbiased recommendations.",
  },
  {
    icon: Cloud,
    title: "Cloud-Native",
    description: "Powered by a robust 5-lane MLOps architecture on GCP.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ 
            scale: 1.05, 
            rotateY: 5,
            rotateX: 5,
            transition: { duration: 0.2 }
          }}
          className="card card-hover p-6 perspective-1000"
        >
          <div className="mb-4">
            <feature.icon className="w-10 h-10 text-accent" strokeWidth={1.5} />
          </div>
          <h3 className="heading-sm mb-2 dark:text-gray-200">{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
