const express = require("express");
const router = express.Router();
const Resume = require("../models/resume.js");
const { requireAuth } = require("../middleware/auth.js");

// All resume routes require a logged-in user, and are always scoped to that user
router.use(requireAuth);

// Add a new resume
router.post("/add", async (req, res) => {
  try {
    const newResume = new Resume({ ...req.body, user: req.userId });
    await newResume.save();
    res.status(201).json(newResume);
  } catch (err) {
    console.error("Error saving resume:", err);
    res.status(400).json({ message: "Failed to save resume. Please try again." });
  }
});

// GET request to fetch all of the current user's resumes
router.get("/all", async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.userId }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET request to fetch one of the current user's resumes by ID
router.get("/:id", async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.userId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT request to update one of the current user's resumes
router.put("/:id", async (req, res) => {
  try {
    const { user, _id, createdAt, updatedAt, ...updates } = req.body;
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (err) {
    console.error("Error updating resume:", err);
    res.status(400).json({ message: "Failed to update resume. Please try again." });
  }
});

// DELETE request to remove one of the current user's resumes
router.delete("/:id", async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json({ message: "Resume deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
