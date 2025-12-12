"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Filter, Sparkles, X, RotateCw } from "lucide-react";
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
  const [myRooms, setMyRooms] = useState<RoomMatch[]>([]);
  const [isMyRoomsLoading, setIsMyRoomsLoading] = useState(false);
  const [myRoomsError, setMyRoomsError] = useState("");
  const [showPostAd, setShowPostAd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [activeView, setActiveView] = useState<"recommendations" | "my-listings">("recommendations");
  const [recommendationHeadingMode, setRecommendationHeadingMode] = useState<
    "default" | "filters" | "chat"
  >("default");
  const [sortMode, setSortMode] = useState<"relevance" | "time">("relevance");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isDeletingRoomId, setIsDeletingRoomId] = useState<string | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadRecommendations({});
  }, [router]);

  // Refresh recommendations when preferences are updated elsewhere (e.g., profile dialog)
  useEffect(() => {
    const handlePreferencesUpdated = () => {
      if (!isAuthenticated()) return;
      loadRecommendations(currentFilters || {});
    };

    if (typeof window !== "undefined") {
      window.addEventListener("homiehub:preferences-updated", handlePreferencesUpdated);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("homiehub:preferences-updated", handlePreferencesUpdated);
      }
    };
  }, [currentFilters]);

  // Update recommendations when chat agent returns matches
  useEffect(() => {
    const handleChatMatches = (event: any) => {
      const matches = Array.isArray(event?.detail?.matches)
        ? event.detail.matches
        : [];

      setActiveView("recommendations");
      setRecommendationHeadingMode("chat");
      setRooms(applySort(matches, sortMode));
      setError("");
      setIsLoading(false);
      setExpandedCardId(null);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("homiehub:chat-matches", handleChatMatches);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("homiehub:chat-matches", handleChatMatches);
      }
    };
  }, [sortMode]);

  // Click outside to collapse expanded card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!expandedCardId) return;

      const target = event.target as HTMLElement;
      const expandedCard = document.querySelector(
        `[data-room-id="${expandedCardId}"]`
      ) as HTMLElement | null;

      if (expandedCard && expandedCard.contains(target)) {
        // Click inside the expanded card - do nothing
        return;
      }

      // Clicked anywhere outside the expanded card - collapse it
      setExpandedCardId(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandedCardId]);

  const loadRecommendations = async (
    filters: any,
    overrideSortMode?: "relevance" | "time"
  ) => {
    setIsLoading(true);
    setError("");
    try {
      const modeToUse = overrideSortMode ?? sortMode;

      let response: any;
      if (modeToUse === "time") {
        // Use backend time-sorted recommendations endpoint
        response = await apiClient.getRecommendationsByTime();
      } else {
        response = await apiClient.getRecommendations(filters);
      }

      const matches = response.matches || [];
      // Trust backend ordering for both relevance and time
      setRooms(matches);
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

  const applySort = (items: RoomMatch[], mode: "relevance" | "time"): RoomMatch[] => {
    if (mode === "time") {
      return [...items].sort((a, b) => {
        const aDate = new Date(a.room_data.created_at || a.room_data.available_from || 0).getTime();
        const bDate = new Date(b.room_data.created_at || b.room_data.available_from || 0).getTime();
        return bDate - aDate;
      });
    }
    return items;
  };

  const loadMyRooms = async () => {
    setIsMyRoomsLoading(true);
    setMyRoomsError("");
    try {
      const response: any = await apiClient.getMyRooms();
      let items: any[] = [];

      const isLikelyRoom = (room: any) => {
        if (!room || typeof room !== "object") return false;
        if (room.room_data) return true;
        if (typeof room.rent === "number") return true;
        if (room.address && room.location) return true;
        return false;
      };

      if (Array.isArray(response)) {
        items = response.filter(isLikelyRoom);
      } else if (Array.isArray(response?.rooms)) {
        items = response.rooms.filter(isLikelyRoom);
      } else if (isLikelyRoom(response)) {
        // Handle single-room object responses
        items = [response];
      }

      const mapped: RoomMatch[] = items.map((room: any, index: number) => ({
        room_id: room.id || room.room_id || String(index),
        room_data: room.room_data || room,
      }));

      setMyRooms(mapped);
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") {
        router.push("/login");
        return;
      }
      setMyRoomsError(err.message || "Failed to load your listings");
    } finally {
      setIsMyRoomsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!roomId || isDeletingRoomId) return;

    setIsDeletingRoomId(roomId);
    setMyRoomsError("");
    try {
      await apiClient.deleteRoom(roomId);
      if (expandedCardId === roomId) {
        setExpandedCardId(null);
      }
      await loadMyRooms();
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") {
        router.push("/login");
        return;
      }
      setMyRoomsError(err.message || "Failed to delete the listing");
    } finally {
      setIsDeletingRoomId(null);
    }
  };

  const handleNavigation = (view: string) => {
    if (view === "post-ad") {
      setShowPostAd(true);
    } else if (view === "filters") {
      setShowFilters(true);
    } else if (view === "relevance") {
      setSortMode("relevance");
      setRecommendationHeadingMode("default");
      loadRecommendations(currentFilters || {}, "relevance");
    } else if (view === "recommendations") {
      setActiveView("recommendations");
      setRecommendationHeadingMode("default");
      loadRecommendations(currentFilters || {});
    } else if (view === "my-listings") {
      setActiveView("my-listings");
      loadMyRooms();
    }
  };

  const handlePostAdSuccess = () => {
    setShowPostAd(false);
    setActiveView("my-listings");
    loadMyRooms();
  };

  const handleApplyFilters = (filters: any) => {
    setCurrentFilters(filters);
    setShowFilters(false);
    setRecommendationHeadingMode("filters");
    loadRecommendations(filters);
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
    setExpandedCardId(null);
    setRecommendationHeadingMode("default");
    loadRecommendations({});
  };

  const handleResetAgentRecommendations = () => {
    setCurrentFilters({});
    setExpandedCardId(null);
    setRecommendationHeadingMode("default");
    loadRecommendations({});
  };

  const handleSortChange = (mode: "relevance" | "time") => {
    setSortMode(mode);

    // For chat-driven results, keep using client-side sorting
    if (recommendationHeadingMode === "chat") {
      setRooms((prev) => applySort(prev, mode));
      return;
    }

    // For standard recommendations, refetch from backend with the chosen sort mode
    loadRecommendations(currentFilters || {}, mode);
  };

  const getRecommendationsHeading = () => {
    if (recommendationHeadingMode === "filters") {
      return "Listings based on Filters";
    }
    if (recommendationHeadingMode === "chat") {
      return "Homie Bot Suggested Filters";
    }
    return "Your Recommendations";
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0f172a] relative overflow-hidden">
      <SpotlightPattern iconCount={800} showIcons={false} />
      <Sidebar onNavigate={handleNavigation} />
      
      <div className="ml-64 p-8 pt-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <AnimatePresence mode="wait" initial={false}>
                {activeView === "recommendations" ? (
                  <motion.h1
                    key={recommendationHeadingMode}
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="heading-lg mb-2 dark:text-white origin-left"
                  >
                    {getRecommendationsHeading()}
                  </motion.h1>
                ) : (
                  <motion.h1
                    key="my-listings"
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="heading-lg mb-2 dark:text-white origin-left"
                  >
                    Your Listings
                  </motion.h1>
                )}
              </AnimatePresence>
              <p className="text-gray-600 dark:text-gray-300">
                {activeView === "recommendations"
                  ? "AI-curated roommate matches based on your preferences"
                  : "View and manage the room ads you've posted"}
              </p>
            </div>
            {activeView === "recommendations" && (
              <div className="flex items-center gap-3">
                {recommendationHeadingMode === "filters" && (
                  <motion.button
                    type="button"
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-gray-300 bg-white/70 dark:bg-black/40 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 shadow-sm"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                    <span>Clear Filters</span>
                  </motion.button>
                )}
                {recommendationHeadingMode === "chat" && (
                  <motion.button
                    type="button"
                    onClick={handleResetAgentRecommendations}
                    className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 shadow-sm"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Back to Default</span>
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="btn-secondary flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </motion.button>
                <div className="relative">
                  <motion.button
                    type="button"
                    onClick={() => setIsSortMenuOpen((open) => !open)}
                    className="btn-primary flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sort By</span>
                  </motion.button>
                  <AnimatePresence>
                    {isSortMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-lg z-30 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleSortChange("relevance");
                            setIsSortMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-900 ${
                            sortMode === "relevance" ? "bg-gray-100 dark:bg-gray-900 font-medium" : ""
                          }`}
                        >
                          Relevance
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleSortChange("time");
                            setIsSortMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-900 ${
                            sortMode === "time" ? "bg-gray-100 dark:bg-gray-900 font-medium" : ""
                          }`}
                        >
                          Time
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          {activeView === "my-listings" ? (
            isMyRoomsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card dark:bg-black dark:border-gray-800 p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : myRoomsError ? (
              <div className="card dark:bg-black dark:border-gray-800 p-8 text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">{myRoomsError}</p>
                <motion.button
                  onClick={loadMyRooms}
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Retry
                </motion.button>
              </div>
            ) : myRooms.length === 0 ? (
              <div className="card dark:bg-black dark:border-gray-800 p-12 text-center">
                <div className="mb-4 flex justify-center">
                  <Home className="w-16 h-16 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="heading-md mb-2">No current ads</h3>
                <p className="text-gray-600 mb-6">
                  You have no current ads. Use the "Find Your Homie" button in the sidebar to create your first listing.
                </p>
                <motion.button
                  onClick={() => handleNavigation("post-ad")}
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Post a Room Ad
                </motion.button>
              </div>
            ) : (
              <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRooms.map((match) => (
                  <div
                    key={match.room_id}
                    data-room-id={match.room_id}
                        className={`transition-all duration-300 ${
                          expandedCardId && expandedCardId !== match.room_id
                            ? "blur-sm opacity-60"
                            : ""
                        }`}
                  >
                    <RoomCard
                      roomId={match.room_id}
                      roomData={match.room_data as any}
                      isExpanded={expandedCardId === match.room_id}
                      onToggleExpand={(id) => setExpandedCardId(expandedCardId === id ? null : id)}
                      isOwner
                      onDelete={() => handleDeleteRoom(match.room_id)}
                    />
                  </div>
                ))}
              </div>
            )
          ) : isLoading ? (
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
                       data-room-id={match.room_id}
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
            initialFilters={currentFilters}
          />
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
