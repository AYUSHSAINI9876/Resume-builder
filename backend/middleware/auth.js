// backend/middleware/auth.js — JWT verification middleware
const jwt = require("jsonwebtoken");

/**
 * Protects a route: requires a valid "Authorization: Bearer <token>" header.
 * On success, sets req.userId to the authenticated user's Mongo _id.
 */
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Reject narrowly-scoped tokens (e.g. the short-lived signup token issued
    // after OTP verification) — only full session tokens may access user data.
    if (payload.scope || !payload.sub) {
      return res.status(401).json({ message: "Authentication required. Please log in." });
    }
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired or invalid. Please log in again." });
  }
};

module.exports = { requireAuth };
