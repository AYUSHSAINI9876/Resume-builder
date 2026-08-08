// backend/models/otp.js — Short-lived one-time passcodes for email verification
const mongoose = require("mongoose");

/**
 * OTP Schema
 * Codes are stored hashed (never in plaintext) and auto-expire via a TTL index,
 * so stale codes clean themselves up without a cron job.
 */
const otpSchema = new mongoose.Schema(
  {
    email:    { type: String, required: true, trim: true, lowercase: true, index: true },
    purpose:  { type: String, required: true, enum: ["signup", "login"] },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index: MongoDB removes each document once expiresAt passes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
