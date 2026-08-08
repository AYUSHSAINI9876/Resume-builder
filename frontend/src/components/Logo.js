// components/Logo.js — Brand mark + wordmark.
// Inline SVG (not an emoji or image file) so it stays crisp at any size,
// inherits the gradient tokens, and needs no network request.
import React from "react";

/**
 * The mark alone — a gradient ring wrapping a stylised resume document.
 * `idSuffix` keeps the SVG gradient ids unique when several logos render at once
 * (duplicate ids make later instances inherit the first one's fill).
 */
export const LogoMark = ({ size = 36, idSuffix = "default" }) => {
  const ringId = `logo-ring-${idSuffix}`;
  const sheetId = `logo-sheet-${idSuffix}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={ringId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6c63ff" />
          <stop offset="0.5" stopColor="#b14bd8" />
          <stop offset="1" stopColor="#f72585" />
        </linearGradient>
        <linearGradient id={sheetId} x1="16" y1="12" x2="32" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8e6ff" />
        </linearGradient>
      </defs>

      {/* Outer gradient disc */}
      <circle cx="24" cy="24" r="23" fill={`url(#${ringId})`} />
      {/* Inner cut-out ring for depth */}
      <circle cx="24" cy="24" r="18.5" fill="#0f0f1a" fillOpacity="0.16" />

      {/* Document */}
      <rect x="16" y="12.5" width="16" height="23" rx="3" fill={`url(#${sheetId})`} />
      {/* Text lines — shortest last, like a real resume block */}
      <rect x="19" y="17" width="10" height="2" rx="1" fill="#6c63ff" />
      <rect x="19" y="21.5" width="10" height="1.6" rx="0.8" fill="#c9c6ee" />
      <rect x="19" y="25" width="10" height="1.6" rx="0.8" fill="#c9c6ee" />
      <rect x="19" y="28.5" width="6" height="1.6" rx="0.8" fill="#c9c6ee" />

      {/* AI spark */}
      <path
        d="M34.5 13.5l1.1 2.6 2.6 1.1-2.6 1.1-1.1 2.6-1.1-2.6-2.6-1.1 2.6-1.1z"
        fill="#4cc9f0"
      />
    </svg>
  );
};

/**
 * Full lockup: mark + "ResumeAI" wordmark.
 */
const Logo = ({ size = 36, showWordmark = true, idSuffix = "default", className = "" }) => (
  <span className={`brand-lockup ${className}`.trim()}>
    <LogoMark size={size} idSuffix={idSuffix} />
    {showWordmark && <span className="brand-wordmark">ResumeAI</span>}
  </span>
);

export default Logo;
