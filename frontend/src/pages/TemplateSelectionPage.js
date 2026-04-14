// TemplateSelectionPage.js — Premium template gallery
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Template definitions with metadata
 */
const templates = [
  {
    id: 1,
    name: "Classic Professional",
    desc: "Timeless two-tone layout trusted by Fortune 500 recruiters.",
    tags: [{ label: "ATS-Friendly", cls: "tag-green" }, { label: "Corporate", cls: "tag-purple" }],
    gradient: "linear-gradient(135deg, #1e1e3f 0%, #6c63ff 100%)",
    icon: "🏛️",
    bestFor: "Finance, Law, Consulting",
    delay: "0.1s",
  },
  {
    id: 2,
    name: "Modern Dark",
    desc: "Sleek two-column dark design that screams tech-savvy innovator.",
    tags: [{ label: "Tech", cls: "tag-blue" }, { label: "Creative", cls: "tag-purple" }],
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #16213e 100%)",
    icon: "🌙",
    bestFor: "Engineering, Design, Startups",
    delay: "0.2s",
  },
  {
    id: 3,
    name: "Creative Gradient",
    desc: "Bold color-accented design that makes your resume unforgettable.",
    tags: [{ label: "Bold", cls: "tag-pink" }, { label: "Unique", cls: "tag-blue" }],
    gradient: "linear-gradient(135deg, #f72585 0%, #4cc9f0 100%)",
    icon: "🎨",
    bestFor: "Marketing, Design, Media",
    delay: "0.3s",
  },
];

/**
 * Mini preview cards rendered inside each template card
 */
const MiniPreview = ({ id }) => {
  if (id === 1) return (
    <div style={{ background: "white", borderRadius: 8, overflow: "hidden", height: "100%", padding: 0 }}>
      <div style={{ height: 55, background: "linear-gradient(135deg,#1e1e3f,#6c63ff)", padding: "10px 14px" }}>
        <div style={{ height: 10, width: "60%", background: "rgba(255,255,255,0.9)", borderRadius: 4 }} />
        <div style={{ height: 6, width: "40%", background: "rgba(255,255,255,0.5)", borderRadius: 4, marginTop: 6 }} />
      </div>
      <div style={{ padding: "10px 14px" }}>
        {["80%","60%","70%","50%"].map((w,i) => (
          <div key={i} style={{ height: 5, width: w, background: i===0?"#6c63ff":"#e0e0ef", borderRadius: 3, marginBottom: 6, opacity: i===0?1:0.6 }} />
        ))}
      </div>
    </div>
  );

  if (id === 2) return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, overflow: "hidden", height: "100%", display: "grid", gridTemplateColumns: "35% 65%" }}>
      <div style={{ background: "#1a0a2e", padding: "10px 8px", borderRight: "1px solid rgba(108,99,255,0.2)" }}>
        <div style={{ height: 8, background: "linear-gradient(90deg,#6c63ff,#f72585)", borderRadius: 4, marginBottom: 8 }} />
        {["70%","55%","65%","45%"].map((w,i) => (
          <div key={i} style={{ height: 4, width: w, background: "rgba(255,255,255,0.2)", borderRadius: 2, marginBottom: 5 }} />
        ))}
      </div>
      <div style={{ padding: "10px 8px" }}>
        {["80%","60%","75%","50%","65%"].map((w,i) => (
          <div key={i} style={{ height: 4, width: w, background: "rgba(255,255,255,0.15)", borderRadius: 2, marginBottom: 5 }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: "white", borderRadius: 8, overflow: "hidden", height: "100%" }}>
      <div style={{ height: 6, background: "linear-gradient(90deg,#f72585,#4cc9f0,#06d6a0)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f72585,#4cc9f0)" }} />
        <div>
          <div style={{ height: 7, width: 80, background: "#1a1a2e", borderRadius: 3 }} />
          <div style={{ height: 4, width: 50, background: "#ccc", borderRadius: 3, marginTop: 4 }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "10px 12px" }}>
        {["70%","60%","80%","50%"].map((w,i) => (
          <div key={i} style={{ height: 4, width: w, background: "#eee", borderRadius: 2 }} />
        ))}
      </div>
    </div>
  );
};

/**
 * TemplateSelectionPage — Gallery of resume templates
 */
const TemplateSelectionPage = () => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  const handleSelect = (id) => {
    navigate(`/builder?template=${id}`);
  };

  return (
    <div className="template-page">
      {/* Page header */}
      <div className="template-page-header">
        <div className="hero-badge" style={{ margin: "0 auto 1rem" }}>
          <span className="hero-badge-dot" />
          Step 1 of 2
        </div>
        <h1>
          Choose Your{" "}
          <span style={{
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Template
          </span>
        </h1>
        <p>Pick a design that matches your industry and personality</p>
      </div>

      {/* Template grid */}
      <div className="template-grid">
        {templates.map((t) => (
          <div
            key={t.id}
            id={`template-card-${t.id}`}
            className={`template-card ${hoveredId === t.id ? "selected" : ""}`}
            style={{ animationDelay: t.delay }}
            onMouseEnter={() => setHoveredId(t.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Visual preview area */}
            <div className="template-preview-area" style={{ background: t.gradient }}>
              <div style={{ position: "absolute", inset: 12 }}>
                <MiniPreview id={t.id} />
              </div>
              {/* Hover overlay */}
              <div className="template-overlay">
                <button
                  className="template-overlay-btn"
                  onClick={() => handleSelect(t.id)}
                  id={`quick-select-${t.id}`}
                >
                  Use This Template →
                </button>
              </div>
            </div>

            {/* Card body */}
            <div className="template-card-body">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
                <span className="template-card-name">{t.name}</span>
              </div>
              <p className="template-card-desc">{t.desc}</p>

              {/* Tags */}
              <div>
                {t.tags.map((tag) => (
                  <span key={tag.label} className={`template-tag ${tag.cls}`}>
                    {tag.label}
                  </span>
                ))}
              </div>

              {/* Best for */}
              <div style={{
                marginTop: 10,
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <span>✓</span> Best for: {t.bestFor}
              </div>

              {/* Action button */}
              <div className="template-card-actions">
                <button
                  className="btn-use-template"
                  id={`select-template-${t.id}`}
                  onClick={() => handleSelect(t.id)}
                >
                  Start Building →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom tip */}
      <p style={{
        textAlign: "center",
        marginTop: "2.5rem",
        fontSize: "0.85rem",
        color: "var(--text-muted)",
      }}>
        💡 You can switch templates anytime in the builder without losing your data
      </p>
    </div>
  );
};

export default TemplateSelectionPage;
