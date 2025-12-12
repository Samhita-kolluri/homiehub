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
  "Brighton"
] as const;

interface FiltersModalProps {
  onClose: () => void;
  onApply: (filters: any) => void;
  onClearFilters?: () => void;
  initialFilters?: any;
}

export function FiltersModal({ onClose, onApply, onClearFilters, initialFilters }: FiltersModalProps) {
  const defaultFilters = {
    max_rent: 2000,
    limit: 20,
    location: [],
    flatmate_gender: "Any",
    room_type: "Any",
    attached_bathroom: "Any",
    available_from: "",
    lease_duration_months: "",
    lifestyle_food: "",
    lifestyle_alcohol: "",
    lifestyle_smoke: "",
    utilities_included: [],
  };

  // Merge initialFilters with defaultFilters to ensure all properties exist
  const mergedFilters = initialFilters ? { ...defaultFilters, ...initialFilters } : defaultFilters;
  // Convert location string back to array if it's a string
  if (mergedFilters.location && typeof mergedFilters.location === 'string') {
    mergedFilters.location = [mergedFilters.location];
  }
  const [filters, setFilters] = useState<any>(mergedFilters);

  const [selectedLocation, setSelectedLocation] = useState<string>("");
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
    if (selectedLocation && !filters.location.includes(selectedLocation)) {
      setFilters((prev: any) => ({
        ...prev,
        location: [...prev.location, selectedLocation],
      }));
      setSelectedLocation("");
    }
  };

  const removeLocation = (loc: string) => {
    setFilters((prev: any) => ({
      ...prev,
      location: prev.location.filter((l: string) => l !== loc),
    }));
  };

  const handleApply = () => {
    setErrors({});

    // Build clean filters object (remove empty/default values)
    const cleanFilters: any = {};
    if (filters.max_rent && filters.max_rent > 0) cleanFilters.max_rent = filters.max_rent;
    if (filters.limit && filters.limit > 0) cleanFilters.limit = filters.limit;
    // Only send location if explicitly selected
    if (filters.location.length > 0) cleanFilters.location = filters.location;
    if (filters.flatmate_gender && filters.flatmate_gender !== "Any") cleanFilters.flatmate_gender = filters.flatmate_gender;
    if (filters.room_type && filters.room_type !== "Any") cleanFilters.room_type = filters.room_type;
    if (filters.attached_bathroom && filters.attached_bathroom !== "Any") cleanFilters.attached_bathroom = filters.attached_bathroom;
    if (filters.available_from) cleanFilters.available_from = filters.available_from;
    if (filters.lease_duration_months) cleanFilters.lease_duration_months = parseInt(filters.lease_duration_months);
    if (filters.lifestyle_food) cleanFilters.lifestyle_food = filters.lifestyle_food;
    if (filters.lifestyle_alcohol) cleanFilters.lifestyle_alcohol = filters.lifestyle_alcohol;
    if (filters.lifestyle_smoke) cleanFilters.lifestyle_smoke = filters.lifestyle_smoke;
    if (filters.utilities_included.length > 0) cleanFilters.utilities_included = filters.utilities_included;

    onApply(cleanFilters);
  };

  const handleClearAll = () => {
    setFilters(defaultFilters);
    setSelectedLocation("");
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

            {/* Flatmate Gender & Lease Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Flatmate Gender</label>
                <select
                  name="flatmate_gender"
                  value={filters.flatmate_gender}
                  onChange={handleChange}
                  className="input"
                >
                  {FLATMATE_GENDER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Lease Duration (months)</label>
                <input
                  type="number"
                  name="lease_duration_months"
                  value={filters.lease_duration_months}
                  onChange={handleChange}
                  className="input"
                  min="1"
                  max="24"
                  placeholder="e.g., 12"
                />
              </div>
            </div>

            {/* Room Type & Attached Bathroom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Room Type</label>
                <select
                  name="room_type"
                  value={filters.room_type}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="Any">Any</option>
                  {["Shared", "Private", "Studio"].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
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
            </div>

            {/* Available From (Move-in Date) */}
            <div>
              <label className="label">Available From</label>
              <input
                type="date"
                name="available_from"
                value={filters.available_from}
                onChange={handleChange}
                className="input"
              />
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
                {filters.location.map((loc: string) => (
                  <span key={loc} className="pill-accent cursor-pointer" onClick={() => removeLocation(loc)}>
                    {loc} ×
                  </span>
                ))}
              </div>
            </div>

            {/* Utilities */}
            <div>
              <label className="label">Utilities Included</label>
              <div className="flex flex-wrap gap-2">
                {UTILITIES_OPTIONS.map((util) => {
                  const selected = filters.utilities_included.includes(util);
                  return (
                    <button
                      key={util}
                      type="button"
                      onClick={() => handleMultiSelect("utilities_included", util)}
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
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <motion.button
            onClick={() => {
              handleClearAll();
              // Apply with empty filters to show all results
              onApply({
                max_rent: 2000,
                limit: 20,
              });
            }}
            className="btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Filters
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
