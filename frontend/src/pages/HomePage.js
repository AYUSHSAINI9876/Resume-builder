// HomePage.js — Premium landing page with hero, features, stats
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * Animated counter hook for stats
 */
const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = React.useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
};

/**
 * Stat item with animated count
 */
const StatItem = ({ value, suffix = "", label }) => {
  const [count, ref] = useCountUp(value);
  return (
    <div className="hero-stat" ref={ref}>
      <div className="hero-stat-num">{count}{suffix}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
};

/** Features configuration */
const features = [
  {
    icon: "🤖",
    colorClass: "purple",
    title: "AI-Powered Suggestions",
    desc: "Gemini AI analyzes your profile and suggests impactful bullet points, skills, and role-specific summaries.",
    delay: "0.1s",
  },
  {
    icon: "📊",
    colorClass: "blue",
    title: "Real-Time ATS Score",
    desc: "Instantly see your ATS compatibility score with tips to beat Applicant Tracking Systems at top companies.",
    delay: "0.2s",
  },
  {
    icon: "🎨",
    colorClass: "pink",
    title: "3 Professional Templates",
    desc: "Choose from Classic, Modern, or Creative templates — each ATS-friendly and recruiter-approved.",
    delay: "0.3s",
  },
  {
    icon: "⚡",
    colorClass: "green",
    title: "One-Click PDF Export",
    desc: "Download your resume as a perfectly formatted PDF in seconds. No fuss, no watermarks.",
    delay: "0.4s",
  },
];

/**
 * HomePage — Landing page component
 */
const HomePage = () => {
  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="home-page">
        {/* Animated background blobs */}
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        {/* Badge */}
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          AI-Powered Resume Builder
        </div>

        {/* Title */}
        <h1 className="hero-title">
          Build a Resume That<br />
          <span className="gradient-text">Gets You Hired</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Craft ATS-optimized resumes with AI-powered suggestions, live previews,
          and beautiful templates trusted by professionals worldwide.
        </p>

        {/* CTA Buttons */}
        <div className="hero-buttons">
          <Link to="/templates" className="btn-primary" id="hero-start-btn">
            🚀 Start Building Free
          </Link>
          <Link to="/builder" className="btn-secondary" id="hero-builder-btn">
            ⚡ Quick Build
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <StatItem value={50000} suffix="+" label="Resumes Created" />
          <StatItem value={95} suffix="%" label="Interview Rate" />
          <StatItem value={3} suffix="" label="Pro Templates" />
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <h2 className="section-heading">
          Everything You Need to{" "}
          <span
            style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Stand Out
          </span>
        </h2>
        <p className="section-subheading">
          Powered by Google Gemini AI — the same technology used by industry leaders
        </p>

        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card animate-fade-in-up"
              style={{ animationDelay: f.delay }}
            >
              <div className={`feature-icon ${f.colorClass}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link to="/templates" className="btn-primary" id="features-cta-btn">
            🎯 Choose Your Template
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
