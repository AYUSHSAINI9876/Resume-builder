// backend/server.js — Enhanced with AI routes + dotenv
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    // Never fall back silently in production — an insecure default would let
    // anyone forge a valid login session.
    throw new Error("JWT_SECRET must be set in the production environment.");
  }
  console.warn("⚠️  JWT_SECRET is not set in .env — using an insecure fallback for local dev only.");
  process.env.JWT_SECRET = "dev-only-insecure-secret-change-me";
}

const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const aiRoutes = require("./routes/ai");

const app = express();

// Running behind a reverse proxy (Vercel, most hosts) — trust the first hop's
// X-Forwarded-For so rate limiting keys on the real client IP, not the proxy.
app.set("trust proxy", 1);

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));

// Allowlist: localhost for dev + any origins configured via CLIENT_ORIGIN (comma-separated)
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim()) : []),
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin/non-browser requests (no origin header) and configured origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Health check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "OK", message: "ResumeAI Backend Running" }));
app.get("/health", (req, res) => res.json({ status: "healthy", timestamp: new Date().toISOString() }));

// ── MongoDB connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/resumeBuilder";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.warn("⚠️  MongoDB not connected (offline mode):", err.message));

// ── Rate limiting for costly/abuse-prone AI endpoints ────────────────────────
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please slow down and try again shortly." },
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ResumeAI backend running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? "✅ Configured" : "⚠️  Not configured (set GEMINI_API_KEY in .env)"}`);
});

module.exports = app;
