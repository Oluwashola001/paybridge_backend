// routes/webhook.js
import express from "express";
import { pool } from "../db.js";
import verifySignature from "../utils/verifySignature.js";

const router = express.Router();

// Webhook: Transak → mark invoice as paid
router.post("/transak", express.json({ type: "*/*" }), async (req, res) => {
  try {
    // verifySignature should check req.headers["x-transak-signature"]
    const isValid = true;

    if (!isValid) {
      console.warn("⚠️ Invalid webhook signature");
      return res
        .status(403)
        .json({ success: false, message: "Invalid signature" });
    }

    // Transak sends data in req.body.data
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const invoiceId = data.merchantOrderId; // or whatever field you used when creating the Transak order

    // Only mark as paid when status is completed/success
    if (
      data.status === "COMPLETED" ||
      data.status === "SUCCESS" ||
      data.status === "ORDER_COMPLETED"
    ) {
      await pool.query(
        `UPDATE invoices SET status = 'PAID', tx_hash = $1 WHERE invoice_id = $2`,
        [data.transactionHash, invoiceId]
      );

      console.log(`✅ Invoice ${invoiceId} marked as PAID`);
    } else {
      console.log(`ℹ️ Ignored event with status: ${data.status}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
