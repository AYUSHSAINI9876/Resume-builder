// pages/RegisterPage.js — Email-OTP verified signup
// Step 1: email → send code · Step 2: enter code · Step 3: name + password
import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Logo from "../components/Logo";
import OtpInput from "../components/OtpInput";
import { IconArrowLeft, IconMail, IconShieldCheck } from "../components/Icons";

const RegisterPage = () => {
  const { user, sendOtp, verifyOtp, completeSignup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/dashboard";

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [details, setDetails] = useState({ name: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  if (user) return <Navigate to={redirectTo} replace />;

  const startCooldown = (seconds = 45) => setCooldown(seconds);

  // ── Step 1: request a code ──────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(email.trim().toLowerCase(), "signup");
      setStep(2);
      setCode("");
      startCooldown(res.resendCooldownSeconds || 45);
      showToast("success", `Verification code sent to ${email.trim().toLowerCase()}`);
      if (res.devCode) {
        showToast("info", `Dev mode — your code is ${res.devCode}`, 60000);
      }
    } catch (err) {
      setError(err.message);
      if (err.code === "ACCOUNT_EXISTS") {
        setTimeout(() => navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`), 1600);
      }
      if (err.retryAfterSeconds) startCooldown(err.retryAfterSeconds);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify the code ─────────────────────────────────────────────
  const handleVerify = async (submittedCode) => {
    const finalCode = (submittedCode || code).replace(/\s/g, "");
    setError("");
    if (finalCode.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(email.trim().toLowerCase(), finalCode, "signup");
      setSignupToken(res.signupToken);
      setStep(3);
      showToast("success", "Email verified!");
    } catch (err) {
      setError(err.message);
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: finish the account ──────────────────────────────────────────
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!details.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (details.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (details.password !== details.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const created = await completeSignup(signupToken, details.name.trim(), details.password);
      showToast("success", `Welcome, ${created.name.split(" ")[0]}! Your account is ready.`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepMeta = {
    1: { title: "Sign-Up", sub: "We'll send an OTP to the email for verification." },
    2: { title: "Verify your email", sub: `Enter the 6-digit code we sent to ${email.trim().toLowerCase()}` },
    3: { title: "Almost there", sub: "Set your name and a password to finish creating your account." },
  }[step];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <Logo size={40} idSuffix="auth" className="auth-logo" />
          <h1>{stepMeta.title}</h1>
          <p>{stepMeta.sub}</p>
        </div>

        {/* Progress */}
        <div className="auth-steps" aria-hidden="true">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`auth-step-dot ${step >= s ? "active" : ""}`} />
          ))}
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Id</label>
              <input
                id="email" name="email" type="email" className="form-input" autoComplete="email"
                placeholder="you@example.com" value={email} autoFocus
                onChange={(e) => setEmail(e.target.value)}
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

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <OtpInput
              value={code}
              onChange={setCode}
              onComplete={handleVerify}
              disabled={loading}
            />
            <button
              className="btn-primary auth-submit-btn"
              onClick={() => handleVerify()}
              disabled={loading}
            >
              {loading
                ? <><span className="loading-spinner" /> Verifying…</>
                : <><IconShieldCheck size={17} /> Verify Code</>}
            </button>

            <div className="auth-resend-row">
              <button
                type="button"
                className="auth-link-btn"
                onClick={handleSendOtp}
                disabled={cooldown > 0 || loading}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => { setStep(1); setCode(""); setError(""); }}
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

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <form onSubmit={handleCompleteSignup} noValidate>
            <div className="auth-verified-badge">
              <IconShieldCheck size={15} /> {email.trim().toLowerCase()} verified
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name" name="name" type="text" className="form-input" autoComplete="name"
                placeholder="Ayush Saini" value={details.name} autoFocus
                onChange={(e) => setDetails((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password" className="form-input" autoComplete="new-password"
                placeholder="At least 6 characters" value={details.password}
                onChange={(e) => setDetails((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm" name="confirm" type="password" className="form-input" autoComplete="new-password"
                placeholder="Repeat password" value={details.confirm}
                onChange={(e) => setDetails((p) => ({ ...p, confirm: e.target.value }))}
              />
            </div>
            <button className="btn-primary auth-submit-btn" type="submit" disabled={loading}>
              {loading
                ? <><span className="loading-spinner" /> Creating account…</>
                : "Create Account"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
