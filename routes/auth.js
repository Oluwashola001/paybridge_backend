// routes/auth.js
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// simple login route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    return res.json({ success: true, message: "Login successful" });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

export default router;
