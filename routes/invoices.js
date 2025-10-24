// routes/invoices.js
import express from "express";
import { pool } from "../db.js";
import generateReceipt from "../utils/generateReceipt.js";

const router = express.Router();

// 🧾 Create invoice
router.post("/", async (req, res) => {
  try {
    const { client_name, description, amount, wallet_address } = req.body;
    const invoice_id = "INV" + Date.now();

    const result = await pool.query(
      `INSERT INTO invoices (invoice_id, client_name, description, amount, wallet_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [invoice_id, client_name, description, amount, wallet_address]
    );

    res.json({
      success: true,
      invoice: result.rows[0],
      link: `${process.env.BASE_URL}/invoice/${invoice_id}`,
    });
  } catch (err) {
    console.error("Error creating invoice:", err); // Log the specific error
    res
      .status(500)
      .json({ success: false, message: "Error creating invoice" });
  }
});

// 📋 Get all invoices
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM invoices ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching invoices:", err); // Log the specific error
    res
      .status(500)
      .json({ success: false, message: "Error fetching invoices" });
  }
});

// 🔍 Get a single invoice by ID (using invoice_id string)
router.get("/:invoiceId", async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const result = await pool.query(
      "SELECT * FROM invoices WHERE invoice_id = $1",
      [invoiceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching single invoice:", err); // Log the specific error
    res.status(500).json({ message: "Server error" });
  }
});

// 🧾 Download receipt for a specific invoice (using invoice_id string)
router.get("/:invoiceId/receipt", async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const result = await pool.query(
      "SELECT * FROM invoices WHERE invoice_id = $1",
      [invoiceId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    const invoice = result.rows[0];
    generateReceipt(invoice, res);
  } catch (err) {
    console.error("Receipt download error:", err); // Log the specific error
    res
      .status(500)
      .json({ success: false, message: "Error generating receipt" });
  }
});

// 🗑️ Delete a single invoice by its database ID (primary key number)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Use the database primary key ID (e.g., /api/invoices/3)

    // Ensure id is a valid number before querying
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        return res.status(400).json({ success: false, message: "Invalid invoice ID format" });
    }

    const result = await pool.query(
      "DELETE FROM invoices WHERE id = $1 RETURNING *", // Use 'id' column
      [numericId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Invoice not found for deletion" });
    }

    console.log(`🗑️ Invoice with DB ID ${numericId} deleted`);
    res.json({ success: true, message: "Invoice deleted successfully" });

  } catch (err) {
    console.error("Error deleting invoice:", err); // Log the specific error
    res.status(500).json({ success: false, message: "Server error during deletion" });
  }
});

// 🗑️ Delete ALL invoices (Clear History)
router.delete("/", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM invoices RETURNING id");

    console.log(`🗑️ Cleared all invoice history. ${result.rowCount} invoices deleted.`);
    res.json({ success: true, message: `Successfully deleted ${result.rowCount} invoices.` });

  } catch (err) {
    console.error("Error clearing invoice history:", err); // Log the specific error
    res.status(500).json({ success: false, message: "Server error while clearing history" });
  }
});

export default router;