import express from "express";
import "./db.js"; // ensure DB connects on startup
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import invoiceRoutes from "./routes/invoices.js";
import configRoutes from "./routes/config.js"; // ✅ new config route
import webhookRoutes from "./routes/webhook.js";
import { pool } from "./db.js"; // Import pool to check connection

// ✅ Only load .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

// ✅ CORS first - Updated to include DELETE method
app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin - REMEMBER TO UPDATE THIS LATER FOR VERCEL
    methods: ["GET", "POST", "DELETE"], // ✅ Added DELETE method
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Middleware
app.use(bodyParser.json());

// ✅ Routes
app.use("/api/invoices", invoiceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/config", configRoutes); // ✅ added config route

// ✅ Start server with DB connection check
const PORT = process.env.PORT || 4000; // Render provides PORT
app.listen(PORT, async () => { // Added async here
  console.log(`✅ PayBridge backend running securely on port ${PORT}`);
  // Add a connection check on startup
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL");
    client.release();
  } catch (err) {
    console.error("❌ Database connection error:", err);
  }
});