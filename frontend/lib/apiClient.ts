const TOKEN_KEY = "homiehub_access_token";

const BASE_URLS = {
  user: "https://homiehub-user-room-api-766767793599.us-east4.run.app",
  recommendation: "https://homiehub-recommendation-api-766767793599.us-east4.run.app",
  chat: "https://homiehub-llm-agent-api-766767793599.us-east4.run.app",
};

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// Decode JWT token to extract user_id
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  // JWT tokens typically use 'sub' (subject) for user identifier
  // Adjust the field name based on your backend's JWT structure
  return decoded?.sub || decoded?.user_id || decoded?.id || null;
}

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = false, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (requiresAuth) {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication required");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    clearAccessToken();
    // Clear user email from session
    if (typeof window !== "undefined") {
      sessionStorage.removeItem('user_email');
      try {
        const url = new URL(window.location.href);
        if (url.pathname !== "/login") {
          url.pathname = "/login";
          url.searchParams.set("reason", "expired");
          window.location.href = url.toString();
        }
      } catch {
        window.location.href = "/login?reason=expired";
      }
    }
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// API Client methods
export const apiClient = {
  // Auth endpoints
  signup: async (data: any) => {
    return apiFetch(`${BASE_URLS.user}/users/register`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: any) => {
    return apiFetch(`${BASE_URLS.user}/users/login`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Current user endpoints
  getCurrentUser: async () => {
    return apiFetch(`${BASE_URLS.user}/users/me`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  updateUserPreferences: async (data: any) => {
    return apiFetch(`${BASE_URLS.user}/users/me`, {
      method: "PATCH",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Recommendations endpoint
  getRecommendations: async (filters: any = {}) => {
    return apiFetch(`${BASE_URLS.recommendation}/recommendation`, {
      method: "POST",
      body: JSON.stringify(filters),
      requiresAuth: true,
    });
  },

  // Time-sorted recommendations endpoint
  getRecommendationsByTime: async () => {
    return apiFetch(`${BASE_URLS.recommendation}/recommendation/time`, {
      method: "POST",
      body: JSON.stringify({}),
      requiresAuth: true,
    });
  },

  // Room endpoints
  postRoom: async (data: { room_data: any; photos?: File[] }) => {
    const formData = new FormData();
    formData.append("room_data", JSON.stringify(data.room_data));

    if (data.photos && Array.isArray(data.photos)) {
      data.photos.forEach((file) => {
        if (file instanceof File) {
          formData.append("photos", file);
        }
      });
    }

    return apiFetch(`${BASE_URLS.user}/rooms/register`, {
      method: "POST",
      body: formData,
      requiresAuth: true,
    });
  },

  getMyRooms: async () => {
    return apiFetch(`${BASE_URLS.user}/rooms/me`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  deleteRoom: async (roomId: string) => {
    return apiFetch(`${BASE_URLS.user}/rooms/me`, {
      method: "DELETE",
      body: JSON.stringify({ room_id: roomId }),
      requiresAuth: true,
    });
  },

  // Chat endpoint
  sendChatMessage: async (message: string) => {
    return apiFetch(`${BASE_URLS.chat}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
      requiresAuth: true,
    });
  },
};
