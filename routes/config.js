// routes/config.js
import express from "express";
import dotenv from "dotenv";

// ✅ Only load .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const router = express.Router();

// Secure endpoint to send Transak key to frontend
router.get("/transak-key", (req, res) => {
  // Optionally restrict allowed origins (This might need updating for Vercel later)
  const allowedOrigin = "http://localhost:5173"; // Keep for local testing
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);

  res.json({ apiKey: process.env.TRANSAK_API_KEY }); // Reads from Render env vars in production
});

export default router;