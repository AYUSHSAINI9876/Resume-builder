// context/AuthContext.js — Authentication state shared across the app
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { authStorage, registerUnauthorizedHandler } from "../services/api";

const AuthContext = createContext(null);

const extractError = (err, fallback) => err.response?.data?.message || fallback;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(() => {
    authStorage.clearSession();
    setUser(null);
  }, []);

  // Trust the cached user for an instant UI, then silently verify with the server.
  useEffect(() => {
    registerUnauthorizedHandler(() => setUser(null));

    const token = authStorage.getToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        authStorage.setSession(token, res.data.user);
      })
      .catch(() => authStorage.clearSession())
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      authStorage.setSession(res.data.token, res.data.user);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw new Error(extractError(err, "Failed to log in."));
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      authStorage.setSession(res.data.token, res.data.user);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw new Error(extractError(err, "Failed to register."));
    }
  }, []);

  // ── OTP email verification ────────────────────────────────────────────────

  /** Ask the backend to email a 6-digit code. purpose: "signup" | "login" */
  const sendOtp = useCallback(async (email, purpose) => {
    try {
      const res = await api.post("/auth/send-otp", { email, purpose });
      return res.data;
    } catch (err) {
      const error = new Error(extractError(err, "Failed to send verification code."));
      error.code = err.response?.data?.code;
      error.retryAfterSeconds = err.response?.data?.retryAfterSeconds;
      throw error;
    }
  }, []);

  /**
   * Verify a code.
   * purpose "login"  -> logs the user straight in and returns { user }
   * purpose "signup" -> returns { signupToken } to pass to completeSignup
   */
  const verifyOtp = useCallback(async (email, code, purpose) => {
    try {
      const res = await api.post("/auth/verify-otp", { email, code, purpose });
      if (purpose === "login" && res.data.token) {
        authStorage.setSession(res.data.token, res.data.user);
        setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      throw new Error(extractError(err, "Failed to verify code."));
    }
  }, []);

  /** Finish a verified signup by setting name + password. */
  const completeSignup = useCallback(async (signupToken, name, password) => {
    try {
      const res = await api.post("/auth/complete-signup", { signupToken, name, password });
      authStorage.setSession(res.data.token, res.data.user);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw new Error(extractError(err, "Failed to create your account."));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, login, register, logout, sendOtp, verifyOtp, completeSignup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
