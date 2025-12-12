"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/apiClient";
import {
  LIFESTYLE_FOOD_OPTIONS,
  LIFESTYLE_ALCOHOL_OPTIONS,
  LIFESTYLE_SMOKE_OPTIONS,
  UTILITIES_OPTIONS,
} from "@/lib/types";

const LOCATION_OPTIONS = [
  "Boston",
  "Downtown Boston",
  "Back Bay",
  "South End",
  "North End",
  "Beacon Hill",
  "Fenway",
  "South Boston",
  "East Boston",
  "Charlestown",
  "Roxbury",
  "Jamaica Plain",
  "Mission Hill",
  "Cambridge",
  "Central Square",
  "Kendall Square",
  "Harvard Square",
  "Somerville",
  "Union Square",
  "Davis Square",
  "Brookline",
  "Coolidge Corner",
  "Allston",
  "Brighton",
] as const;

interface UserPreferencesModalProps {
  onClose: () => void;
}

const defaultPreferences = {
  move_in_date: "",
  gender_preference: "Mixed",
  preferred_locations: ["Boston"] as string[],
  budget_max: 9999,
  lease_duration_months: 12,
  room_type_preference: "Any",
  attached_bathroom: "No",
  lifestyle_food: "Everything",
  lifestyle_alcohol: "Occasionally",
  lifestyle_smoke: "No",
  utilities_preference: [] as string[],
  occupation: "",
  bio: "",
  // Comma-separated interests string; converted to array when saving
  interests: "",
};

export function UserPreferencesModal({ onClose }: UserPreferencesModalProps) {
  const [prefs, setPrefs] = useState<typeof defaultPreferences>(defaultPreferences);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadPreferences = async () => {
      setIsLoading(true);
      setError("");
      try {
        const me: any = await apiClient.getCurrentUser();
        const nextPrefs = { ...defaultPreferences };
        const source = (me && typeof me === "object" && me.user) ? me.user : (me || {});
        if (source.move_in_date) nextPrefs.move_in_date = source.move_in_date;
        if (source.gender_preference) nextPrefs.gender_preference = source.gender_preference;
        if (Array.isArray(source.preferred_locations) && source.preferred_locations.length > 0) {
          nextPrefs.preferred_locations = source.preferred_locations;
        }
        if (typeof source.budget_max === "number") nextPrefs.budget_max = source.budget_max;
        if (typeof source.lease_duration_months === "number") nextPrefs.lease_duration_months = source.lease_duration_months;
        if (source.room_type_preference) nextPrefs.room_type_preference = source.room_type_preference;
        if (source.attached_bathroom) nextPrefs.attached_bathroom = source.attached_bathroom;
        if (source.lifestyle_food) nextPrefs.lifestyle_food = source.lifestyle_food;
        if (source.lifestyle_alcohol) nextPrefs.lifestyle_alcohol = source.lifestyle_alcohol;
        if (source.lifestyle_smoke) nextPrefs.lifestyle_smoke = source.lifestyle_smoke;
        if (Array.isArray(source.utilities_preference)) nextPrefs.utilities_preference = source.utilities_preference;
        if (source.occupation) nextPrefs.occupation = source.occupation;
        if (source.bio) nextPrefs.bio = source.bio;
        if (Array.isArray(source.interests)) nextPrefs.interests = source.interests.join(", ");
        setPrefs(nextPrefs);
      } catch (err: any) {
        setError(err.message || "Failed to load preferences");
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPrefs((prev) => ({
      ...prev,
      [name]: name === "budget_max" || name === "lease_duration_months" ? (value === "" ? 0 : parseInt(value, 10) || 0) : value,
    }));
  };

  const handleMultiSelect = (name: keyof typeof defaultPreferences, value: string) => {
    setPrefs((prev) => {
      const current = (prev[name] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const addLocation = () => {
    if (selectedLocation && !prefs.preferred_locations.includes(selectedLocation)) {
      setPrefs((prev) => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, selectedLocation],
      }));
      setSelectedLocation("");
    }
  };

  const removeLocation = (loc: string) => {
    setPrefs((prev) => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter((l) => l !== loc),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload: any = {};

      if (prefs.move_in_date) payload.move_in_date = prefs.move_in_date;
      if (prefs.gender_preference) payload.gender_preference = prefs.gender_preference;
      if (prefs.preferred_locations && prefs.preferred_locations.length > 0) {
        payload.preferred_locations = prefs.preferred_locations;
      }
      if (prefs.budget_max && prefs.budget_max > 0) payload.budget_max = prefs.budget_max;
      if (prefs.lease_duration_months && prefs.lease_duration_months > 0) {
        payload.lease_duration_months = prefs.lease_duration_months;
      }
      if (prefs.room_type_preference) payload.room_type_preference = prefs.room_type_preference;
      if (prefs.attached_bathroom) payload.attached_bathroom = prefs.attached_bathroom;
      if (prefs.lifestyle_food) payload.lifestyle_food = prefs.lifestyle_food;
      if (prefs.lifestyle_alcohol) payload.lifestyle_alcohol = prefs.lifestyle_alcohol;
      if (prefs.lifestyle_smoke) payload.lifestyle_smoke = prefs.lifestyle_smoke;
      if (prefs.utilities_preference) payload.utilities_preference = prefs.utilities_preference;
      if (prefs.occupation) payload.occupation = prefs.occupation;
      if (prefs.bio) payload.bio = prefs.bio;
      if (prefs.interests) {
        payload.interests = prefs.interests
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      await apiClient.updateUserPreferences(payload);
      setSuccess("Preferences updated successfully");
      setTimeout(() => {
        setSuccess("");
        onClose();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("homiehub:preferences-updated"));
        }
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, rotateX: 10, y: 20 }}
        animate={{ scale: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.95, rotateX: -10, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white dark:bg-black border dark:border-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="heading-md dark:text-white">Your Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {isLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading preferences...</p>
          ) : (
            <div className="space-y-5">
              {/* Move-in Date */}
              <div>
                <label className="label">Move-in Date</label>
                <input
                  type="date"
                  name="move_in_date"
                  value={prefs.move_in_date || ""}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              {/* Gender Preference & Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Preferred Roommate Gender</label>
                  <select
                    name="gender_preference"
                    value={prefs.gender_preference}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="Mixed">Mixed</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="label">Maximum Budget ($)</label>
                  <input
                    type="number"
                    name="budget_max"
                    value={prefs.budget_max}
                    onChange={handleChange}
                    className="input"
                    min={0}
                  />
                </div>
              </div>

              {/* Lease Duration & Room Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Lease Duration (months)</label>
                  <input
                    type="number"
                    name="lease_duration_months"
                    value={prefs.lease_duration_months}
                    onChange={handleChange}
                    className="input"
                    min={1}
                    max={24}
                  />
                </div>
                <div>
                  <label className="label">Room Type Preference</label>
                  <select
                    name="room_type_preference"
                    value={prefs.room_type_preference}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="Any">Any</option>
                    <option value="Shared">Shared</option>
                    <option value="Private">Private</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>
              </div>

              {/* Attached Bathroom */}
              <div>
                <label className="label">Attached Bathroom</label>
                <select
                  name="attached_bathroom"
                  value={prefs.attached_bathroom}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {/* Lifestyle */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Food Preference</label>
                  <select
                    name="lifestyle_food"
                    value={prefs.lifestyle_food}
                    onChange={handleChange}
                    className="input text-sm"
                  >
                    {LIFESTYLE_FOOD_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Alcohol</label>
                  <select
                    name="lifestyle_alcohol"
                    value={prefs.lifestyle_alcohol}
                    onChange={handleChange}
                    className="input text-sm"
                  >
                    {LIFESTYLE_ALCOHOL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Smoke</label>
                  <select
                    name="lifestyle_smoke"
                    value={prefs.lifestyle_smoke}
                    onChange={handleChange}
                    className="input text-sm"
                  >
                    {LIFESTYLE_SMOKE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Locations */}
              <div>
                <label className="label">Preferred Locations</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="input flex-1"
                  >
                    <option value="">Select a location</option>
                    {LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addLocation}
                    className="btn-secondary px-4"
                    disabled={!selectedLocation}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prefs.preferred_locations.map((loc) => (
                    <span
                      key={loc}
                      className="pill-accent cursor-pointer"
                      onClick={() => removeLocation(loc)}
                    >
                      {loc} ×
                    </span>
                  ))}
                </div>
              </div>

              {/* Utilities Preference */}
              <div>
                <label className="label">Utilities Preference</label>
                <div className="flex flex-wrap gap-2">
                  {UTILITIES_OPTIONS.map((util) => {
                    const selected = prefs.utilities_preference.includes(util);
                    return (
                      <button
                        key={util}
                        type="button"
                        onClick={() => handleMultiSelect("utilities_preference", util)}
                        className={`pill ${selected ? "pill-selected" : ""}`}
                        aria-pressed={selected}
                        style={
                          selected
                            ? { backgroundColor: "#0070f3", color: "#ffffff", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }
                            : undefined
                        }
                      >
                        {util}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile Details: Occupation, Bio, Interests */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={prefs.occupation}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Software Engineer, Student"
                  />
                </div>
                <div>
                  <label className="label">Interests</label>
                  <input
                    type="text"
                    name="interests"
                    value={prefs.interests}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Hiking, Cooking, Music"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Separate multiple interests with commas.
                  </p>
                </div>
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea
                  name="bio"
                  value={prefs.bio}
                  onChange={handleChange}
                  className="input min-h-[80px] resize-y"
                  placeholder="Short intro you'd like potential roommates to see"
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
              )}
              {success && (
                <p className="text-green-500 text-xs mt-1">{success}</p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <motion.button
            onClick={handleSave}
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
