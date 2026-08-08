// backend/routes/ai.js
// AI-powered resume enhancement endpoints using Google Gemini API
const express = require("express");
const router = express.Router();
const https = require("https");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const upload = multer({ storage: multer.memoryStorage() });

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
      // gemini-2.0-flash: current, fast, free-tier-friendly model.
      // (the previously used "gemini-pro" alias is retired on the v1beta API and was failing every call)
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
      timeout: 12000, // avoid hanging serverless invocations if Gemini stalls
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed?.error) {
            return reject(new Error(parsed.error.message || "Gemini API error"));
          }
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          resolve(text.trim());
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("timeout", () => req.destroy(new Error("Gemini request timed out")));
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

/**
 * POST /api/ai/parse-resume
 * Upload a PDF, extract text, and use AI to parse into structured JSON
 */
router.post("/parse-resume", upload.single("resumeFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }

    const prompt = `You are an expert ATS resume parser. Extract the following information from this resume text and return it strictly as a JSON object. 
If a field is missing, leave it as an empty string. Extract skills as an array of strings.

Resume Text:
${text.substring(0, 3000)}

Expected JSON format:
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "123-456-7890",
  "location": "City, State",
  "linkedin": "linkedin.com/in/jane",
  "role": "Current or target job title",
  "summary": "Professional summary paragraph if any",
  "experience": "All work experience blocks, formatted neatly with bullets",
  "education": "Education details",
  "projects": "Projects section if any",
  "certifications": "Certifications if any",
  "skillsList": ["React", "Node", "etc"]
}`;

    let parsedData = null;
    try {
      const raw = await callGemini(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid response format from Gemini");
      }
    } catch (geminiErr) {
      console.warn("Gemini parse failed! Using regex fallback.", geminiErr.message);
      parsedData = {
        name: text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/)?.[0] || "",
        email: text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || "",
        phone: text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/)?.[0] || "",
        location: "",
        linkedin: "",
        role: "Professional",
        summary: "Extracted profile from PDF. Please edit to perfect.",
        experience: "Found Experience Data:\n" + text.substring(0, 300).replace(/\n/g, ' ') + "...",
        education: "Extracted Education:\nAdd details here.",
        projects: "",
        certifications: "",
        skillsList: ["Extracted Skill 1", "Extracted Skill 2"]
      };
    }
    return res.json(parsedData);
  } catch (err) {
    console.error("Parse resume error:", err.message);
    res.status(500).json({ error: "Failed to process resume file" });
  }
});

/**
 * POST /api/ai/parse-voice
 * Parse transcribed voice text either globally into JSON, or formatted for a specific field.
 */
router.post("/parse-voice", async (req, res) => {
  try {
    const { text, targetField } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No voice text provided" });
    }

    if (targetField) {
      // Parse specific field
      const prompt = `You are an expert resume assistant. A user just dictated content for the "${targetField}" section of their resume. 
Format their spoken text into a professional, polished form suitable for a resume. 
Return ONLY the final formatted text string. No markdown block, no JSON. If it's for experience, you can use bullet points.

Spoken Text:
${text.substring(0, 3000)}`;
      
      const raw = await callGemini(prompt);
      return res.json({ formattedText: raw.trim() });
    }

    // Global Parse
    const prompt = `You are an expert ATS resume parser and builder. A user just spoke the following details for their resume. Extract the information and return it strictly as a JSON object. 
If a field is missing, leave it as an empty string. Extract skills as an array of strings.

Spoken Text:
${text.substring(0, 3000)}

Expected JSON format:
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "123-456-7890",
  "location": "City, State",
  "linkedin": "linkedin.com/in/jane",
  "role": "Current or target job title",
  "summary": "Professional summary paragraph if any",
  "experience": "All work experience blocks, formatted neatly with bullets",
  "education": "Education details",
  "projects": "Projects section if any",
  "certifications": "Certifications if any",
  "skillsList": ["React", "Node", "etc"]
}`;

    let parsedData = null;
    try {
      const raw = await callGemini(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid response format from Gemini: " + raw.substring(0, 50));
      }
    } catch (geminiErr) {
      console.warn("Gemini parse failed! Using regex fallback.", geminiErr.message);
      // Regex fallback if API key is invalid or Gemini is down
      parsedData = {
        name: (text.match(/(?:my name is|i am)\s+([A-Z][a-z]+ [A-Z][a-z]+)/i) || [])[1] || "",
        email: (text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})/i) || [])[1] || "",
        phone: (text.match(/(\+?\d[\d\s-]{8,}\d)/) || [])[1] || "",
        experience: text // Just dump the whole text into experience as a worst-case fallback
      };
    }
    
    // Check if totally empty
    const hasAnyData = Object.values(parsedData).some(val => val && String(val).trim() !== "");
    if (!hasAnyData) {
       return res.status(500).json({ error: "AI failed to extract any meaningful information from your speech." });
    }
    return res.json(parsedData);
  } catch (err) {
    console.error("Parse voice error:", err.message);
    res.status(500).json({ error: "Failed to process voice text" });
  }
});

/**
 * POST /api/ai/review-and-improve
 * Review the entire resume and provide fixed/improved content
 */
router.post("/review-and-improve", async (req, res) => {
  try {
    const { formData } = req.body;
    
    const resumeText = `
Name: ${formData.name}
Role: ${formData.role}
Summary: ${formData.summary}
Experience: ${formData.experience}
Skills: ${formData.skillsList?.join(", ")}
    `.substring(0, 3000);

    const prompt = `Review this resume content. Provide an ATS score (0-100), identify 3 specific missing features or critical flaws, and rewrite the summary and experience sections to completely fix these flaws using action verbs and metrics. 
Return strictly as JSON.

Resume Content:
${resumeText}

Expected JSON format:
{
  "atsScore": 85,
  "flaws": ["Missing numbers in experience", "Summary too generic", "No specific framework mentioned"],
  "improvedSummary": "A highly impactful summary...",
  "improvedExperience": "• Led a team of 5 to develop...\\n• Reduced load time by 40%..."
}`;

    let result = null;
    try {
      const raw = await callGemini(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (geminiErr) {
      console.warn("Gemini full review failed! Using local fallback.", geminiErr.message);
      result = {
        atsScore: 78,
        flaws: [
          "Please verify your API Key is correctly placed in .env",
          "Ensure your experience bullet points include measurable metrics (%, $, numbers)",
          "Avoid using passive voice; start bullets with strong Action Verbs"
        ],
        improvedSummary: formData.summary ? formData.summary + " [AI Note: Include more distinct keywords here]" : "Results-driven professional dedicated to continuous improvement and high-impact deliveries.",
        improvedExperience: formData.experience ? formData.experience : "• Orchestrated major project deliverables resulting in key business conversions.\n• Delivered high quality code on time.",
      };
    }
    return res.json(result);
  } catch (err) {
    console.error("Gemini full review error:", err.message);
    res.status(500).json({ error: "Failed to review and improve resume" });
  }
});

module.exports = router;
