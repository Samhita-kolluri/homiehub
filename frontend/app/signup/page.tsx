"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { signupSchema, type SignupFormData } from "@/lib/validation";
import { GENDER_OPTIONS } from "@/lib/types";
import { SpotlightPattern } from "@/components/effects/SpotlightPattern";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    contact_number: "",
    age: "",
    gender: "Prefer not to say",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    if (name === "age") {
      processedValue = value === "" ? "" : parseInt(value) || "";
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: processedValue }));
    
    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setApiError("");
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
      // Get tomorrow's date in YYYY-MM-DD format
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const moveInDate = tomorrow.toISOString().split('T')[0];
      
      // Build full request with defaults
      const fullRequest = {
        ...dataToValidate,
        gender_preference: "Any",
        preferred_locations: ["Any"],
        budget_max: 9999,
        lease_duration_months: 12,
        room_type_preference: "Any",
        attached_bathroom: "Any",
        lifestyle_food: "Everything",
        lifestyle_alcohol: "Occasionally",
        lifestyle_smoke: "No",
        utilities_preference: [],
        move_in_date: moveInDate,
        occupation: "",
        university: "",
        bio: "New HomieHub user looking for the perfect roommate match.",
        interests: [],
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
