// utils/verifySignature.js
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export default function verifySignature(req) {
  try {
    const signature = req.headers["x-transak-signature"];
    const secret = process.env.TRANSAK_SECRET;

    if (!signature || !secret) {
      console.warn("Missing signature or TRANSAK_SECRET");
      return false;
    }

    // Some servers wrap the body differently — ensure it's a clean JSON string
    const payload =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    const computed = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return signature === computed;
  } catch (err) {
    console.error("Signature verify error:", err);
    return false;
  }
}
