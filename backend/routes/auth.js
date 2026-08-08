// backend/routes/auth.js — Registration, login, OTP email verification, current user
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const User = require("../models/user.js");
const Otp = require("../models/otp.js");
const { requireAuth } = require("../middleware/auth.js");
const { sendOtpEmail, isConfigured } = require("../services/email.js");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MINUTES = 10;
const OTP_RESEND_COOLDOWN_MS = 45 * 1000;
const OTP_MAX_ATTEMPTS = 5;

// Brute-force / credential-stuffing guard on register + login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

// Keyed by email so one abusive address can't be masked behind rotating IPs
// (and so a shared office IP doesn't lock out innocent users).
const byEmail = (req) => (req.body?.email || "").trim().toLowerCase() || "unknown";

// Sending email costs money and can be used to spam a victim's inbox — keep it tight.
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: byEmail,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many codes requested for this email. Please wait 15 minutes." },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyGenerator: byEmail,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many verification attempts. Please request a new code shortly." },
});

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Short-lived, narrowly-scoped token proving "this email just passed OTP".
// Scoped so it can never be used as a normal session token.
const signSignupToken = (email) =>
  jwt.sign({ email, scope: "signup" }, process.env.JWT_SECRET, { expiresIn: "15m" });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
});

// crypto.randomInt gives a uniform, cryptographically secure 6-digit code
// (Math.random is predictable and unsuitable for anything auth-related).
const generateCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

/**
 * POST /api/auth/send-otp
 * Body: { email, purpose: "signup" | "login" }
 */
router.post("/send-otp", otpSendLimiter, async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const purpose = req.body.purpose === "login" ? "login" : "signup";

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const existing = await User.findOne({ email });
    if (purpose === "signup" && existing) {
      return res.status(409).json({
        message: "An account with this email already exists. Please log in instead.",
        code: "ACCOUNT_EXISTS",
      });
    }
    if (purpose === "login" && !existing) {
      return res.status(404).json({
        message: "No account found with this email. Please sign up first.",
        code: "NO_ACCOUNT",
      });
    }

    // Don't let a user hammer "resend" — one code every 45s per email.
    const recent = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });
    if (recent && Date.now() - recent.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime())) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${waitSeconds}s before requesting another code.`,
        retryAfterSeconds: waitSeconds,
      });
    }

    // Only one live code per email+purpose at a time.
    await Otp.deleteMany({ email, purpose });

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    await Otp.create({
      email,
      purpose,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    });

    const result = await sendOtpEmail({ email, code, purpose, expiresInMinutes: OTP_TTL_MINUTES });

    res.json({
      message: `Verification code sent to ${email}.`,
      expiresInMinutes: OTP_TTL_MINUTES,
      resendCooldownSeconds: OTP_RESEND_COOLDOWN_MS / 1000,
      // Dev-only convenience so the flow is testable before SendGrid is wired up.
      ...(result.devFallback ? { devCode: code, devNotice: "SendGrid not configured — code returned for local testing only." } : {}),
    });
  } catch (err) {
    console.error("Send OTP error:", err.message);
    res.status(500).json({ message: err.message || "Failed to send verification code." });
  }
});

/**
 * POST /api/auth/verify-otp
 * Body: { email, code, purpose }
 * login  -> returns a full session token
 * signup -> returns a short-lived signupToken to complete registration
 */
router.post("/verify-otp", otpVerifyLimiter, async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const code = (req.body.code || "").trim();
    const purpose = req.body.purpose === "login" ? "login" : "signup";

    if (!EMAIL_REGEX.test(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "Please enter the 6-digit code sent to your email." });
    }

    const record = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });
    if (!record || record.consumed || record.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "This code has expired. Please request a new one." });
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many incorrect attempts. Please request a new code." });
    }

    const valid = await bcrypt.compare(code, record.codeHash);
    if (!valid) {
      record.attempts += 1;
      await record.save();
      const left = Math.max(0, OTP_MAX_ATTEMPTS - record.attempts);
      return res.status(400).json({
        message: left
          ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} remaining.`
          : "Too many incorrect attempts. Please request a new code.",
        attemptsRemaining: left,
      });
    }

    record.consumed = true;
    await record.save();

    if (purpose === "login") {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "No account found with this email." });
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
      await Otp.deleteMany({ email, purpose });
      return res.json({ token: signToken(user._id), user: publicUser(user) });
    }

    await Otp.deleteMany({ email, purpose });
    res.json({
      verified: true,
      signupToken: signSignupToken(email),
      email,
    });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ message: "Failed to verify code. Please try again." });
  }
});

/**
 * POST /api/auth/complete-signup
 * Body: { signupToken, name, password }
 */
router.post("/complete-signup", authLimiter, async (req, res) => {
  try {
    const { signupToken, name: rawName, password } = req.body;
    const name = (rawName || "").trim();

    if (!signupToken) {
      return res.status(400).json({ message: "Verification expired. Please start again." });
    }
    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    let payload;
    try {
      payload = jwt.verify(signupToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Verification expired. Please request a new code." });
    }
    if (payload.scope !== "signup" || !payload.email) {
      return res.status(400).json({ message: "Invalid verification token." });
    }

    const email = payload.email;
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "An account with this email already exists. Please log in." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, emailVerified: true });

    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    console.error("Complete signup error:", err.message);
    res.status(500).json({ message: "Failed to create account. Please try again." });
  }
});

// POST /api/auth/register — direct password signup (no email verification)
router.post("/register", authLimiter, async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Failed to register. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", authLimiter, async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Failed to log in. Please try again." });
  }
});

// GET /api/auth/me — returns the current authenticated user
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user." });
  }
});

// GET /api/auth/email-status — lets the UI explain why codes aren't arriving
router.get("/email-status", (req, res) => {
  res.json({ emailConfigured: isConfigured() });
});

module.exports = router;
