// utils/generateReceipt.js
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export default function generateReceipt(invoice, res) {
  try {
    const doc = new PDFDocument({ margin: 50 });

    // setup response headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${invoice.invoice_id}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    // pipe PDF to HTTP response
    doc.pipe(res);

    // ======= HEADER SECTION =======
    const logoPath = path.resolve("public/logo.png"); // optional if you have a logo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 60 });
    }
    doc
      .fillColor("#333")
      .fontSize(20)
      .text("PAYBRIDGE RECEIPT", 120, 50, { align: "left" })
      .moveDown(2);

    // invoice metadata box
    doc
      .fontSize(12)
      .fillColor("#000")
      .text(`Invoice ID: ${invoice.invoice_id}`)
      .text(`Status: ${invoice.status}`)
      .text(`Date: ${new Date(invoice.created_at).toLocaleString()}`)
      .moveDown();

    // draw line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#999").stroke().moveDown(1.5);

    // ======= CLIENT DETAILS =======
    doc
      .fontSize(14)
      .fillColor("#007BFF")
      .text("Billed To", { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .fillColor("#000")
      .text(`Client Name: ${invoice.client_name || "N/A"}`)
      .text(`Wallet Address: ${invoice.wallet_address || "N/A"}`)
      .moveDown(1.5);

    // ======= INVOICE DETAILS =======
    doc
      .fontSize(14)
      .fillColor("#007BFF")
      .text("Payment Summary", { underline: true })
      .moveDown(0.5);

    const startX = 50;
    const startY = doc.y;
    const columnWidth = 200;

    doc
      .fontSize(12)
      .fillColor("#000")
      .text("Description", startX, startY)
      .text("Amount (USD)", startX + columnWidth * 2, startY)
      .moveDown(0.5)
      .text(invoice.description || "N/A", startX, doc.y)
      .text(`$${invoice.amount}`, startX + columnWidth * 2, doc.y);

    // draw box under items
    doc
      .moveTo(50, doc.y + 10)
      .lineTo(550, doc.y + 10)
      .strokeColor("#007BFF")
      .stroke()
      .moveDown(1.5);

    // ======= TOTAL SECTION =======
    doc
      .fontSize(14)
      .fillColor("#000")
      .text(`Total: $${invoice.amount}`, { align: "right" })
      .moveDown(2);

    // ======= FOOTER =======
    doc
      .fontSize(10)
      .fillColor("#555")
      .text("Thank you for your business!", { align: "center" })
      .text("For support, contact support@paybridge.com", { align: "center" });

    // finalize PDF
    doc.end();
  } catch (err) {
    console.error("Error generating receipt:", err);
    res.status(500).send("Error generating receipt");
  }
}
