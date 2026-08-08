// components/Toast.js — Single toast notification
import React from "react";
import { IconAlert, IconCheckCircle, IconClose, IconInfo } from "./Icons";

const ICONS = { success: IconCheckCircle, error: IconAlert, info: IconInfo };

const Toast = ({ type = "info", message, onClose }) => {
  const Glyph = ICONS[type] || ICONS.info;
  return (
    <div className={`alert alert-${type} toast-item`} role="status">
      <Glyph size={17} />
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss notification">
        <IconClose size={14} />
      </button>
    </div>
  );
};

export default Toast;
