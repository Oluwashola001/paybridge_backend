// routes/auth.js
import express from "express";
import dotenv from "dotenv";

// Only load .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const router = express.Router();

// simple login route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // ✅ FIX: Define the required credentials inside the handler, 
  // ensuring the server has loaded all ENV vars before reading them.
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  if (
    username === ADMIN_USER &&
    password === ADMIN_PASS
  ) {
    // In a real app, you might issue a session token here
    return res.json({ success: true, message: "Login successful" });
  }

  // Optional: Log failure reason if variables are missing (useful for debugging Render)
  if (!ADMIN_USER || !ADMIN_PASS) {
      console.error("CRITICAL: ADMIN_USER or ADMIN_PASS is not set in environment variables!");
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

export default router;