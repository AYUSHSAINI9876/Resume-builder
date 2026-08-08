// services/api.js — Single shared axios instance for the whole app.
// Centralizing this avoids duplicated base-URL logic and inconsistent timeouts,
// and gives us one place to attach auth tokens / handle 401s globally.
import axios from "axios";

// Where the API lives:
//  - REACT_APP_API_URL wins when set (backend hosted separately, e.g. Render).
//    Set it to the backend origin, with or without a trailing "/api".
//  - Otherwise use a same-origin relative path in production (single Vercel
//    project serving both frontend and serverless backend), and localhost in dev.
const resolveBaseUrl = () => {
  const configured = process.env.REACT_APP_API_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured.endsWith("/api") ? configured : `${configured}/api`;
  return process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api";
};

const BASE_URL = resolveBaseUrl();
const TOKEN_KEY = "resumeai_token";
const USER_KEY = "resumeai_user";

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Notify the app (AuthContext) to log out on any 401, without a circular import.
let onUnauthorized = null;
export const registerUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      authStorage.clearSession();
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(err);
  }
);

export default api;
