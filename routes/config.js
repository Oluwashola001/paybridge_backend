// routes/config.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Secure endpoint to send Transak key to frontend
router.get("/transak-key", (req, res) => {
  // Optionally restrict allowed origins
  const allowedOrigin = "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);

  res.json({ apiKey: process.env.TRANSAK_API_KEY });
});

export default router;
