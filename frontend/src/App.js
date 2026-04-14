// App.js — Main router with Navbar
import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";
import TemplateSelectionPage from "./pages/TemplateSelectionPage";
import "./App.css";

/**
 * Navbar component - fixed top navigation
 */
const Navbar = () => (
  <nav className="navbar">
    <NavLink to="/" className="navbar-logo">
      <div className="navbar-logo-icon">📄</div>
      <span>ResumeAI</span>
    </NavLink>
    <ul className="navbar-links">
      <li>
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} end>
          Home
        </NavLink>
      </li>
      <li>
        <NavLink to="/templates" className={({ isActive }) => isActive ? "active" : ""}>
          Templates
        </NavLink>
      </li>
      <li>
        <NavLink to="/builder" className={({ isActive }) => isActive ? "active" : ""}>
          Builder
        </NavLink>
      </li>
    </ul>
  </nav>
);

/**
 * Root App component
 */
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder" element={<ResumeBuilderPage />} />
        <Route path="/templates" element={<TemplateSelectionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
