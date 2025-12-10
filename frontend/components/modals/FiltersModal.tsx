"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { filterSchema } from "@/lib/validation";
import {
  FLATMATE_GENDER_OPTIONS,
  ROOM_TYPE_OPTIONS,
  BATHROOM_OPTIONS,
  LIFESTYLE_FOOD_OPTIONS,
  LIFESTYLE_ALCOHOL_OPTIONS,
  LIFESTYLE_SMOKE_OPTIONS,
  UTILITIES_OPTIONS,
} from "@/lib/types";

interface FiltersModalProps {
  onClose: () => void;
  onApply: (filters: any) => void;
}

export function FiltersModal({ onClose, onApply }: FiltersModalProps) {
  const [filters, setFilters] = useState<any>({
    max_rent: 2000,
    limit: 20,
    gender_pref: "Any",
    preferred_locations: [],
    room_type_preference: "Any",
    attached_bathroom: "Any",
    lifestyle_food: "",
    lifestyle_alcohol: "",
    lifestyle_smoke: "",
    utilities_preference: [],
    move_in_date: "",
    bio: "",
    interests: [],
  });

  const [locationInput, setLocationInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    setFilters((prev: any) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleMultiSelect = (name: string, value: string) => {
    setFilters((prev: any) => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const addLocation = () => {
    if (locationInput.trim() && !filters.preferred_locations.includes(locationInput.trim())) {
      setFilters((prev: any) => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, locationInput.trim()],
      }));
      setLocationInput("");
    }
  };

  const removeLocation = (loc: string) => {
    setFilters((prev: any) => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter((l: string) => l !== loc),
    }));
  };

  const addInterest = () => {
    if (
      interestInput.trim() &&
      !filters.interests.includes(interestInput.trim()) &&
      filters.interests.length < 20
    ) {
      setFilters((prev: any) => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()],
      }));
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setFilters((prev: any) => ({
      ...prev,
      interests: prev.interests.filter((i: string) => i !== interest),
    }));
  };

  const handleApply = () => {
    setErrors({});

    // Build clean filters object (remove empty/default values)
    const cleanFilters: any = {};
    if (filters.max_rent && filters.max_rent > 0) cleanFilters.max_rent = filters.max_rent;
    if (filters.limit && filters.limit > 0) cleanFilters.limit = filters.limit;
    if (filters.gender_pref && filters.gender_pref !== "Any") cleanFilters.gender_pref = filters.gender_pref;
    if (filters.preferred_locations.length > 0) cleanFilters.preferred_locations = filters.preferred_locations;
    if (filters.room_type_preference && filters.room_type_preference !== "Any") cleanFilters.room_type_preference = filters.room_type_preference;
    if (filters.attached_bathroom && filters.attached_bathroom !== "Any") cleanFilters.attached_bathroom = filters.attached_bathroom;
    if (filters.lifestyle_food) cleanFilters.lifestyle_food = filters.lifestyle_food;
    if (filters.lifestyle_alcohol) cleanFilters.lifestyle_alcohol = filters.lifestyle_alcohol;
    if (filters.lifestyle_smoke) cleanFilters.lifestyle_smoke = filters.lifestyle_smoke;
    if (filters.utilities_preference.length > 0) cleanFilters.utilities_preference = filters.utilities_preference;
    if (filters.move_in_date) cleanFilters.move_in_date = filters.move_in_date;
    if (filters.bio && filters.bio.length >= 10) cleanFilters.bio = filters.bio;
    if (filters.interests.length > 0) cleanFilters.interests = filters.interests;

    const result = filterSchema.safeParse(cleanFilters);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    onApply(cleanFilters);
  };

  const handleClearAll = () => {
    setFilters({
      max_rent: 2000,
      limit: 20,
      gender_pref: "Any",
      preferred_locations: [],
      room_type_preference: "Any",
      attached_bathroom: "Any",
      lifestyle_food: "",
      lifestyle_alcohol: "",
      lifestyle_smoke: "",
      utilities_preference: [],
      move_in_date: "",
      bio: "",
      interests: [],
    });
    setLocationInput("");
    setInterestInput("");
    setErrors({});
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
          <h2 className="heading-md dark:text-white">Filter Recommendations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-5">
            {/* Max Rent & Limit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Max Rent ($)</label>
                <input
                  type="number"
                  name="max_rent"
                  value={filters.max_rent}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Results Limit</label>
                <input
                  type="number"
                  name="limit"
                  value={filters.limit}
                  onChange={handleChange}
                  className="input"
                  max="100"
                />
              </div>
            </div>

            {/* Gender & Room Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Gender Preference</label>
                <select
                  name="gender_pref"
                  value={filters.gender_pref}
                  onChange={handleChange}
                  className="input"
                >
                  {FLATMATE_GENDER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Room Type</label>
                <select
                  name="room_type_preference"
                  value={filters.room_type_preference}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="Any">Any</option>
                  {["Shared", "Private", "Studio"].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attached Bathroom & Move-in Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Attached Bathroom</label>
                <select
                  name="attached_bathroom"
                  value={filters.attached_bathroom}
                  onChange={handleChange}
                  className="input"
                >
                  {BATHROOM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Move-in Date</label>
                <input
                  type="date"
                  name="move_in_date"
                  value={filters.move_in_date}
                  onChange={handleChange}
                  className="input"
                />
                {errors.move_in_date && <p className="text-red-500 text-xs mt-1">{errors.move_in_date}</p>}
              </div>
            </div>

            {/* Lifestyle */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Food</label>
                <select
                  name="lifestyle_food"
                  value={filters.lifestyle_food}
                  onChange={handleChange}
                  className="input text-sm"
                >
                  <option value="">Any</option>
                  {LIFESTYLE_FOOD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Alcohol</label>
                <select
                  name="lifestyle_alcohol"
                  value={filters.lifestyle_alcohol}
                  onChange={handleChange}
                  className="input text-sm"
                >
                  <option value="">Any</option>
                  {LIFESTYLE_ALCOHOL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Smoke</label>
                <select
                  name="lifestyle_smoke"
                  value={filters.lifestyle_smoke}
                  onChange={handleChange}
                  className="input text-sm"
                >
                  <option value="">Any</option>
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
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                  className="input flex-1"
                  placeholder="Add location"
                />
                <button
                  type="button"
                  onClick={addLocation}
                  className="btn-secondary px-4"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.preferred_locations.map((loc: string) => (
                  <span key={loc} className="pill-accent cursor-pointer" onClick={() => removeLocation(loc)}>
                    {loc} ×
                  </span>
                ))}
              </div>
            </div>

            {/* Utilities */}
            <div>
              <label className="label">Utilities Preference</label>
              <div className="flex flex-wrap gap-2">
                {UTILITIES_OPTIONS.map((util) => {
                  const selected = filters.utilities_preference.includes(util);
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

            {/* Bio */}
            <div>
              <label className="label">Bio (optional)</label>
              <textarea
                name="bio"
                value={filters.bio}
                onChange={handleChange}
                className="input min-h-[80px]"
                placeholder="Tell us about your preferences..."
              />
              {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
            </div>

            {/* Interests */}
            <div>
              <label className="label">Interests (max 20)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  className="input flex-1"
                  placeholder="Add interest"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="btn-secondary px-4"
                  disabled={filters.interests.length >= 20}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.interests.map((interest: string) => (
                  <span key={interest} className="pill-accent cursor-pointer" onClick={() => removeInterest(interest)}>
                    {interest} ×
                  </span>
                ))}
              </div>
              {errors.interests && <p className="text-red-500 text-xs mt-1">{errors.interests}</p>}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <motion.button
            onClick={handleClearAll}
            className="btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear All
          </motion.button>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <motion.button
              onClick={handleApply}
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Apply Filters
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
