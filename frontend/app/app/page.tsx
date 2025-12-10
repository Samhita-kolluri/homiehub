"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RoomCard } from "@/components/rooms/RoomCard";
import { PostAdModal } from "@/components/modals/PostAdModal";
import { FiltersModal } from "@/components/modals/FiltersModal";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { apiClient, isAuthenticated } from "@/lib/apiClient";
import type { RoomMatch } from "@/lib/types";
import { SpotlightPattern } from "@/components/effects/SpotlightPattern";

export default function AppPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPostAd, setShowPostAd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadRecommendations({});
  }, [router]);

  // Click outside to collapse expanded card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedCardId && cardsContainerRef.current) {
        const target = event.target as HTMLElement;
        // Check if click is outside the cards container or on the blurred area
        if (!cardsContainerRef.current.contains(target) || target.closest('.blur-sm')) {
          setExpandedCardId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedCardId]);

  const loadRecommendations = async (filters: any) => {
    setIsLoading(true);
    setError("");
    try {
      const response: any = await apiClient.getRecommendations(filters);
      setRooms(response.matches || []);
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") {
        // Token expired, redirect to login
        router.push("/login");
        return;
      }
      setError(err.message || "Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (view: string) => {
    if (view === "post-ad") {
      setShowPostAd(true);
    } else if (view === "filters") {
      setShowFilters(true);
    }
  };

  const handlePostAdSuccess = () => {
    setShowPostAd(false);
    loadRecommendations({});
  };

  const handleApplyFilters = (filters: any) => {
    setShowFilters(false);
    loadRecommendations(filters);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0f172a] relative overflow-hidden">
      <SpotlightPattern iconCount={800} />
      <Sidebar onNavigate={handleNavigation} />
      
      <div className="ml-64 p-8 pt-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-lg mb-2 dark:text-white">Your Recommendations</h1>
            <p className="text-gray-600 dark:text-gray-300">
              AI-curated roommate matches based on your preferences
            </p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card dark:bg-black dark:border-gray-800 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="card dark:bg-black dark:border-gray-800 p-8 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <motion.button
                onClick={() => loadRecommendations({})}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retry
              </motion.button>
            </div>
          ) : rooms.length === 0 ? (
            <div className="card dark:bg-black dark:border-gray-800 p-12 text-center">
              <div className="mb-4 flex justify-center">
                <Home className="w-16 h-16 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="heading-md mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters to see more listings
              </p>
              <motion.button
                onClick={() => setShowFilters(true)}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Adjust Filters
              </motion.button>
            </div>
          ) : (
            <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((match) => (
                <div
                  key={match.room_id}
                  className={`transition-all duration-300 ${
                    expandedCardId && expandedCardId !== match.room_id
                      ? "blur-sm opacity-60"
                      : ""
                  }`}
                >
                  <RoomCard
                    roomId={match.room_id}
                    roomData={match.room_data}
                    isExpanded={expandedCardId === match.room_id}
                    onToggleExpand={(id) => setExpandedCardId(expandedCardId === id ? null : id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPostAd && (
          <PostAdModal
            onClose={() => setShowPostAd(false)}
            onSuccess={handlePostAdSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilters && (
          <FiltersModal
            onClose={() => setShowFilters(false)}
            onApply={handleApplyFilters}
          />
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
