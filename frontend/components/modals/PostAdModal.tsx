"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { postAdSchema } from "@/lib/validation";
import {
  FLATMATE_GENDER_OPTIONS,
  ROOM_TYPE_OPTIONS,
  BATHROOM_OPTIONS,
  LIFESTYLE_FOOD_OPTIONS,
  LIFESTYLE_ALCOHOL_OPTIONS,
  LIFESTYLE_SMOKE_OPTIONS,
  UTILITIES_OPTIONS,
  AMENITIES_OPTIONS,
} from "@/lib/types";

interface PostAdModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PostAdModal({ onClose, onSuccess }: PostAdModalProps) {
  const [formData, setFormData] = useState<any>({
    location: "",
    address: "",
    flatmate_gender: "Any",
    room_type: "Private",
    rent: 1000,
    lease_duration_months: 12,
    attached_bathroom: "No",
    lifestyle_food: "Everything",
    lifestyle_alcohol: "Occasionally",
    lifestyle_smoke: "No",
    num_bedrooms: 1,
    num_bathrooms: 1,
    utilities_included: [],
    contact: "",
    description: "",
    amenities: [],
    available_from: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    setFormData((prev: any) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
    setApiError("");
  };

  const handleMultiSelect = (name: string, value: string) => {
    setFormData((prev: any) => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const handlePhotoUrlChange = (index: number, value: string) => {
    setFormData((prev: any) => {
      const photos = [...(prev.photos || [])];
      photos[index] = value;
      return { ...prev, photos };
    });
    if (errors.photos) {
      setErrors((prev: any) => ({ ...prev, photos: undefined }));
    }
    setApiError("");
  };

  const handlePhotosSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setPhotoFiles(files);
    if (errors.photos) {
      setErrors((prev: any) => ({ ...prev, photos: undefined }));
    }
    setApiError("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    const coreSchema = postAdSchema.omit({ photos: true });
    const result = coreSchema.safeParse(formData);
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

    setIsLoading(true);
    try {
      const roomData = result.data;
      await apiClient.postRoom({ room_data: roomData, photos: photoFiles });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess();
      }, 2000);
    } catch (error: any) {
      if (error.message === "UNAUTHORIZED") {
        // Token expired, close modal and redirect will happen at parent level
        setApiError("Session expired. Please login again.");
        setIsLoading(false);
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }, 1500);
        return;
      }
      setApiError(error.message || "Failed to post ad");
      setIsLoading(false);
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
          <h2 className="heading-md dark:text-white">Post a Room Ad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-5">
            {/* Location & Address */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input"
                  placeholder="Cambridge"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className="label">Flatmate Gender</label>
                <select
                  name="flatmate_gender"
                  value={formData.flatmate_gender}
                  onChange={handleChange}
                  className="input"
                >
                  {FLATMATE_GENDER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                placeholder="123 Main St, Cambridge, MA 02139"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            {/* Room Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Room Type</label>
                <select
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleChange}
                  className="input"
                >
                  {ROOM_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Rent ($)</label>
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  className="input"
                />
                {errors.rent && <p className="text-red-500 text-xs mt-1">{errors.rent}</p>}
              </div>
              <div>
                <label className="label">Lease (months)</label>
                <input
                  type="number"
                  name="lease_duration_months"
                  value={formData.lease_duration_months}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            {/* Bedrooms, Bathrooms, Attached Bathroom */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Bedrooms</label>
                <input
                  type="number"
                  name="num_bedrooms"
                  value={formData.num_bedrooms}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Bathrooms</label>
                <input
                  type="number"
                  name="num_bathrooms"
                  value={formData.num_bathrooms}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Attached Bathroom</label>
                <select
                  name="attached_bathroom"
                  value={formData.attached_bathroom}
                  onChange={handleChange}
                  className="input"
                >
                  {["Yes", "No"].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lifestyle */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Food</label>
                <select
                  name="lifestyle_food"
                  value={formData.lifestyle_food}
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
                  value={formData.lifestyle_alcohol}
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
                  value={formData.lifestyle_smoke}
                  onChange={handleChange}
                  className="input text-sm"
                >
                  {LIFESTYLE_SMOKE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Utilities */}
            <div>
              <label className="label">Utilities Included</label>
              <div className="flex flex-wrap gap-2">
                {UTILITIES_OPTIONS.map((util) => {
                  const selected = formData.utilities_included.includes(util);
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

            {/* Amenities */}
            <div>
              <label className="label">Amenities</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {AMENITIES_OPTIONS.map((amenity) => {
                  const selected = formData.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleMultiSelect("amenities", amenity)}
                      className={`pill ${selected ? "pill-selected" : ""}`}
                      aria-pressed={selected}
                      style={
                        selected
                          ? { backgroundColor: "#0070f3", color: "#ffffff", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }
                          : undefined
                      }
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact & Available From */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Contact Email</label>
                <input
                  type="email"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="input"
                  placeholder="contact@example.com"
                />
                {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
              </div>
              <div>
                <label className="label">Available From</label>
                <input
                  type="date"
                  name="available_from"
                  value={formData.available_from}
                  onChange={handleChange}
                  className="input"
                />
                {errors.available_from && <p className="text-red-500 text-xs mt-1">{errors.available_from}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[100px]"
                placeholder="Describe the room, location, and ideal roommate..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Photos */}
            <div>
              <label className="label">Photos (optional)</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Upload photos from your device. These will appear in a gallery when someone expands your listing.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotosSelected}
                className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
              />
              {photoFiles.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {photoFiles.length} photo{photoFiles.length === 1 ? "" : "s"} selected
                </p>
              )}
              {errors.photos && (
                <p className="text-red-500 text-xs mt-1">{errors.photos}</p>
              )}
            </div>

            {apiError && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <motion.button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? "Posting..." : "Post Ad"}
          </motion.button>
        </div>

        {/* Success Overlay */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-sm flex items-center justify-center rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0, rotateZ: -180 }}
              animate={{ scale: 1, rotateZ: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="text-center"
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="heading-md text-gray-900 dark:text-gray-100 mb-2">Ad Posted Successfully!</h3>
              <p className="text-gray-600 dark:text-gray-300">Refreshing your recommendations...</p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
