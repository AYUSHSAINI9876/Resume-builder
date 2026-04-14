// backend/models/resume.js — Extended schema with all new fields
const mongoose = require("mongoose");

/**
 * Resume Schema - stores all resume data with full field support
 */
const resumeSchema = new mongoose.Schema(
  {
    // Basic Info
    name:           { type: String, required: true, trim: true },
    email:          { type: String, required: true, trim: true, lowercase: true },
    phone:          { type: String, required: true, trim: true },
    location:       { type: String, trim: true },
    linkedin:       { type: String, trim: true },
    role:           { type: String, trim: true },

    // Content
    summary:        { type: String, default: "" },
    experience:     { type: String, required: true, default: "" },
    education:      { type: String, default: "" },
    skills:         { type: String, default: "" },         // comma-separated string
    skillsList:     { type: [String], default: [] },       // array of individual skills
    projects:       { type: String, default: "" },
    certifications: { type: String, default: "" },

    // Meta
    templateId:     { type: Number, default: 1 },
    atsScore:       { type: Number, default: 0 },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Resume", resumeSchema);
