// components/ErrorBoundary.js — Catches render errors so one bad component
// can't blank out the whole app.
import React from "react";
import { IconAlert } from "./Icons";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-spinner-container" style={{ flexDirection: "column", gap: 16 }}>
          <IconAlert size={44} />
          <h2 style={{ color: "var(--text-primary)" }}>Something went wrong</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            An unexpected error occurred. Try reloading the page.
          </p>
          <button className="btn-primary" onClick={() => window.location.assign("/")}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
