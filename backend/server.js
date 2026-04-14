// backend/server.js — Enhanced with AI routes + dotenv
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const resumeRoutes = require("./routes/resume");
const aiRoutes = require("./routes/ai");

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
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

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/resumes", resumeRoutes);
app.use("/api/ai", aiRoutes);

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
