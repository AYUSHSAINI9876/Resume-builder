// services/aiService.js
// AI-powered resume assistance using Gemini API (client-side fallback)
import axios from "axios";

// Automatically use relative path '/api' in production (Vercel) and localhost in development
const API_URL = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api";

/**
 * Calculate local ATS score based on resume completeness and keyword density
 * @param {Object} formData - Resume form data
 * @returns {Object} - score (0-100), level, tips[]
 */
export const calculateATSScore = (formData) => {
  let score = 0;
  const tips = [];

  // Basic fields completeness (40 pts)
  if (formData.name?.trim())       score += 8;
  if (formData.email?.trim())      score += 8;
  if (formData.phone?.trim())      score += 6;
  if (formData.summary?.trim())    score += 10;
  else tips.push({ icon: "⚠️", text: "Add a professional summary — ATS systems rank resumes with summaries 40% higher." });

  // Experience quality (25 pts)
  const expWords = formData.experience?.split(/\s+/).length || 0;
  if (expWords >= 60)      score += 25;
  else if (expWords >= 30) score += 15;
  else if (expWords >= 10) score += 8;
  if (expWords < 50) tips.push({ icon: "📝", text: "Expand your experience section — aim for 50+ words with action verbs & metrics." });

  // Skills presence (20 pts)
  const skillCount = formData.skillsList?.length || 0;
  if (skillCount >= 8)     score += 20;
  else if (skillCount >= 5) score += 15;
  else if (skillCount >= 3) score += 8;
  if (skillCount < 6) tips.push({ icon: "🔑", text: `Add more skills — you have ${skillCount}, aim for at least 6-8 relevant ones.` });

  // Education presence (10 pts)
  if (formData.education?.trim()?.length > 20) score += 10;
  else tips.push({ icon: "🎓", text: "Include your education details including degree, institution, and year." });

  // Keyword checks (5 pts)
  const allText = [
    formData.experience, formData.skills, formData.summary
  ].join(" ").toLowerCase();
  const powerWords = ["led","developed","managed","increased","reduced","built","designed","optimized","implemented","delivered"];
  const found = powerWords.filter(w => allText.includes(w));
  score += Math.min(5, found.length);
  if (found.length < 3) tips.push({ icon: "💪", text: "Use action verbs: Led, Developed, Increased, Optimized, Delivered." });

  const level = score >= 75 ? "high" : score >= 45 ? "medium" : "low";

  // Always add a positive tip if missing summary
  if (!tips.length) tips.push({ icon: "✅", text: "Great! Your resume is well-optimized for ATS systems." });

  return { score: Math.min(100, score), level, tips };
};

/**
 * Get AI-powered skill suggestions based on job title / experience text
 * Uses backend Gemini endpoint, falls back to curated local lists
 * @param {string} context - job title or experience text
 * @returns {string[]} suggested skill names
 */
export const getSkillSuggestions = async (context = "") => {
  const ctx = context.toLowerCase();

  // Try backend AI endpoint first
  try {
    const res = await axios.post(`${API_URL}/ai/suggest-skills`, { context }, { timeout: 5000 });
    if (res.data?.skills?.length) return res.data.skills;
  } catch {
    // fall through to local suggestions
  }

  // Curated domain-based fallbacks
  const domains = {
    software: ["JavaScript","TypeScript","React","Node.js","Python","REST APIs","Git","Docker","AWS","SQL","MongoDB","System Design"],
    data: ["Python","Pandas","NumPy","SQL","Machine Learning","TensorFlow","Power BI","Tableau","Statistics","Apache Spark"],
    design: ["Figma","Adobe XD","UI/UX Design","Prototyping","User Research","Wireframing","CSS","Design Systems","Accessibility"],
    marketing: ["SEO","Google Analytics","Content Strategy","Social Media","Email Marketing","A/B Testing","CRM","Copywriting","HubSpot"],
    finance: ["Financial Modeling","Excel","Bloomberg","Risk Management","DCF Analysis","Accounting","QuickBooks","Forecasting"],
    management: ["Team Leadership","Agile","Scrum","Project Management","Stakeholder Management","OKRs","Strategic Planning","Jira"],
  };

  if (ctx.includes("software") || ctx.includes("developer") || ctx.includes("engineer") || ctx.includes("frontend") || ctx.includes("backend")) return domains.software;
  if (ctx.includes("data") || ctx.includes("analyst") || ctx.includes("machine learning") || ctx.includes("ai")) return domains.data;
  if (ctx.includes("design") || ctx.includes("ui") || ctx.includes("ux") || ctx.includes("product")) return domains.design;
  if (ctx.includes("marketing") || ctx.includes("growth") || ctx.includes("content")) return domains.marketing;
  if (ctx.includes("finance") || ctx.includes("accounting") || ctx.includes("invest")) return domains.finance;
  if (ctx.includes("manager") || ctx.includes("lead") || ctx.includes("management")) return domains.management;

  // Generic
  return ["Communication","Problem Solving","Leadership","Microsoft Office","Time Management","Teamwork","Critical Thinking","Adaptability"];
};

/**
 * Get AI-generated professional summary based on user's profile
 * Falls back to a template-based summary generator
 * @param {Object} formData
 * @returns {string} professional summary text
 */
export const generateAISummary = async (formData) => {
  try {
    const res = await axios.post(`${API_URL}/ai/generate-summary`, { formData }, { timeout: 8000 });
    if (res.data?.summary) return res.data.summary;
  } catch {
    // fall through to template
  }

  // Template-based fallback
  const skills = formData.skillsList?.slice(0, 3).join(", ") || "various technologies";
  const name = formData.name || "the candidate";
  return `Results-driven professional with demonstrated expertise in ${skills}. ${name} brings a strong background in ${formData.experience?.split("\n")[0] || "delivering high-impact solutions"}, with a proven ability to drive measurable outcomes. Adept at collaborating cross-functionally and thriving in fast-paced environments. Seeking to leverage technical depth and strategic thinking to contribute meaningfully to a forward-thinking organization.`;
};

/**
 * Get AI-generated experience bullet points
 * @param {string} rawExperience
 * @returns {string} polished experience text
 */
export const enhanceExperience = async (rawExperience) => {
  try {
    const res = await axios.post(`${API_URL}/ai/enhance-experience`, { text: rawExperience }, { timeout: 8000 });
    if (res.data?.enhanced) return res.data.enhanced;
  } catch {
    // fall through
  }

  // Smart local enhancement
  const lines = rawExperience.split("\n").filter(l => l.trim());
  const actionVerbs = ["Developed","Led","Implemented","Optimized","Delivered","Designed","Architected","Managed","Built","Increased"];
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("•") || trimmed.startsWith("-")) return trimmed;
    const verb = actionVerbs[i % actionVerbs.length];
    return `• ${verb} ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
  }).join("\n");
};
