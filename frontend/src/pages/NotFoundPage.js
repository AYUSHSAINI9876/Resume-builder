// pages/NotFoundPage.js — Catch-all 404 route
import React from "react";
import { Link } from "react-router-dom";
import { IconArrowLeft } from "../components/Icons";

const NotFoundPage = () => (
  <div className="not-found-page">
    <div className="not-found-code">404</div>
    <h1>Page not found</h1>
    <p>The page you're looking for doesn't exist or may have moved.</p>
    <Link to="/" className="btn-primary">
      <IconArrowLeft size={18} /> Back to Home
    </Link>
  </div>
);

export default NotFoundPage;
