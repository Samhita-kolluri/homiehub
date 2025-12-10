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

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

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

  // Recommendations endpoint
  getRecommendations: async (filters: any = {}) => {
    return apiFetch(`${BASE_URLS.recommendation}/recommendation`, {
      method: "POST",
      body: JSON.stringify(filters),
      requiresAuth: true,
    });
  },

  // Room endpoints
  postRoom: async (data: any) => {
    return apiFetch(`${BASE_URLS.user}/rooms`, {
      method: "POST",
      body: JSON.stringify(data),
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
