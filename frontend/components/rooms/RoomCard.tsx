"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Mail, MapPin } from "lucide-react";
import { RoomData } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RoomCardProps {
  roomId: string;
  roomData: RoomData;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

export function RoomCard({ roomId, roomData, isExpanded, onToggleExpand }: RoomCardProps) {

  // Generate Google Maps embed URL
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(roomData.address + ', ' + roomData.location)}&zoom=15`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isExpanded ? 1.05 : 1,
        zIndex: isExpanded ? 50 : 1,
      }}
      whileHover={{
        scale: isExpanded ? 1.05 : 1.02,
        rotateY: isExpanded ? 0 : 2,
        rotateX: isExpanded ? 0 : 2,
        boxShadow: isExpanded ? "0 25px 50px rgba(0, 0, 0, 0.25)" : "0 20px 40px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 },
      }}
      style={{
        position: "relative",
        zIndex: isExpanded ? 50 : 1,
      }}
      className={`card p-6 perspective-1000 transition-all duration-300 relative group ${
        isExpanded 
          ? "bg-accent text-white shadow-2xl" 
          : "bg-white dark:bg-black dark:border-gray-800 hover:bg-gradient-to-br hover:from-white hover:via-accent/5 hover:to-accent/10 dark:hover:from-black dark:hover:via-accent/5 dark:hover:to-accent/10"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className={`heading-sm mb-1 ${isExpanded ? "text-white" : "dark:text-white"}`}>{roomData.location}</h3>
          <p className={`text-sm ${isExpanded ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>{roomData.address}</p>
        </div>
        <div className="text-right ml-4">
          <p className={`text-3xl font-bold ${isExpanded ? "text-white" : "text-accent"}`}>{formatCurrency(roomData.rent)}</p>
          <p className={`text-xs ${isExpanded ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>/month</p>
        </div>
      </div>

      {/* Room Details */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className={isExpanded ? "text-white/70" : "text-gray-500 dark:text-gray-400"}>Type:</span>{" "}
          <span className={`font-medium ${isExpanded ? "text-white" : "dark:text-white"}`}>{roomData.room_type}</span>
        </div>
        <div>
          <span className={isExpanded ? "text-white/70" : "text-gray-500 dark:text-gray-400"}>Bedrooms:</span>{" "}
          <span className={`font-medium ${isExpanded ? "text-white" : "dark:text-white"}`}>{roomData.num_bedrooms}</span>
        </div>
        <div>
          <span className={isExpanded ? "text-white/70" : "text-gray-500 dark:text-gray-400"}>Bathrooms:</span>{" "}
          <span className={`font-medium ${isExpanded ? "text-white" : "dark:text-white"}`}>{roomData.num_bathrooms}</span>
        </div>
        <div>
          <span className={isExpanded ? "text-white/70" : "text-gray-500 dark:text-gray-400"}>Flatmates:</span>{" "}
          <span className={`font-medium ${isExpanded ? "text-white" : "dark:text-white"}`}>{roomData.flatmate_gender}</span>
        </div>
      </div>

      {/* Lifestyle Chips */}
      <div className="mb-4">
        <p className={`text-xs swiss-heading mb-2 ${isExpanded ? "text-white" : "dark:text-gray-300"}`}>LIFESTYLE</p>
        <div className="flex flex-wrap gap-2">
          <span className={`pill ${isExpanded ? "bg-white/20 text-white border-white/30" : ""}`}>🍽️ {roomData.lifestyle_food}</span>
          <span className={`pill ${isExpanded ? "bg-white/20 text-white border-white/30" : ""}`}>🍺 {roomData.lifestyle_alcohol}</span>
          <span className={`pill ${isExpanded ? "bg-white/20 text-white border-white/30" : ""}`}>🚬 {roomData.lifestyle_smoke}</span>
        </div>
      </div>

      {/* Utilities & Amenities */}
      {roomData.utilities_included && roomData.utilities_included.length > 0 && (
        <div className="mb-4">
          <p className={`text-xs swiss-heading mb-2 ${isExpanded ? "text-white" : "dark:text-gray-300"}`}>UTILITIES INCLUDED</p>
          <div className="flex flex-wrap gap-1.5">
            {roomData.utilities_included.map((util) => (
              <span key={util} className={`pill text-xs ${isExpanded ? "bg-white/20 text-white border-white/30" : ""}`}>
                {util}
              </span>
            ))}
          </div>
        </div>
      )}

      {roomData.amenities && roomData.amenities.length > 0 && (
        <div className="mb-4">
          <p className={`text-xs swiss-heading mb-2 ${isExpanded ? "text-white" : "dark:text-gray-300"}`}>AMENITIES</p>
          <div className="flex flex-wrap gap-1.5">
            {roomData.amenities.slice(0, 5).map((amenity) => (
              <span key={amenity} className={`pill text-xs ${isExpanded ? "bg-white/20 text-white border-white/30" : ""}`}>
                {amenity}
              </span>
            ))}
            {roomData.amenities.length > 5 && (
              <span className={`pill text-xs ${isExpanded ? "bg-white/20 text-white border-white/30" : ""}`}>+{roomData.amenities.length - 5} more</span>
            )}
          </div>
        </div>
      )}

      {/* Description Preview */}
      {!isExpanded && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
          {roomData.description}
        </p>
      )}

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`mb-4 pb-4 ${isExpanded ? "border-white/30" : "border-gray-200 dark:border-gray-700"} border-b`}>
              <p className={`text-xs swiss-heading mb-2 ${isExpanded ? "text-white" : "dark:text-gray-300"}`}>FULL DESCRIPTION</p>
              <p className={`text-sm leading-relaxed ${isExpanded ? "text-white/90" : "text-gray-600 dark:text-gray-400"}`}>
                {roomData.description}
              </p>
            </div>

            {/* Contact Details */}
            <div className={`mb-4 pb-4 ${isExpanded ? "border-white/30" : "border-gray-200 dark:border-gray-700"} border-b`}>
              <p className={`text-xs swiss-heading mb-3 ${isExpanded ? "text-white" : "dark:text-gray-300"}`}>CONTACT INFORMATION</p>
              <div className="flex items-center gap-2 text-sm">
                <Mail className={`w-4 h-4 ${isExpanded ? "text-white" : "text-accent"}`} strokeWidth={1.5} />
                <a 
                  href={`mailto:${roomData.contact}`}
                  className={`font-medium transition-all ${isExpanded ? "text-white hover:text-white/80" : "text-accent hover:underline"}`}
                >
                  {roomData.contact}
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="mb-4">
              <p className={`text-xs swiss-heading mb-3 ${isExpanded ? "text-white" : "dark:text-gray-300"}`}>LOCATION</p>
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>
              <div className={`flex items-start gap-2 mt-2 text-xs ${isExpanded ? "text-white/80" : "text-gray-600 dark:text-gray-400"}`}>
                <MapPin className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isExpanded ? "text-white" : "dark:text-gray-400"}`} strokeWidth={1.5} />
                <span>{roomData.address}, {roomData.location}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer with Expand Button */}
      <div className={`flex items-center justify-between pt-4 ${isExpanded ? "border-white/30" : "border-gray-200 dark:border-gray-700"} border-t`}>
        <div className="text-sm">
          <span className={isExpanded ? "text-white/70" : "text-gray-500 dark:text-gray-400"}>Available from:</span>{" "}
          <span className={`font-medium ${isExpanded ? "text-white" : "dark:text-white"}`}>{formatDate(roomData.available_from)}</span>
        </div>
        <motion.button
          onClick={() => onToggleExpand(roomId)}
          className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 px-4 py-2 rounded-lg ${
            isExpanded 
              ? "bg-white text-accent hover:bg-white/90" 
              : "text-accent hover:bg-accent/10"
          }`}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? (
            <>
              Show Less
              <ChevronUp className="w-4 h-4" strokeWidth={2} />
            </>
          ) : (
            <>
              View Details
              <ChevronDown className="w-4 h-4" strokeWidth={2} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
