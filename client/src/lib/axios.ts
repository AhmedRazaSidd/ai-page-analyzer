import axios from "axios";

export const ANONYMOUS_TOKEN_KEY = "ai-page-assistant:anonymous-token";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(ANONYMOUS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(ANONYMOUS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ANONYMOUS_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers["x-anonymous-token"] = token;
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
