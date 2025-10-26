// routes/config.js
import express from "express";
import dotenv from "dotenv";

// Only load .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const router = express.Router();

// ❌ REMOVED: Transak key endpoint is no longer needed
/*
router.get("/transak-key", (req, res) => {
  // ... old Transak code ...
  res.json({ apiKey: process.env.TRANSAK_API_KEY });
});
*/

// ✅ ADDED: Flutterwave public key endpoint
router.get("/flutterwave-key", (req, res) => {
  // The global CORS middleware in index.js handles allowed origins

  // Ensure FLUTTERWAVE_PUBLIC_KEY is set in your .env / Render environment
  const publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY;

  if (!publicKey) {
      console.error("CRITICAL ERROR: FLUTTERWAVE_PUBLIC_KEY is not set in environment variables!");
      // Don't send the key if it's missing
      return res.status(500).json({ error: "Payment processor configuration error on server." });
  }

  // Send the public key
  res.json({ publicKey: publicKey });
});

export default router;