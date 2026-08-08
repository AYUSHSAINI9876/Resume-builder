// pages/LoginPage.js — Password login plus passwordless email-OTP login
import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Logo from "../components/Logo";
import OtpInput from "../components/OtpInput";
import { IconArrowLeft, IconLock, IconMail, IconShieldCheck } from "../components/Icons";

const LoginPage = () => {
  const { login, user, sendOtp, verifyOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/dashboard";

  const [mode, setMode] = useState("password"); // "password" | "otp"
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  if (user) return <Navigate to={redirectTo} replace />;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setCode("");
    setOtpSent(false);
  };

  // ── Password login ──────────────────────────────────────────────────────
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      showToast("success", "Welcome back!");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP login ───────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(form.email.trim().toLowerCase(), "login");
      setOtpSent(true);
      setCode("");
      setCooldown(res.resendCooldownSeconds || 45);
      showToast("success", `Login code sent to ${form.email.trim().toLowerCase()}`);
      if (res.devCode) showToast("info", `Dev mode — your code is ${res.devCode}`, 60000);
    } catch (err) {
      setError(err.message);
      if (err.code === "NO_ACCOUNT") {
        setTimeout(() => navigate(`/register?redirect=${encodeURIComponent(redirectTo)}`), 1600);
      }
      if (err.retryAfterSeconds) setCooldown(err.retryAfterSeconds);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (submittedCode) => {
    const finalCode = (submittedCode || code).replace(/\s/g, "");
    setError("");
    if (finalCode.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(form.email.trim().toLowerCase(), finalCode, "login");
      showToast("success", "Welcome back!");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const heading = mode === "otp" && otpSent ? "Enter your code" : "Welcome back";
  const subtext =
    mode === "otp"
      ? otpSent
        ? `We sent a 6-digit code to ${form.email.trim().toLowerCase()}`
        : "We'll send an OTP to the email to log you in."
      : "Log in to access your saved resumes.";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <Logo size={40} idSuffix="auth" className="auth-logo" />
          <h1>{heading}</h1>
          <p>{subtext}</p>
        </div>

        {/* Mode switcher */}
        {!otpSent && (
          <div className="auth-mode-toggle" role="tablist">
            <button
              type="button" role="tab" aria-selected={mode === "password"}
              className={mode === "password" ? "active" : ""}
              onClick={() => switchMode("password")}
            >
              <IconLock size={15} /> Password
            </button>
            <button
              type="button" role="tab" aria-selected={mode === "otp"}
              className={mode === "otp" ? "active" : ""}
              onClick={() => switchMode("otp")}
            >
              <IconMail size={15} /> Email OTP
            </button>
          </div>
        )}

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {/* ── Password mode ── */}
        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Id</label>
              <input
                id="email" name="email" type="email" className="form-input" autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password" className="form-input" autoComplete="current-password"
                placeholder="••••••••" value={form.password} onChange={handleChange}
              />
            </div>
            <button className="btn-primary auth-submit-btn" type="submit" disabled={loading}>
              {loading ? <><span className="loading-spinner" /> Logging in…</> : "Log In"}
            </button>
          </form>
        )}

        {/* ── OTP mode: request ── */}
        {mode === "otp" && !otpSent && (
          <form onSubmit={handleSendOtp} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Id</label>
              <input
                id="email" name="email" type="email" className="form-input" autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={handleChange}
              />
            </div>
            <button className="btn-primary auth-submit-btn" type="submit" disabled={loading}>
              {loading
                ? <><span className="loading-spinner" /> Sending…</>
                : <><IconMail size={17} /> Send OTP</>}
            </button>
            <p className="auth-hint">
              Didn't receive the OTP? Check your <strong>spam folder</strong>.
            </p>
          </form>
        )}

        {/* ── OTP mode: verify ── */}
        {mode === "otp" && otpSent && (
          <div>
            <OtpInput value={code} onChange={setCode} onComplete={handleVerifyOtp} disabled={loading} />
            <button
              className="btn-primary auth-submit-btn"
              onClick={() => handleVerifyOtp()}
              disabled={loading}
            >
              {loading
                ? <><span className="loading-spinner" /> Verifying…</>
                : <><IconShieldCheck size={17} /> Verify & Log In</>}
            </button>

            <div className="auth-resend-row">
              <button
                type="button" className="auth-link-btn"
                onClick={handleSendOtp} disabled={cooldown > 0 || loading}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
              <button
                type="button" className="auth-link-btn"
                onClick={() => { setOtpSent(false); setCode(""); setError(""); }}
                disabled={loading}
              >
                <IconArrowLeft size={14} /> Change email
              </button>
            </div>

            <p className="auth-hint">
              Didn't receive the OTP? Check your <strong>spam folder</strong>.
            </p>
          </div>
        )}

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
