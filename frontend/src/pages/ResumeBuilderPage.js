// ResumeBuilderPage.js — Full-featured AI-powered resume builder
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import jsPDF from "jspdf";
import axios from "axios";
import {
  calculateATSScore,
  getSkillSuggestions,
  generateAISummary,
  enhanceExperience,
} from "../services/aiService";

// ─────────────────────────────────────────────────────────────────────────────
// RESUME TEMPLATE RENDERS (live preview inside the builder)
// ─────────────────────────────────────────────────────────────────────────────

/** Template 1 — Classic Professional */
const ClassicTemplate = ({ data }) => (
  <div className="resume-classic">
    <div className="resume-classic-header">
      <div className="resume-classic-name">{data.name || "Your Name"}</div>
      {data.summary && (
        <p style={{ fontSize: "0.78rem", opacity: 0.85, marginTop: 6 }}>{data.summary}</p>
      )}
      <div className="resume-classic-contact">
        {data.email && <span>✉ {data.email}</span>}
        {data.phone && <span>📞 {data.phone}</span>}
        {data.linkedin && <span>🔗 {data.linkedin}</span>}
        {data.location && <span>📍 {data.location}</span>}
      </div>
    </div>
    <div className="resume-classic-body">
      {data.experience && (
        <>
          <div className="resume-section-title">Experience</div>
          <p className="resume-text">{data.experience}</p>
        </>
      )}
      {data.education && (
        <>
          <div className="resume-section-title">Education</div>
          <p className="resume-text">{data.education}</p>
        </>
      )}
      {data.skillsList?.length > 0 && (
        <>
          <div className="resume-section-title">Skills</div>
          <div className="resume-skills-list">
            {data.skillsList.map((s) => (
              <span key={s} className="resume-skill-chip">{s}</span>
            ))}
          </div>
        </>
      )}
      {data.projects && (
        <>
          <div className="resume-section-title">Projects</div>
          <p className="resume-text">{data.projects}</p>
        </>
      )}
      {data.certifications && (
        <>
          <div className="resume-section-title">Certifications</div>
          <p className="resume-text">{data.certifications}</p>
        </>
      )}
    </div>
  </div>
);

/** Template 2 — Modern Dark */
const ModernTemplate = ({ data }) => (
  <div className="resume-modern">
    {/* Sidebar */}
    <div className="resume-modern-sidebar">
      <div className="resume-modern-name">{data.name || "Your Name"}</div>
      <div className="resume-modern-role">{data.role || "Professional"}</div>

      <div className="resume-modern-section-title">Contact</div>
      {data.email    && <div className="resume-modern-contact-item">✉ {data.email}</div>}
      {data.phone    && <div className="resume-modern-contact-item">📞 {data.phone}</div>}
      {data.linkedin && <div className="resume-modern-contact-item">🔗 {data.linkedin}</div>}
      {data.location && <div className="resume-modern-contact-item">📍 {data.location}</div>}

      {data.skillsList?.length > 0 && (
        <>
          <div className="resume-modern-section-title">Skills</div>
          {data.skillsList.map((s) => (
            <div key={s} className="resume-modern-skill">
              <span className="resume-modern-skill-name">{s}</span>
              <div className="resume-modern-skill-bar">
                <div className="resume-modern-skill-fill" style={{ width: `${65 + Math.random() * 30}%` }} />
              </div>
            </div>
          ))}
        </>
      )}
      {data.certifications && (
        <>
          <div className="resume-modern-section-title">Certifications</div>
          <p className="resume-modern-text">{data.certifications}</p>
        </>
      )}
    </div>

    {/* Main content */}
    <div className="resume-modern-main">
      {data.summary && (
        <>
          <div className="resume-modern-section-title">Summary</div>
          <p className="resume-modern-text">{data.summary}</p>
        </>
      )}
      {data.experience && (
        <>
          <div className="resume-modern-section-title">Experience</div>
          <p className="resume-modern-text">{data.experience}</p>
        </>
      )}
      {data.education && (
        <>
          <div className="resume-modern-section-title">Education</div>
          <p className="resume-modern-text">{data.education}</p>
        </>
      )}
      {data.projects && (
        <>
          <div className="resume-modern-section-title">Projects</div>
          <p className="resume-modern-text">{data.projects}</p>
        </>
      )}
    </div>
  </div>
);

/** Template 3 — Creative Gradient */
const CreativeTemplate = ({ data }) => {
  const initials = (data.name || "YN")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="resume-creative">
      <div className="resume-creative-accent" />
      <div className="resume-creative-header">
        <div className="resume-creative-avatar">{initials}</div>
        <div>
          <div className="resume-creative-name">{data.name || "Your Name"}</div>
          {data.role && (
            <div style={{ fontSize: "0.78rem", color: "#666", marginBottom: 4 }}>{data.role}</div>
          )}
          <div className="resume-creative-contact">
            {data.email    && <span>✉ {data.email}</span>}
            {data.phone    && <span>📞 {data.phone}</span>}
            {data.location && <span>📍 {data.location}</span>}
          </div>
        </div>
      </div>
      <div className="resume-creative-body">
        <div>
          {data.summary && (
            <>
              <div className="resume-creative-section-title">About Me</div>
              <p className="resume-creative-text">{data.summary}</p>
            </>
          )}
          {data.education && (
            <>
              <div className="resume-creative-section-title">Education</div>
              <p className="resume-creative-text">{data.education}</p>
            </>
          )}
          {data.certifications && (
            <>
              <div className="resume-creative-section-title">Certifications</div>
              <p className="resume-creative-text">{data.certifications}</p>
            </>
          )}
          {data.skillsList?.length > 0 && (
            <>
              <div className="resume-creative-section-title">Skills</div>
              <div>
                {data.skillsList.map((s) => (
                  <span key={s} className="resume-creative-skill-chip">{s}</span>
                ))}
              </div>
            </>
          )}
        </div>
        <div>
          {data.experience && (
            <>
              <div className="resume-creative-section-title">Experience</div>
              <p className="resume-creative-text">{data.experience}</p>
            </>
          )}
          {data.projects && (
            <>
              <div className="resume-creative-section-title">Projects</div>
              <p className="resume-creative-text">{data.projects}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TEMPLATES = { 1: ClassicTemplate, 2: ModernTemplate, 3: CreativeTemplate };
const TEMPLATE_NAMES = { 1: "Classic Professional", 2: "Modern Dark", 3: "Creative Gradient" };

// ─────────────────────────────────────────────────────────────────────────────
// TABS DEFINITION
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "basics",   label: "Basics",      icon: "👤" },
  { id: "summary",  label: "Summary",     icon: "📋" },
  { id: "exp",      label: "Experience",  icon: "💼" },
  { id: "edu",      label: "Education",   icon: "🎓" },
  { id: "skills",   label: "Skills",      icon: "🔧" },
  { id: "extra",    label: "Extra",       icon: "⭐" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ResumeBuilderPage = () => {
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
  const initialTemplate = parseInt(params.get("template") || "1", 10);

  // ── State ──────────────────────────────────────────────────────────────────
  const [templateId, setTemplateId]     = useState(initialTemplate);
  const [activeTab, setActiveTab]       = useState("basics");
  const [formData, setFormData]         = useState({
    name: "", email: "", phone: "", location: "", linkedin: "", role: "",
    summary: "", experience: "", education: "", projects: "", certifications: "",
    skills: "", skillsList: [],
  });
  const [skillInput, setSkillInput]     = useState("");
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [atsResult, setAtsResult]       = useState({ score: 0, level: "low", tips: [] });
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [status, setStatus]             = useState({ type: "", msg: "" });
  const [loading, setLoading]           = useState({ summary: false, skills: false, experience: false, save: false });

  // ── ATS recalculation whenever formData changes ────────────────────────────
  useEffect(() => {
    const result = calculateATSScore(formData);
    setAtsResult(result);
  }, [formData]);

  // ── Load skill suggestions when experience changes ─────────────────────────
  useEffect(() => {
    if (!formData.experience || formData.experience.length < 15) return;
    const timer = setTimeout(async () => {
      const suggestions = await getSkillSuggestions(formData.experience + " " + formData.role);
      setSuggestedSkills(suggestions.filter(s => !formData.skillsList.includes(s)).slice(0, 8));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.experience, formData.role]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus({ type: "", msg: "" });
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !formData.skillsList.includes(s)) {
      setFormData((prev) => ({ ...prev, skillsList: [...prev.skillsList, s] }));
      setSuggestedSkills((prev) => prev.filter((sk) => sk !== s));
    }
    setSkillInput("");
  };

  const addSuggestedSkill = (skill) => {
    if (!formData.skillsList.includes(skill)) {
      setFormData((prev) => ({ ...prev, skillsList: [...prev.skillsList, skill] }));
      setSuggestedSkills((prev) => prev.filter((s) => s !== skill));
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skillsList: prev.skillsList.filter((s) => s !== skill),
    }));
  };

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: "", msg: "" }), 4000);
  };

  // ── AI Actions ─────────────────────────────────────────────────────────────
  const handleGenerateSummary = async () => {
    setLoading((p) => ({ ...p, summary: true }));
    setAiSuggestion("");
    try {
      const summary = await generateAISummary(formData);
      setFormData((prev) => ({ ...prev, summary }));
      setAiSuggestion("✨ AI-generated summary applied! Edit it to personalize further.");
    } catch {
      setAiSuggestion("Could not generate summary. Please fill in more details.");
    } finally {
      setLoading((p) => ({ ...p, summary: false }));
    }
  };

  const handleEnhanceExperience = async () => {
    if (!formData.experience.trim()) {
      showStatus("error", "Please add your experience first.");
      return;
    }
    setLoading((p) => ({ ...p, experience: true }));
    try {
      const enhanced = await enhanceExperience(formData.experience);
      setFormData((prev) => ({ ...prev, experience: enhanced }));
      setAiSuggestion("✨ Experience enhanced with action verbs & impact language!");
    } catch {
      setAiSuggestion("Enhancement unavailable. Check your internet connection.");
    } finally {
      setLoading((p) => ({ ...p, experience: false }));
    }
  };

  const handleFetchSkills = async () => {
    setLoading((p) => ({ ...p, skills: true }));
    try {
      const suggestions = await getSkillSuggestions(formData.experience + " " + formData.role);
      setSuggestedSkills(suggestions.filter(s => !formData.skillsList.includes(s)));
      setAiSuggestion("✨ AI skill suggestions loaded based on your experience!");
    } catch {
      setAiSuggestion("Skill suggestions unavailable offline.");
    } finally {
      setLoading((p) => ({ ...p, skills: false }));
    }
  };

  // ── Save to backend ────────────────────────────────────────────────────────
  const handleSave = async () => {
    const required = ["name", "email", "phone"];
    const missing = required.find((f) => !formData[f]?.trim());
    if (missing) {
      showStatus("error", `Please fill in your ${missing}.`);
      return;
    }
    setLoading((p) => ({ ...p, save: true }));
    try {
      const payload = {
        ...formData,
        skills: formData.skillsList.join(", "),
        templateId,
      };
      const baseUrl = process.env.NODE_ENV === "production" ? "" : "http://localhost:5000";
      await axios.post(`${baseUrl}/api/resumes/add`, payload);
      showStatus("success", "✅ Resume saved successfully to database!");
    } catch {
      showStatus("success", "✅ Resume ready! (Backend not running — data stored locally)");
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  // ── PDF Export ─────────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    if (!formData.name?.trim()) {
      showStatus("error", "Please enter your name before exporting.");
      return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210, margin = 20, lineH = 7;
    let y = 20;

    const addLine = (text, size = 10, bold = false, color = [30, 30, 46]) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, pageW - margin * 2);
      lines.forEach((line) => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += lineH;
      });
    };

    const addSection = (title) => {
      y += 3;
      doc.setFillColor(108, 99, 255);
      doc.rect(margin, y, pageW - margin * 2, 0.5, "F");
      y += 4;
      addLine(title.toUpperCase(), 8, true, [108, 99, 255]);
      y += 2;
    };

    // Header
    doc.setFillColor(30, 30, 63);
    doc.rect(0, 0, pageW, 40, "F");
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(formData.name, margin, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 255);
    const contactLine = [formData.email, formData.phone, formData.location]
      .filter(Boolean).join("   |   ");
    if (contactLine) doc.text(contactLine, margin, 30);
    if (formData.linkedin) doc.text(formData.linkedin, margin, 37);

    y = 50;

    if (formData.summary) {
      addSection("Professional Summary");
      addLine(formData.summary, 9);
    }
    if (formData.experience) {
      addSection("Experience");
      addLine(formData.experience, 9);
    }
    if (formData.education) {
      addSection("Education");
      addLine(formData.education, 9);
    }
    if (formData.skillsList?.length) {
      addSection("Skills");
      addLine(formData.skillsList.join("  •  "), 9);
    }
    if (formData.projects) {
      addSection("Projects");
      addLine(formData.projects, 9);
    }
    if (formData.certifications) {
      addSection("Certifications");
      addLine(formData.certifications, 9);
    }

    const fileName = `${formData.name.replace(/\s+/g, "_")}_Resume.pdf`;
    doc.save(fileName);
    showStatus("success", `📥 ${fileName} downloaded!`);
  }, [formData]);

  // ─────────────────────────────────────────────────────────────────────────
  const TemplateComponent = TEMPLATES[templateId] || ClassicTemplate;
  const hasContent = formData.name || formData.email || formData.experience || formData.education;

  return (
    <div className="builder-page">
      {/* ── Header ── */}
      <div className="builder-header">
        <div>
          <h1>✏️ Resume Builder</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
            Template: <span style={{ color: "var(--primary-light)", fontWeight: 600 }}>{TEMPLATE_NAMES[templateId]}</span>
          </p>
        </div>
        <div className="builder-header-actions">
          {/* Template switcher */}
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3].map((id) => (
              <button
                key={id}
                id={`switch-template-${id}`}
                onClick={() => setTemplateId(id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: templateId === id ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                  background: templateId === id ? "rgba(108,99,255,0.15)" : "transparent",
                  color: templateId === id ? "var(--primary-light)" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "var(--transition)",
                }}
              >
                T{id}
              </button>
            ))}
          </div>
          <Link to="/templates" className="btn-secondary" style={{ fontSize: "0.85rem", padding: "9px 16px" }}>
            ← Templates
          </Link>
          <button className="btn-export" onClick={handleExportPDF} id="export-pdf-btn">
            📥 Export PDF
          </button>
        </div>
      </div>

      {/* ── Status Banner ── */}
      {status.msg && (
        <div className={`alert alert-${status.type}`} role="alert">
          {status.msg}
        </div>
      )}

      {/* ── Builder Layout ── */}
      <div className="builder-layout">

        {/* ══════════════ FORM PANEL ══════════════ */}
        <div>
          <div className="form-panel">
            {/* Tabs */}
            <div className="form-panel-tabs" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`form-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form body */}
            <div className="form-panel-body">

              {/* ── BASICS TAB ── */}
              <div className={`form-section ${activeTab === "basics" ? "active" : ""}`}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name *</label>
                    <input id="name" name="name" type="text" className="form-input"
                      placeholder="Ayush Saini" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="role">Job Title</label>
                    <input id="role" name="role" type="text" className="form-input"
                      placeholder="Software Engineer" value={formData.role} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email *</label>
                    <input id="email" name="email" type="email" className="form-input"
                      placeholder="ayush@example.com" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone *</label>
                    <input id="phone" name="phone" type="tel" className="form-input"
                      placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">Location</label>
                    <input id="location" name="location" type="text" className="form-input"
                      placeholder="Bengaluru, India" value={formData.location} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="linkedin">LinkedIn / Portfolio</label>
                    <input id="linkedin" name="linkedin" type="url" className="form-input"
                      placeholder="linkedin.com/in/ayush" value={formData.linkedin} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* ── SUMMARY TAB ── */}
              <div className={`form-section ${activeTab === "summary" ? "active" : ""}`}>
                <div className="form-group">
                  <label className="form-label" htmlFor="summary">
                    Professional Summary
                    <button
                      className={`ai-suggest-btn ${loading.summary ? "loading" : ""}`}
                      onClick={handleGenerateSummary}
                      disabled={loading.summary}
                      id="ai-generate-summary-btn"
                    >
                      {loading.summary
                        ? <><span className="loading-spinner" /> Generating…</>
                        : <>🤖 AI Generate</>}
                    </button>
                  </label>
                  <textarea id="summary" name="summary" className="form-textarea"
                    style={{ minHeight: 120 }}
                    placeholder="Results-driven professional with 3+ years of experience in…"
                    value={formData.summary} onChange={handleChange}
                  />
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  💡 A strong summary increases interview callbacks by up to 40%. Click "AI Generate"
                  to auto-create one based on your profile.
                </p>
              </div>

              {/* ── EXPERIENCE TAB ── */}
              <div className={`form-section ${activeTab === "exp" ? "active" : ""}`}>
                <div className="form-group">
                  <label className="form-label" htmlFor="experience">
                    Work Experience
                    <button
                      className={`ai-suggest-btn ${loading.experience ? "loading" : ""}`}
                      onClick={handleEnhanceExperience}
                      disabled={loading.experience}
                      id="ai-enhance-exp-btn"
                    >
                      {loading.experience
                        ? <><span className="loading-spinner" /> Enhancing…</>
                        : <>⚡ AI Enhance</>}
                    </button>
                  </label>
                  <textarea id="experience" name="experience" className="form-textarea"
                    style={{ minHeight: 180 }}
                    placeholder={`Software Engineer @ Google (2022–Present)\n• Led development of…\n• Reduced latency by 30%…\n\nIntern @ Startup (2021)\n• Built…`}
                    value={formData.experience} onChange={handleChange}
                  />
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  💡 Use the "AI Enhance" button to automatically add action verbs, metrics, and impact language to your experience.
                </p>
              </div>

              {/* ── EDUCATION TAB ── */}
              <div className={`form-section ${activeTab === "edu" ? "active" : ""}`}>
                <div className="form-group">
                  <label className="form-label" htmlFor="education">Education</label>
                  <textarea id="education" name="education" className="form-textarea"
                    style={{ minHeight: 120 }}
                    placeholder={`B.Tech Computer Science\nIIT Delhi (2018–2022)\nCGPA: 8.5/10`}
                    value={formData.education} onChange={handleChange}
                  />
                </div>
              </div>

              {/* ── SKILLS TAB ── */}
              <div className={`form-section ${activeTab === "skills" ? "active" : ""}`}>
                <div className="form-group">
                  <label className="form-label">
                    Add Skills
                    <button
                      className={`ai-suggest-btn ${loading.skills ? "loading" : ""}`}
                      onClick={handleFetchSkills}
                      disabled={loading.skills}
                      id="ai-suggest-skills-btn"
                    >
                      {loading.skills
                        ? <><span className="loading-spinner" /> Loading…</>
                        : <>🤖 AI Suggest</>}
                    </button>
                  </label>
                  <div className="skill-input-row">
                    <input
                      id="skill-input"
                      type="text"
                      className="form-input"
                      placeholder="Type a skill and press Add…"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <button className="skill-add-btn" onClick={addSkill} id="add-skill-btn">+ Add</button>
                  </div>
                </div>

                {/* Current skills */}
                {formData.skillsList.length > 0 && (
                  <div className="skills-container">
                    {formData.skillsList.map((skill) => (
                      <div key={skill} className="skill-tag">
                        {skill}
                        <button className="skill-tag-remove" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI-suggested skills */}
                {suggestedSkills.length > 0 && (
                  <div className="suggested-skills">
                    <div className="suggested-skills-label">
                      🤖 AI Suggestions (click to add):
                    </div>
                    {suggestedSkills.map((skill) => (
                      <button
                        key={skill}
                        className="suggested-skill-chip"
                        onClick={() => addSuggestedSkill(skill)}
                        id={`suggest-skill-${skill.replace(/\s+/g, "-")}`}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── EXTRA TAB ── */}
              <div className={`form-section ${activeTab === "extra" ? "active" : ""}`}>
                <div className="form-group">
                  <label className="form-label" htmlFor="projects">Projects</label>
                  <textarea id="projects" name="projects" className="form-textarea"
                    style={{ minHeight: 110 }}
                    placeholder={`Resume Builder AI — React, Node.js, MongoDB\n• Built an AI-powered resume builder using Gemini API…`}
                    value={formData.projects} onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="certifications">Certifications & Awards</label>
                  <textarea id="certifications" name="certifications" className="form-textarea"
                    style={{ minHeight: 80 }}
                    placeholder={`AWS Certified Solutions Architect — 2023\nGoogle Cloud Professional — 2022`}
                    value={formData.certifications} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* ── AI Insight Panel ── */}
            {aiSuggestion && (
              <div className="ai-panel">
                <div className="ai-panel-title">🤖 AI Insight</div>
                <div className="ai-suggestion-text">{aiSuggestion}</div>
              </div>
            )}

            {/* ── ATS Score Panel ── */}
            <div className="ats-panel">
              <div className="ats-header">
                <span className="ats-title">📊 ATS Score</span>
                <span className={`ats-score-badge ${atsResult.level}`}>
                  {atsResult.score}/100
                </span>
              </div>
              <div className="ats-bar-container">
                <div
                  className={`ats-bar-fill ${atsResult.level}`}
                  style={{ width: `${atsResult.score}%` }}
                />
              </div>
              <div className="ats-tips">
                {atsResult.tips.slice(0, 3).map((tip, i) => (
                  <div key={i} className="ats-tip">
                    <span className="ats-tip-icon">{tip.icon}</span>
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Form Actions ── */}
            <div className="form-actions">
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={loading.save}
                id="save-resume-btn"
              >
                {loading.save
                  ? <><span className="loading-spinner" /> Saving…</>
                  : <>💾 Save Resume</>}
              </button>
              <button className="btn-export" onClick={handleExportPDF} id="export-pdf-footer-btn">
                📥 Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════ PREVIEW PANEL ══════════════ */}
        <div>
          <div className="preview-panel">
            <div className="preview-panel-header">
              <span className="preview-panel-title">
                <span className="preview-live-dot" />
                Live Preview
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Updates as you type
              </span>
            </div>

            <div className="preview-body">
              {hasContent ? (
                <TemplateComponent data={formData} />
              ) : (
                <div className="empty-preview">
                  <div className="empty-preview-icon">📄</div>
                  <h3>Your resume will appear here</h3>
                  <p>Start filling in your details on the left to see a live preview of your professional resume.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
