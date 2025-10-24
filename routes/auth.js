// routes/auth.js
import express from "express";
import dotenv from "dotenv";

// ✅ Only load .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const router = express.Router();

// simple login route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Reads from Render env vars in production
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    // In a real app, you might issue a session token here
    return res.json({ success: true, message: "Login successful" });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

export default router;