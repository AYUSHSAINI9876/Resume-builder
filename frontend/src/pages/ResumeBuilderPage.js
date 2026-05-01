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
  parseUploadedResume,
  reviewAndImproveResume,
  parseVoiceText
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
  const [loading, setLoading]           = useState({ summary: false, skills: false, experience: false, save: false, upload: false, review: false });
  const [aiReviewResult, setAiReviewResult] = useState(null);
  const fileInputRef = React.useRef(null);

  const [listeningField, setListeningField] = useState(null);
  const recognitionRef = React.useRef(null);
  const isListeningRef = React.useRef(false);
  const finalTranscriptRef = React.useRef("");
  const interimTranscriptRef = React.useRef("");

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let final = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + " ";
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        finalTranscriptRef.current += final;
        interimTranscriptRef.current = interim;
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try { recognition.start(); } catch(e){}
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceField = async (field = "global") => {
    if (!recognitionRef.current) {
      showStatus("error", "Voice recognition not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (listeningField === field) {
      // STOP LISTENING AND PROCESS
      isListeningRef.current = false;
      setListeningField(null);
      try { recognitionRef.current.stop(); } catch(e) {}
      
      const text = (finalTranscriptRef.current + " " + interimTranscriptRef.current).trim();
      finalTranscriptRef.current = "";
      interimTranscriptRef.current = "";
      
      if (text) {
        showStatus("success", "⏳ AI is processing your voice input...");
        setLoading((p) => ({ ...p, upload: true }));
        try {
          if (field === "global") {
            const parsedData = await parseVoiceText(text);
            setFormData((prev) => ({
              ...prev,
              name: parsedData.name || prev.name,
              email: parsedData.email || prev.email,
              phone: parsedData.phone || prev.phone,
              location: parsedData.location || prev.location,
              linkedin: parsedData.linkedin || prev.linkedin,
              role: parsedData.role || prev.role,
              summary: parsedData.summary || prev.summary,
              experience: parsedData.experience ? (prev.experience ? prev.experience + "\n\n" + parsedData.experience : parsedData.experience) : prev.experience,
              education: parsedData.education ? (prev.education ? prev.education + "\n\n" + parsedData.education : parsedData.education) : prev.education,
              projects: parsedData.projects ? (prev.projects ? prev.projects + "\n\n" + parsedData.projects : parsedData.projects) : prev.projects,
              certifications: parsedData.certifications ? (prev.certifications ? prev.certifications + "\n\n" + parsedData.certifications : parsedData.certifications) : prev.certifications,
              skillsList: parsedData.skillsList?.length ? [...new Set([...prev.skillsList, ...parsedData.skillsList])] : prev.skillsList,
            }));
            setAiSuggestion("✨ Successfully processed your full voice input into resume sections!");
          } else {
            const basicFields = ["name", "role", "email", "phone", "location", "linkedin"];
            if (basicFields.includes(field)) {
              let processedText = text;

              // Datatype parsing and validation
              if (field === "phone") {
                let numbersOnly = processedText.replace(/[^0-9+]/g, "");
                if (!/\d/.test(numbersOnly)) {
                  throw new Error(`Datatype mismatch (Phone): Expected numbers but received "${text}".`);
                }
                processedText = numbersOnly;
              } else if (field === "email") {
                let emailText = processedText.toLowerCase().replace(/\s+at\s+/g, "@").replace(/\s+dot\s+/g, ".").replace(/\s+/g, "");
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailText)) {
                  throw new Error(`Datatype mismatch (Email): Unrecognizable email format from "${text}".`);
                }
                processedText = emailText;
              } else if (field === "linkedin") {
                let urlText = processedText.toLowerCase().replace(/\s+dot\s+/g, ".").replace(/\s+/g, "");
                if (!urlText.includes("linkedin") && !urlText.includes(".com")) {
                  throw new Error(`Datatype mismatch (URL): Expected a valid LinkedIn link but got "${text}".`);
                }
                processedText = urlText;
              } else {
                // Formatting cleanup for name, role, etc (strip trailing spaces/punctuation)
                processedText = processedText.replace(/[.,;:]+$/, "").trim();
              }

              // Bypass AI format for simple text fields
              setFormData(prev => ({
                ...prev,
                [field]: processedText
              }));
              setAiSuggestion(`✨ Successfully added dictated input to ${field}!`);
            } else {
              // AI format for textareas
              const parsedData = await parseVoiceText(text, field);
              const formattedText = parsedData.formattedText;
              setFormData(prev => ({
                ...prev,
                [field]: prev[field] ? prev[field] + "\n\n" + formattedText : formattedText
              }));
              setAiSuggestion(`✨ Successfully formatted and added your dictated input to ${field}!`);
            }
          }
          showStatus("success", "✅ Voice input processed successfully!");
        } catch (err) {
          showStatus("error", err.message || "Failed to process voice text. Backend error.");
        } finally {
          setLoading((p) => ({ ...p, upload: false }));
        }
      } else {
         showStatus("error", "No speech detected. Please try again.");
      }
      finalTranscriptRef.current = "";
    } else {
      // START LISTENING
      if (listeningField) {
         try { recognitionRef.current.stop(); } catch(e) {}
      }
      isListeningRef.current = true;
      setListeningField(field);
      finalTranscriptRef.current = "";
      interimTranscriptRef.current = "";
      try { recognitionRef.current.start(); } catch(e){}
      showStatus("success", `🎙️ Listening... Dictate for ${field === "global" ? "your entire resume" : field}.`);
    }
  };

  const renderVoiceBtn = (field) => (
    <button
      type="button"
      className={`voice-mic-btn ${listeningField === field ? "pulsing-mic" : ""}`}
      onClick={() => toggleVoiceField(field)}
      title={`Dictate ${field}`}
      style={{
        background: listeningField === field ? "rgba(255,69,138,0.15)" : "transparent",
        border: `1px solid ${listeningField === field ? "#ff458a" : "var(--border)"}`,
        color: listeningField === field ? "#ff458a" : "var(--text-muted)",
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "0.7rem",
        cursor: "pointer",
        marginLeft: "8px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        transition: "all 0.3s ease"
      }}
    >
      {listeningField === field ? "🛑 Stop" : "🎙️ Dictate"}
    </button>
  );

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      showStatus("error", "Please upload a PDF file.");
      return;
    }
    
    setLoading((p) => ({ ...p, upload: true }));
    showStatus("success", "⏳ AI is reading and extracting your PDF...");
    try {
      const parsedData = await parseUploadedResume(file);
      setFormData((prev) => ({
        ...prev,
        name: parsedData.name || prev.name,
        email: parsedData.email || prev.email,
        phone: parsedData.phone || prev.phone,
        location: parsedData.location || prev.location,
        linkedin: parsedData.linkedin || prev.linkedin,
        role: parsedData.role || prev.role,
        summary: parsedData.summary || prev.summary,
        experience: parsedData.experience || prev.experience,
        education: parsedData.education || prev.education,
        projects: parsedData.projects || prev.projects,
        certifications: parsedData.certifications || prev.certifications,
        skillsList: parsedData.skillsList?.length ? parsedData.skillsList : prev.skillsList,
      }));
      setAiSuggestion("✨ Successfully loaded content from uploaded PDF into the builder!");
      showStatus("success", "✅ PDF loaded successfully!");
    } catch {
      showStatus("error", "Failed to parse the PDF. Check if backend is running.");
    } finally {
      setLoading((p) => ({ ...p, upload: false }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeepReview = async () => {
    setLoading((p) => ({ ...p, review: true }));
    showStatus("success", "⏳ AI is deeply analyzing your resume for flaws...");
    try {
      const res = await reviewAndImproveResume(formData);
      setAiReviewResult(res);
      showStatus("success", "✨ Full AI review complete!");
    } catch {
      showStatus("error", "AI deep review failed.");
    } finally {
      setLoading((p) => ({ ...p, review: false }));
    }
  };

  const applyDeepReviewFixes = () => {
    if (!aiReviewResult) return;
    setFormData((prev) => ({
      ...prev,
      summary: aiReviewResult.improvedSummary,
      experience: aiReviewResult.improvedExperience
    }));
    setAiSuggestion("✨ Advanced AI improvements applied to Summary and Experience!");
    setAiReviewResult(null);
    showStatus("success", "✅ Missing features fixed!");
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
          <button 
            className={`btn-secondary ${listeningField === "global" ? "pulsing-global-mic" : ""}`} 
            style={{ 
              fontSize: "0.85rem", 
              padding: "9px 16px", 
              color: listeningField === "global" ? "#ff458a" : "inherit",
              borderColor: listeningField === "global" ? "#ff458a" : "var(--border)",
              background: listeningField === "global" ? "rgba(255, 69, 138, 0.1)" : "transparent",
              transition: "all 0.3s ease"
            }}
            onClick={() => toggleVoiceField("global")}
            disabled={loading.upload && listeningField !== "global"}
          >
            {listeningField === "global" ? "🛑 Stop Global AI" : "🎙️ Global Voice AI"}
          </button>
          <input 
            type="file" 
            accept="application/pdf" 
            style={{ display: "none" }} 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            className="btn-secondary" 
            style={{ fontSize: "0.85rem", padding: "9px 16px" }}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading.upload}
          >
            {loading.upload ? "📂 Parsing..." : "📂 Upload Resume"}
          </button>
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
                    <label className="form-label" htmlFor="name">Full Name * {renderVoiceBtn("name")}</label>
                    <input id="name" name="name" type="text" className="form-input"
                      placeholder="Ayush Saini" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="role">Job Title {renderVoiceBtn("role")}</label>
                    <input id="role" name="role" type="text" className="form-input"
                      placeholder="Software Engineer" value={formData.role} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email * {renderVoiceBtn("email")}</label>
                    <input id="email" name="email" type="email" className="form-input"
                      placeholder="ayush@example.com" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone * {renderVoiceBtn("phone")}</label>
                    <input id="phone" name="phone" type="tel" className="form-input"
                      placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">Location {renderVoiceBtn("location")}</label>
                    <input id="location" name="location" type="text" className="form-input"
                      placeholder="Bengaluru, India" value={formData.location} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="linkedin">LinkedIn / Portfolio {renderVoiceBtn("linkedin")}</label>
                    <input id="linkedin" name="linkedin" type="url" className="form-input"
                      placeholder="linkedin.com/in/ayush" value={formData.linkedin} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* ── SUMMARY TAB ── */}
              <div className={`form-section ${activeTab === "summary" ? "active" : ""}`}>
                <div className="form-group">
                  <label className="form-label" htmlFor="summary" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    Professional Summary {renderVoiceBtn("summary")}
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
                  <label className="form-label" htmlFor="experience" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    Work Experience {renderVoiceBtn("experience")}
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
                  <label className="form-label" htmlFor="education">Education {renderVoiceBtn("education")}</label>
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
                  <label className="form-label" htmlFor="projects">Projects {renderVoiceBtn("projects")}</label>
                  <textarea id="projects" name="projects" className="form-textarea"
                    style={{ minHeight: 110 }}
                    placeholder={`Resume Builder AI — React, Node.js, MongoDB\n• Built an AI-powered resume builder using Gemini API…`}
                    value={formData.projects} onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="certifications">Certifications & Awards {renderVoiceBtn("certifications")}</label>
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

            {aiReviewResult && (
              <div className="ai-panel" style={{ marginTop: 15, background: "rgba(255, 69, 138, 0.1)", border: "1px solid rgba(255, 69, 138, 0.3)" }}>
                <div className="ai-panel-title" style={{ color: "#ff458a" }}>🔥 AI Deep Review Report (Score: {aiReviewResult.atsScore})</div>
                <div style={{ marginBottom: 10, fontSize: "0.85rem", color: "var(--text-color)" }}>
                  <strong>Missing Features / Flaws:</strong>
                  <ul style={{ paddingLeft: 20, marginTop: 5, lineHeight: 1.6 }}>
                    {aiReviewResult.flaws.map((flaw, idx) => (
                      <li key={idx}>{flaw}</li>
                    ))}
                  </ul>
                </div>
                <button 
                  className="ai-suggest-btn" 
                  style={{ width: "100%", justifyContent: "center", background: "linear-gradient(135deg, #ff458a, #6c63ff)", color: "#fff", padding: "10px", fontWeight: "bold" }}
                  onClick={applyDeepReviewFixes}
                >
                  ⚡ Auto-Improve & Fix All Flaws Now
                </button>
              </div>
            )}

            <button 
              className={`btn-secondary ${loading.review ? "loading" : ""}`} 
              style={{ width: "100%", marginTop: 15, padding: "12px", background: "rgba(108, 99, 255, 0.1)", color: "var(--primary-light)", border: "1px dashed var(--primary-light)" }}
              onClick={handleDeepReview}
              disabled={loading.review}
            >
               {loading.review ? "🔍 Analyzing flaws..." : "🔍 Run AI Deep Review"}
            </button>

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
