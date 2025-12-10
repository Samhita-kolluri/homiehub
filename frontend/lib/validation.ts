import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[a-zA-Z\s'-]+$/, "Name must contain only letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .email("Invalid email address")
    .refine((email) => email.endsWith(".edu"), "Must use a .edu email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  contact_number: z
    .string()
    .regex(/^[\d\s+()-]+$/, "Invalid phone number format")
    .refine((val: string) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, "Phone number must contain 10-15 digits"),
  age: z
    .number()
    .int()
    .min(18, "Must be at least 18")
    .max(100, "Must be 100 or younger"),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say"], {
    errorMap: () => ({ message: "Please select a valid gender" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const postAdSchema = z.object({
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  flatmate_gender: z.enum(["Male", "Female", "Non-binary", "Mixed", "Any"]),
  room_type: z.enum(["Shared", "Private", "Studio"]),
  rent: z.number().positive("Rent must be positive"),
  lease_duration_months: z.number().int().positive("Lease duration must be positive"),
  attached_bathroom: z.enum(["Yes", "No"]),
  lifestyle_food: z.enum(["Vegetarian", "Vegan", "Non-vegetarian", "Everything", "Halal", "Kosher"]),
  lifestyle_alcohol: z.enum(["Never", "Rarely", "Occasionally", "Regularly"]),
  lifestyle_smoke: z.enum(["Yes", "No", "Occasionally", "Outside only"]),
  num_bedrooms: z.number().int().positive("Number of bedrooms must be positive"),
  num_bathrooms: z.number().int().positive("Number of bathrooms must be positive"),
  utilities_included: z.array(z.string()),
  contact: z.string().email("Invalid contact email"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  amenities: z.array(z.string()),
  available_from: z.string().refine((date: string) => {
    const selectedDate = new Date(date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    return selectedDate >= thirtyDaysAgo && selectedDate <= oneYearFromNow;
  }, "Date must be within 30 days past to 1 year future"),
  photos: z.array(z.string().url()).optional(),
});

export const filterSchema = z.object({
  max_rent: z.number().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  gender_pref: z.enum(["Male", "Female", "Non-binary", "Mixed", "Any"]).optional(),
  preferred_locations: z.array(z.string()).optional(),
  room_type_preference: z.enum(["Shared", "Private", "Studio", "Any"]).optional(),
  attached_bathroom: z.enum(["Yes", "No", "Any"]).optional(),
  lifestyle_food: z.enum(["Vegetarian", "Vegan", "Non-vegetarian", "Everything", "Halal", "Kosher"]).optional(),
  lifestyle_alcohol: z.enum(["Never", "Rarely", "Occasionally", "Regularly"]).optional(),
  lifestyle_smoke: z.enum(["Yes", "No", "Occasionally", "Outside only"]).optional(),
  utilities_preference: z.array(z.string()).optional(),
  move_in_date: z.string().optional().refine((date: string | undefined) => {
    if (!date) return true;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    return selectedDate >= today && selectedDate <= oneYearFromNow;
  }, "Move-in date must be between today and 1 year from now"),
  bio: z.string().min(10, "Bio must be at least 10 characters").optional().or(z.literal("")),
  interests: z.array(z.string().max(50, "Each interest must be 50 characters or less")).max(20, "Maximum 20 interests allowed").optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type PostAdFormData = z.infer<typeof postAdSchema>;
export type FilterFormData = z.infer<typeof filterSchema>;
