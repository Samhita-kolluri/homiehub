// API Types

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  contact_number: string;
  age: number;
  gender: string;
  gender_preference: string;
  preferred_locations: string[];
  budget_max: number;
  lease_duration_months: number;
  room_type_preference: string;
  attached_bathroom: string;
  lifestyle_food: string;
  lifestyle_alcohol: string;
  lifestyle_smoke: string;
  utilities_preference: string[];
  move_in_date: string;
  occupation: string;
  university: string;
  bio: string;
  interests: string[];
}

export interface SignupResponse {
  id: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RoomData {
  address: string;
  lease_duration_months: number;
  location: string;
  lifestyle_alcohol: string;
  utilities_included: string[];
  num_bathrooms: number;
  available_from: string;
  created_at: string;
  photos: string[];
  rent: number;
  contact: string;
  lifestyle_smoke: string;
  lifestyle_food: string;
  num_bedrooms: number;
  attached_bathroom: string;
  room_type: string;
  description: string;
  amenities: string[];
  flatmate_gender: string;
}

export interface RoomMatch {
  room_id: string;
  room_data: RoomData;
}

export interface RecommendationResponse {
  user_id: string;
  matches: RoomMatch[];
  total_results: number;
}

export interface RecommendationRequest {
  max_rent?: number;
  limit?: number;
  gender_pref?: string;
  preferred_locations?: string[];
  room_type_preference?: string;
  attached_bathroom?: string;
  lifestyle_food?: string;
  lifestyle_alcohol?: string;
  lifestyle_smoke?: string;
  utilities_preference?: string[];
  move_in_date?: string;
  bio?: string;
  interests?: string[];
}

export interface PostAdRequest {
  location: string;
  address: string;
  flatmate_gender: string;
  room_type: string;
  rent: number;
  lease_duration_months: number;
  attached_bathroom: string;
  lifestyle_food: string;
  lifestyle_alcohol: string;
  lifestyle_smoke: string;
  num_bedrooms: number;
  num_bathrooms: number;
  utilities_included: string[];
  contact: string;
  description: string;
  amenities: string[];
  available_from: string;
  photos: string[];
}

export interface PostAdResponse {
  id: string;
  message: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  state: {
    message_count: number;
    original_message: string;
    user_id: string;
    agent_type: string;
    model: string;
    request_id: string;
    duration_ms: number;
  };
  tools_used: Array<{
    tool: string;
    args: Record<string, any>;
  }>;
}

// Form option types
export const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const;
export const FLATMATE_GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Mixed', 'Any'] as const;
export const ROOM_TYPE_OPTIONS = ['Shared', 'Private', 'Studio'] as const;
export const BATHROOM_OPTIONS = ['Yes', 'No', 'Any'] as const;
export const LIFESTYLE_FOOD_OPTIONS = ['Vegetarian', 'Vegan', 'Everything'] as const;
export const LIFESTYLE_ALCOHOL_OPTIONS = ['Never', 'Rarely', 'Occasionally', 'Regularly'] as const;
export const LIFESTYLE_SMOKE_OPTIONS = ['Yes', 'No', 'Outside only'] as const;
export const UTILITIES_OPTIONS = ['Heat', 'Water', 'Gas', 'Electricity', 'Internet', 'Trash', 'Sewer', 'Cable'] as const;
export const LOCATION_OPTIONS = [
  'Boston', 'Downtown Boston', 'Back Bay', 'South End', 'North End', 'Beacon Hill',
  'Fenway', 'South Boston', 'East Boston', 'Charlestown', 'Roxbury', 'Jamaica Plain',
  'Mission Hill', 'Cambridge', 'Central Square', 'Kendall Square', 'Harvard Square',
  'Somerville', 'Union Square', 'Davis Square', 'Brookline', 'Coolidge Corner',
  'Allston', 'Brighton'
] as const;
export const AMENITIES_OPTIONS = [
  'WiFi', 'Parking', 'Laundry in unit', 'Laundry in building', 'Gym', 'Pool', 
  'Elevator', 'Doorman', 'Pet-friendly', 'Air conditioning', 'Heating', 
  'Dishwasher', 'Microwave', 'Furnished', 'Hardwood floors', 'Balcony', 
  'Patio', 'Storage', 'Bike storage', 'Kitchen'
] as const;
