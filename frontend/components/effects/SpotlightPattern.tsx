"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, Users, Home, Star, Zap, Coffee, Music, Book, Gamepad2, Dumbbell, Palette, Wifi, Utensils, TrendingUp, Shield, Clock, MapPin, MessageCircle, Key, DollarSign, Award, Target, Flame, Cloud, Moon, Sun, Camera, Headphones, Laptop, Phone, Mail, Gift } from "lucide-react";

interface SpotlightPatternProps {
  iconCount?: number;
  showIcons?: boolean;
}

export function SpotlightPattern({ iconCount = 800, showIcons = true }: SpotlightPatternProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [patternIcons, setPatternIcons] = useState<Array<{Icon: any, x: string, y: string, rotation: number}>>([]);

  useEffect(() => {
    let rafId: number;
    let lastUpdate = 0;
    const throttleDelay = 50; // Update every 50ms for smoother performance

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate < throttleDelay) return;
      
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        lastUpdate = now;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!showIcons) {
      setPatternIcons([]);
      return;
    }

    const icons = [Sparkles, Heart, Users, Home, Star, Zap, Coffee, Music, Book, Gamepad2, 
                   Dumbbell, Palette, Wifi, Utensils, TrendingUp, Shield, Clock, MapPin, 
                   MessageCircle, Key, DollarSign, Award, Target, Flame, Cloud, Moon, Sun, 
                   Camera, Headphones, Laptop, Phone, Mail, Gift];
    
    const positions = [];
    for (let i = 0; i < iconCount; i++) {
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const rotation = Math.random() * 360 - 180;
      
      positions.push({
        Icon: randomIcon,
        x: `${x}%`,
        y: `${y}%`,
        rotation: rotation,
      });
    }
    setPatternIcons(positions);
  }, [iconCount, showIcons]);

  return (
    <>
      {/* Mouse Spotlight Effect */}
      <motion.div
        className="absolute pointer-events-none z-0"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          width: "500px",
          height: "500px",
          marginLeft: "-250px",
          marginTop: "-250px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full h-full rounded-full bg-gradient-radial from-accent/30 via-accent/10 to-transparent blur-3xl" />
      </motion.div>

      {/* Pattern Icons */}
      {patternIcons.length > 0 && patternIcons.map(({ Icon, x, y, rotation }, index) => {
        const iconX = typeof window !== 'undefined' ? (parseFloat(x) / 100) * window.innerWidth : 0;
        const iconY = typeof window !== 'undefined' ? (parseFloat(y) / 100) * window.innerHeight : 0;
        const distance = Math.sqrt(
          Math.pow(mousePosition.x - iconX, 2) + Math.pow(mousePosition.y - iconY, 2)
        );
        const isRevealed = distance < 250;
        
        return (
          <div
            key={index}
            className="absolute pointer-events-none z-0 transition-all duration-300"
            style={{
              left: x,
              top: y,
              transform: `rotate(${rotation}deg) scale(${isRevealed ? 1.1 : 1})`,
              opacity: isRevealed ? 0.6 : 0.08,
            }}
          >
            <Icon className="w-4 h-4 text-accent" strokeWidth={1} />
          </div>
        );
      })}
    </>
  );
}
