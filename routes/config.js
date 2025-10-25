// routes/config.js
import express from "express";
import dotenv from "dotenv";

// Only load .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const router = express.Router();

// Secure endpoint to send Transak key to frontend
router.get("/transak-key", (req, res) => {
  // ❌ REMOVED: The hardcoded CORS policy is removed here 
  // const allowedOrigin = "http://localhost:5173"; 
  // res.setHeader("Access-Control-Allow-Origin", allowedOrigin); 
  
  // ✅ The global CORS middleware in index.js now handles the header

  res.json({ apiKey: process.env.TRANSAK_API_KEY });
});

export default router;