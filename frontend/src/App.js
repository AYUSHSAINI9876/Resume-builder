// App.js — Main router with Navbar, auth, toasts, and lazy-loaded routes
import React, { Suspense, lazy, useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Logo from "./components/Logo";
import { IconClose, IconLogout, IconMenu } from "./components/Icons";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import "./App.css";

// Route-level code splitting keeps the initial bundle small (faster first paint).
const HomePage = lazy(() => import("./pages/HomePage"));
const ResumeBuilderPage = lazy(() => import("./pages/ResumeBuilderPage"));
const TemplateSelectionPage = lazy(() => import("./pages/TemplateSelectionPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const RouteFallback = () => (
  <div className="page-spinner-container">
    <div className="page-spinner" />
  </div>
);

/**
 * Navbar component - fixed top navigation with auth-aware links + mobile menu
 */
const Navbar = () => {
  const { user, logout, initializing } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMobile();
    navigate("/");
  };

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo" onClick={closeMobile}>
        <Logo size={34} idSuffix="nav" />
      </NavLink>

      <button
        className="navbar-mobile-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((o) => !o)}
      >
        {mobileOpen ? <IconClose size={20} /> : <IconMenu size={20} />}
      </button>

      <div className={`navbar-links-wrapper ${mobileOpen ? "open" : ""}`}>
        <ul className="navbar-links">
          <li><NavLink to="/" className={linkClass} onClick={closeMobile} end>Home</NavLink></li>
          <li><NavLink to="/templates" className={linkClass} onClick={closeMobile}>Templates</NavLink></li>
          <li><NavLink to="/builder" className={linkClass} onClick={closeMobile}>Builder</NavLink></li>
          {user && (
            <li><NavLink to="/dashboard" className={linkClass} onClick={closeMobile}>My Resumes</NavLink></li>
          )}
        </ul>

        <div className="navbar-auth">
          {initializing ? null : user ? (
            <div className="navbar-user">
              <div className="navbar-avatar">{user.name?.[0]?.toUpperCase() || "U"}</div>
              <span className="navbar-user-name">{user.name?.split(" ")[0]}</span>
              <button className="btn-secondary navbar-logout-btn" onClick={handleLogout}>
                <IconLogout size={15} /> Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth-buttons">
              <NavLink to="/login" className="btn-secondary" onClick={closeMobile}>Login</NavLink>
              <NavLink to="/register" className="btn-primary" onClick={closeMobile}>Sign Up</NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

/**
 * Root App component
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/templates" element={<TemplateSelectionPage />} />
                <Route path="/builder" element={<ResumeBuilderPage />} />
                <Route path="/builder/:id" element={
                  <ProtectedRoute><ResumeBuilderPage /></ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
