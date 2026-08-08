// components/Icons.js — Single source of truth for iconography.
// One stroke-based 24x24 set (consistent weight, round caps) replacing the
// emoji that previously rendered differently on every OS. All icons inherit
// `currentColor`, so they pick up whatever text colour their container uses.
import React from "react";

const Icon = ({ size = 18, children, className = "", strokeWidth = 1.8, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon ${className}`.trim()}
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
);

/* ── Navigation & chrome ─────────────────────────────────────────────────── */
export const IconMenu = (p) => <Icon {...p}><path d="M3 6h18M3 12h18M3 18h18" /></Icon>;
export const IconClose = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
export const IconHome = (p) => <Icon {...p}><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></Icon>;
export const IconLogout = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></Icon>;
export const IconArrowLeft = (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>;
export const IconArrowRight = (p) => <Icon {...p}><path d="M5 12h14M12 5l7 7-7 7" /></Icon>;
export const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;

/* ── Documents & templates ───────────────────────────────────────────────── */
export const IconFile = (p) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></Icon>;
export const IconFolder = (p) => <Icon {...p}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2" /></Icon>;
export const IconUpload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5M12 3v12" /></Icon>;
export const IconDownload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></Icon>;
export const IconSave = (p) => <Icon {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></Icon>;
export const IconCopy = (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>;
export const IconTrash = (p) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" /></Icon>;
export const IconEdit = (p) => <Icon {...p}><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" /></Icon>;
export const IconLayout = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M3 9h18" /></Icon>;
export const IconPalette = (p) => <Icon {...p}><path d="M12 22a10 10 0 1 1 10-10c0 2-1.5 3-3 3h-2a2 2 0 0 0-1.4 3.4A2 2 0 0 1 14 22z" /><circle cx="7.5" cy="11.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="16.5" cy="11.5" r="1.2" fill="currentColor" stroke="none" /></Icon>;
export const IconBuilding = (p) => <Icon {...p}><path d="M3 21h18M5 21V6l7-3 7 3v15" /><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" /></Icon>;
export const IconMoon = (p) => <Icon {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8" /></Icon>;

/* ── Resume sections ─────────────────────────────────────────────────────── */
export const IconUser = (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>;
export const IconClipboard = (p) => <Icon {...p}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></Icon>;
export const IconBriefcase = (p) => <Icon {...p}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></Icon>;
export const IconGraduation = (p) => <Icon {...p}><path d="m22 10-10-5L2 10l10 5 10-5z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></Icon>;
export const IconTool = (p) => <Icon {...p}><path d="M14.7 6.3a4 4 0 0 0 5 5l-9.4 9.4a2.1 2.1 0 0 1-3-3z" /><path d="M14.7 6.3 17.5 3.5" /></Icon>;
export const IconStar = (p) => <Icon {...p}><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1z" /></Icon>;
export const IconAward = (p) => <Icon {...p}><circle cx="12" cy="8" r="6" /><path d="m8.2 13.6-1.4 8L12 19l5.2 2.6-1.4-8" /></Icon>;

/* ── Contact ─────────────────────────────────────────────────────────────── */
export const IconMail = (p) => <Icon {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></Icon>;
export const IconPhone = (p) => <Icon {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></Icon>;
export const IconLink = (p) => <Icon {...p}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12.2 19" /></Icon>;
export const IconMapPin = (p) => <Icon {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Icon>;
export const IconLock = (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>;
export const IconShieldCheck = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></Icon>;

/* ── AI, status & feedback ───────────────────────────────────────────────── */
export const IconSparkles = (p) => <Icon {...p}><path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" /><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></Icon>;
export const IconBot = (p) => <Icon {...p}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8V4M9 2h6" /><circle cx="8.5" cy="14" r="1.2" fill="currentColor" stroke="none" /><circle cx="15.5" cy="14" r="1.2" fill="currentColor" stroke="none" /></Icon>;
export const IconChart = (p) => <Icon {...p}><path d="M3 3v18h18" /><path d="M7 15v3M12 10v8M17 6v12" /></Icon>;
export const IconZap = (p) => <Icon {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></Icon>;
export const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>;
export const IconRocket = (p) => <Icon {...p}><path d="M5 13c-1.5 1.5-2 5.5-2 5.5S7 18 8.5 16.5" /><path d="M14.5 4.5C17 2 21 2 21 2s0 4-2.5 6.5L13 14l-4-4z" /><path d="M9 10 5.5 9 9 5.5 13 6M14 15l1 3.5 3.5-3.5-1-4" /></Icon>;
export const IconTarget = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></Icon>;
export const IconCheck = (p) => <Icon {...p}><path d="m5 12 5 5L20 7" /></Icon>;
export const IconCheckCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 5-5" /></Icon>;
export const IconAlert = (p) => <Icon {...p}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></Icon>;
export const IconInfo = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></Icon>;
export const IconLightbulb = (p) => <Icon {...p}><path d="M9 18h6M10 22h4" /><path d="M12 2a6 6 0 0 0-3.5 10.9c.5.4.8 1 .9 1.6l.1.5h5l.1-.5c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 2z" /></Icon>;
export const IconKey = (p) => <Icon {...p}><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.7 12.3 8.3-8.3M16 7l2.5 2.5M13.5 9.5 16 12" /></Icon>;
export const IconPencilLine = (p) => <Icon {...p}><path d="M15 3.5a2.1 2.1 0 1 1 3 3L8 16.5 4 18l1.5-4z" /><path d="M4 22h16" /></Icon>;

/* ── Voice ───────────────────────────────────────────────────────────────── */
export const IconMic = (p) => <Icon {...p}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" /></Icon>;
export const IconStopCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><rect x="9" y="9" width="6" height="6" rx="1" /></Icon>;

export default Icon;
