// utils/generateReceipt.js
import PDFDocument from "pdfkit";
import axios from "axios"; // Import axios

// --- We must make the function async to fetch the logo ---
export default async function generateReceipt(invoice, res) {
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

    // ======= HEADER SECTION (IMPROVED) =======

    // --- Fetch Logo from URL ---
    // !!! REPLACE THIS with your logo's public URL (e.g., from Vercel)
    const logoUrl = "https://paybridge-frontend-sooty.vercel.app/logo-paybridge.png"; 
    
    try {
      const logoResponse = await axios.get(logoUrl, {
        responseType: "arraybuffer", // Get image as a buffer
      });
      const logoBuffer = Buffer.from(logoResponse.data, "binary");
      // Draw the logo on the left
      doc.image(logoBuffer, 50, 45, { width: 60 });
    } catch (logoError) {
      console.error("Could not fetch logo for PDF:", logoError.message);
      // If logo fails, just write text
      doc.fontSize(10).fillColor("#999").text("PayBridge", 50, 45);
    }

    // --- Draw Business Info on the Right ---
    doc
      .fillColor("#333")
      .fontSize(20)
      .text("PAYBRIDGE", 200, 50, { align: "right" }) // Aligned to the right
      .fontSize(14)
      .fillColor("#555")
      .text("RECEIPT", 200, 75, { align: "right" }) // Sub-header
      .moveDown(3); // More space after header

    // ======= METADATA & CLIENT DETAILS =======
    
    // --- Invoice Metadata (Left) ---
    const metadataY = doc.y; // Save Y position
    doc
      .fontSize(12)
      .fillColor("#000")
      .text(`Invoice ID: ${invoice.invoice_id}`)
      .text(`Status: ${invoice.status}`)
      .text(`Date: ${new Date(invoice.created_at).toLocaleString()}`);
      
    // --- Client Details (Right) ---
    doc
      .fontSize(12)
      .fillColor("#000")
      .text(`Billed To:`, 300, metadataY) // Align with metadata
      .text(invoice.client_name || "N/A", 300, doc.y)
      .text(invoice.client_email || "Not provided", 300, doc.y)
      .text(invoice.client_phone || "Not provided", 300, doc.y)
      .moveDown(2);


    // draw line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#999").stroke().moveDown(1.5);

    // ======= INVOICE DETAILS (Payment Summary) =======
    doc
      .fontSize(14)
      .fillColor("#333") // Darker color for summary
      .text("Payment Summary", 50, doc.y)
      .moveDown(0.5);

    const startY = doc.y;
    
    // Table Headers
    doc
      .fontSize(12)
      .fillColor("#555") // Grey for headers
      .text("Description", 50, startY)
      .text("Amount (USD)", 450, startY, { align: "right" });

    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).strokeColor("#ccc").stroke().moveDown(1);
      
    // Table Content
    doc
      .fontSize(12)
      .fillColor("#000")
      .text(invoice.description || "N/A", 50, doc.y)
      .text(`$${parseFloat(invoice.amount).toFixed(2)}`, 450, doc.y, { align: "right" });
    
    doc.moveDown(2);
    
    // draw line
    doc.moveTo(300, doc.y).lineTo(550, doc.y).strokeColor("#999").stroke().moveDown(1);

    // ======= TOTAL SECTION =======
    doc
      .fontSize(16) // Larger total
      .fillColor("#000")
      .text(`Total Paid: $${parseFloat(invoice.amount).toFixed(2)}`, { align: "right" })
      .moveDown(3);

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
    if (!res.headersSent) {
      res.status(500).send("Error generating receipt");
    }
  }
}