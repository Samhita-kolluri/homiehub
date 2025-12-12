"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { signupSchema, type SignupFormData } from "@/lib/validation";
import { 
  GENDER_OPTIONS, 
  FLATMATE_GENDER_OPTIONS,
  BATHROOM_OPTIONS,
  LIFESTYLE_FOOD_OPTIONS,
  LIFESTYLE_ALCOHOL_OPTIONS,
  LIFESTYLE_SMOKE_OPTIONS,
  UTILITIES_OPTIONS,
  LOCATION_OPTIONS 
} from "@/lib/types";
import { SpotlightPattern } from "@/components/effects/SpotlightPattern";

const LOCATION_OPTIONS_CONST = [
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

export default function SignupPage() {
  const router = useRouter();
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  
  // Get tomorrow's date for default move_in_date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    contact_number: "",
    age: "",
    gender: "Prefer not to say",
    // Additional optional fields with defaults
    move_in_date: getTomorrowDate(),
    gender_preference: "Mixed",
    preferred_locations: ["Boston"],
    budget_max: 9999,
    lease_duration_months: 12,
    room_type_preference: "Any",
    attached_bathroom: "No",
    lifestyle_food: "Everything",
    lifestyle_alcohol: "Occasionally",
    lifestyle_smoke: "No",
    utilities_preference: [],
    occupation: "",
    bio: "",
    // Comma-separated interests; converted to array when submitting
    interests: "",
  });
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    if (name === "age" || name === "budget_max" || name === "lease_duration_months") {
      processedValue = value === "" ? "" : parseInt(value) || "";
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: processedValue }));
    
    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
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

  const addLocation = () => {
    if (selectedLocation && !formData.preferred_locations.includes(selectedLocation)) {
      setFormData((prev: any) => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, selectedLocation],
      }));
      setSelectedLocation("");
    }
  };

  const removeLocation = (loc: string) => {
    setFormData((prev: any) => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter((l: string) => l !== loc),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    // Prepare data with defaults
    const dataToValidate = {
      ...formData,
      age: formData.age === "" ? 18 : formData.age,
    };

    // Validate
    const result = signupSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof SignupFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Prepare optional profile fields
      const interestsArray = typeof formData.interests === "string"
        ? formData.interests
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
        : [];

      // Build full request with user's input or defaults
      const fullRequest = {
        ...dataToValidate,
        occupation: formData.occupation || "",
        university: "",
        bio: formData.bio || "New HomieHub user looking for the perfect roommate match.",
        interests: interestsArray,
      };

      await apiClient.signup(fullRequest);
      
      // Show success and redirect
      router.push("/login?success=true");
    } catch (error: any) {
      setApiError(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#0f172a] px-4 py-20 relative overflow-hidden">
      <SpotlightPattern iconCount={800} />
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="card dark:bg-black dark:border-gray-800 p-8">
          <div className="text-center mb-8">
            <h1 className="heading-md mb-2 dark:text-white">Create your account</h1>
            <p className="text-gray-600 dark:text-gray-300">Join HomieHub and find your perfect roommate</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="you@university.edu"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact_number" className="label">
                Contact Number
              </label>
              <input
                type="tel"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="input"
                placeholder="(123) 456-7890"
              />
              {errors.contact_number && (
                <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="label">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input"
                  placeholder="18"
                  min="18"
                  max="100"
                />
                {errors.age && (
                  <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="label">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input"
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                )}
              </div>
            </div>

            {/* Expandable Additional Details Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                type="button"
                onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors"
              >
                <span>Additional Details (Optional)</span>
                {showAdditionalDetails ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: showAdditionalDetails ? "auto" : 0,
                  opacity: showAdditionalDetails ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 mt-4">
                  {/* Move-in Date */}
                  <div>
                    <label htmlFor="move_in_date" className="label">
                      Move-in Date
                    </label>
                    <input
                      type="date"
                      id="move_in_date"
                      name="move_in_date"
                      value={formData.move_in_date}
                      onChange={handleChange}
                      className="input"
                      min={getTomorrowDate()}
                    />
                  </div>

                  {/* Gender Preference & Budget */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="gender_preference" className="label">
                        Preferred Roommate Gender
                      </label>
                      <select
                        id="gender_preference"
                        name="gender_preference"
                        value={formData.gender_preference}
                        onChange={handleChange}
                        className="input"
                      >
                        {FLATMATE_GENDER_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="budget_max" className="label">
                        Maximum Budget ($)
                      </label>
                      <input
                        type="number"
                        id="budget_max"
                        name="budget_max"
                        value={formData.budget_max}
                        onChange={handleChange}
                        className="input"
                        min="0"
                        max="50000"
                      />
                    </div>
                  </div>

                  {/* Lease Duration & Room Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="lease_duration_months" className="label">
                        Lease Duration (months)
                      </label>
                      <input
                        type="number"
                        id="lease_duration_months"
                        name="lease_duration_months"
                        value={formData.lease_duration_months}
                        onChange={handleChange}
                        className="input"
                        min="1"
                        max="24"
                      />
                    </div>
                    <div>
                      <label htmlFor="room_type_preference" className="label">
                        Room Type Preference
                      </label>
                      <select
                        id="room_type_preference"
                        name="room_type_preference"
                        value={formData.room_type_preference}
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

                  {/* Attached Bathroom */}
                  <div>
                    <label htmlFor="attached_bathroom" className="label">
                      Attached Bathroom
                    </label>
                    <select
                      id="attached_bathroom"
                      name="attached_bathroom"
                      value={formData.attached_bathroom}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {/* Lifestyle Preferences */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="lifestyle_food" className="label">
                        Food Preference
                      </label>
                      <select
                        id="lifestyle_food"
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
                      <label htmlFor="lifestyle_alcohol" className="label">
                        Alcohol
                      </label>
                      <select
                        id="lifestyle_alcohol"
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
                      <label htmlFor="lifestyle_smoke" className="label">
                        Smoke
                      </label>
                      <select
                        id="lifestyle_smoke"
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
                        {LOCATION_OPTIONS_CONST.map((loc) => (
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
                      {formData.preferred_locations.map((loc: string) => (
                        <span 
                          key={loc} 
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-accent/10 text-accent cursor-pointer hover:bg-accent/20" 
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
                        const selected = formData.utilities_preference.includes(util);
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

                  {/* Profile Details: Occupation, Interests, Bio */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="occupation" className="label">
                        Occupation
                      </label>
                      <input
                        type="text"
                        id="occupation"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="input"
                        placeholder="e.g., Software Engineer, Student"
                      />
                    </div>
                    <div>
                      <label htmlFor="interests" className="label">
                        Interests
                      </label>
                      <input
                        type="text"
                        id="interests"
                        name="interests"
                        value={formData.interests}
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
                    <label htmlFor="bio" className="label">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="input min-h-[80px] resize-y"
                      placeholder="Short intro you'd like potential roommates to see"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {apiError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm"
              >
                {apiError}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-accent hover:underline font-medium">
              Sign in
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
