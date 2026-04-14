// backend/routes/ai.js
// AI-powered resume enhancement endpoints using Google Gemini API
const express = require("express");
const router = express.Router();
const https = require("https");

/**
 * Helper: Call Gemini API (gemini-pro)
 * @param {string} prompt
 * @returns {Promise<string>}
 */
const callGemini = (prompt) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return reject(new Error("GEMINI_API_KEY not configured"));
    }

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          resolve(text.trim());
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

/**
 * POST /api/ai/generate-summary
 * Generate a professional summary from resume data
 */
router.post("/generate-summary", async (req, res) => {
  try {
    const { formData } = req.body;
    const prompt = `Write a concise, compelling 3-sentence professional resume summary for someone named ${
      formData.name || "the candidate"
    } applying for a ${formData.role || "professional"} role.
Their experience: ${formData.experience?.substring(0, 300) || "not provided"}.
Their skills: ${formData.skillsList?.join(", ") || "not provided"}.

Requirements:
- Start with a strong adjective (e.g. "Results-driven", "Innovative", "Strategic")  
- Include 1-2 specific skills or achievements
- End with their career goal
- Keep it under 80 words
- Do NOT include bullet points, just plain text paragraph`;

    const summary = await callGemini(prompt);
    res.json({ summary });
  } catch (err) {
    console.error("Gemini summary error:", err.message);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

/**
 * POST /api/ai/enhance-experience
 * Enhance raw experience text with action verbs and impact language
 */
router.post("/enhance-experience", async (req, res) => {
  try {
    const { text } = req.body;
    const prompt = `Enhance the following resume experience section. Rewrite each bullet point to:
1. Start with a strong action verb (e.g. Led, Developed, Optimized, Delivered)
2. Include quantifiable metrics where possible
3. Highlight business impact
4. Be concise (under 20 words per bullet)

Original text:
${text}

Return ONLY the enhanced bullet points, one per line starting with "•". No explanations.`;

    const enhanced = await callGemini(prompt);
    res.json({ enhanced });
  } catch (err) {
    console.error("Gemini enhance error:", err.message);
    res.status(500).json({ error: "Failed to enhance experience" });
  }
});

/**
 * POST /api/ai/suggest-skills
 * Suggest relevant skills based on job context
 */
router.post("/suggest-skills", async (req, res) => {
  try {
    const { context } = req.body;
    const prompt = `Based on this job context: "${context.substring(0, 300)}"
Suggest exactly 8 highly relevant professional skills.
Return ONLY a JSON array of skill name strings, like: ["React","Node.js","MongoDB"]
No explanations, just the JSON array.`;

    const raw = await callGemini(prompt);
    // Extract JSON array from response
    const match = raw.match(/\[.*?\]/s);
    if (match) {
      const skills = JSON.parse(match[0]);
      return res.json({ skills });
    }
    res.status(500).json({ error: "Could not parse skills" });
  } catch (err) {
    console.error("Gemini skills error:", err.message);
    res.status(500).json({ error: "Failed to suggest skills" });
  }
});

/**
 * POST /api/ai/check-ats
 * Detailed ATS analysis of resume content
 */
router.post("/check-ats", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    const prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility.
Resume:
${resumeText.substring(0, 800)}

${jobDescription ? `Job Description:\n${jobDescription.substring(0, 400)}` : ""}

Provide:
1. ATS score (0-100)
2. Top 3 improvements needed
Return as JSON: {"score": 75, "tips": ["tip1", "tip2", "tip3"]}`;

    const raw = await callGemini(prompt);
    const match = raw.match(/\{.*?\}/s);
    if (match) {
      const result = JSON.parse(match[0]);
      return res.json(result);
    }
    res.status(500).json({ error: "Could not parse ATS result" });
  } catch (err) {
    console.error("Gemini ATS error:", err.message);
    res.status(500).json({ error: "Failed to check ATS score" });
  }
});

module.exports = router;
