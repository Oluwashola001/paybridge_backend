// routes/webhook.js
import express from 'express';
// Removed crypto import as Flutterwave hash check is direct comparison for now
import { pool } from '../db.js';
import dotenv from 'dotenv';

// Only load .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const router = express.Router();

/**
 * Flutterwave Webhook Handler
 */
router.post('/flutterwave', express.json({ type: '*/*' }), async (req, res) => {
  console.log('🔔 Received Flutterwave Webhook Request');
  // Log the raw body for debugging during setup
  // In production, you might want to remove or reduce this logging
  // console.log('Raw Flutterwave Body:', JSON.stringify(req.body, null, 2)); 

  // --- Verification Step ---
  // Flutterwave uses a 'verify-hash' header for basic security.
  // Retrieve the hash you set in your Flutterwave dashboard webhook settings.
  const flutterwaveSecretHash = process.env.FLUTTERWAVE_SECRET_HASH; 
  const signature = req.headers['verify-hash'];

  // 1. Check if the secret hash is configured in your environment
  if (!flutterwaveSecretHash) {
    console.warn("⚠️ FLUTTERWAVE_SECRET_HASH is not set in environment variables. Cannot verify webhook (UNSAFE!).");
    // CRITICAL: For production, you MUST return an error here to prevent processing unverified webhooks.
    // For testing *only*, you might proceed, but log this clearly.
    // return res.status(500).send('Webhook secret hash not configured'); 
  } 
  // 2. Check if the incoming request has the signature and if it matches
  else if (!signature || signature !== flutterwaveSecretHash) {
    console.error('❌ Invalid Flutterwave webhook signature received!');
    console.log('Expected Hash:', flutterwaveSecretHash); // Log expected hash for debugging
    console.log('Received Hash:', signature);        // Log received hash for debugging
    // Reject the request if the signature is missing or doesn't match
    return res.status(401).send('Invalid signature');
  } else {
    // Only log verification success if hash was actually checked
    console.log('✅ Flutterwave webhook signature verified.');
  }
  // --- End Verification Step ---

  const eventData = req.body; 

  // Check for the specific event type and status indicating a successful payment
  // According to Flutterwave docs, 'charge.completed' with status 'successful' is common
  if (eventData.event === 'charge.completed' && eventData.data?.status === 'successful') {
    console.log('Processing successful Flutterwave charge event...');
    try {
      // Extract necessary data from the payload (verify field names with Flutterwave docs)
      const transactionReference = eventData.data?.tx_ref; // Your unique reference (should be invoice_id)
      const flutterwaveTransactionId = eventData.data?.id; // Flutterwave's transaction ID
      // Optional: You might also want amount, currency for extra validation
      // const amountPaid = eventData.data?.amount;
      // const currency = eventData.data?.currency;

      if (!transactionReference) {
        console.error('❌ Flutterwave webhook payload missing transaction reference (tx_ref). Cannot update invoice.');
        // Respond with an error if the reference is missing
        return res.status(400).send('Missing transaction reference (tx_ref)');
      }

      // Update the invoice in your database
      // Use the tx_ref (which should match your invoice_id) to find the correct invoice
      const result = await pool.query(
        `UPDATE invoices 
         SET status = 'PAID', tx_hash = $1 
         WHERE invoice_id = $2 AND status = 'PENDING'`, // Only update if still pending
        [flutterwaveTransactionId, transactionReference] 
      );

      if (result.rowCount > 0) {
        console.log(`✅ Invoice ${transactionReference} marked as PAID via Flutterwave webhook.`);
      } else {
        console.warn(`⚠️ No pending invoice found or already paid for tx_ref: ${transactionReference}`);
        // Still send a 200 OK, as the webhook was processed, even if no DB update occurred
      }
      
      // Send a 200 OK response to Flutterwave to acknowledge receipt
      res.status(200).send('Webhook received and processed.');

    } catch (dbError) {
      console.error('❌ Database error updating invoice from Flutterwave webhook:', dbError);
      // Send a server error response if the database update failed
      res.status(500).send('Internal server error during database update');
    }
  } else {
    // If it's not a successful charge event, just acknowledge receipt
    console.log(`ℹ️ Received Flutterwave event type "${eventData.event || 'N/A'}" with status "${eventData.data?.status || 'N/A'}". Ignoring.`);
    res.status(200).send('Event received but not processed');
  }
});

// --- REMOVED OLD TRANSAK HANDLER ---
// The router.post("/transak", ...) block has been deleted.
// --- END REMOVAL ---

export default router;