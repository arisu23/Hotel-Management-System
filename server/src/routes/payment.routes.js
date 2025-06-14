const express = require("express");
const router = express.Router();
const { pool } = require("../config/db.config");
const { verifyToken } = require("../middleware/auth.middleware");

// Create payment
router.post("/", verifyToken, async (req, res) => {
  try {
    const { booking_id, amount, payment_method, payment_details, status } =
      req.body;

    // Validate required fields
    if (!booking_id || !amount || !payment_method) {
      return res
        .status(400)
        .json({ message: "Missing required payment fields" });
    }

    // Validate payment method
    if (!["card", "e-wallet"].includes(payment_method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create payment record
      const [paymentResult] = await connection.execute(
        "INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, ?, ?)",
        [booking_id, amount, payment_method, status || "completed"]
      );

      const paymentId = paymentResult.insertId;

      // Insert payment details based on payment method
      if (payment_method === "card") {
        const { cardNumber, expiryDate, cvv, cardholderName } =
          payment_details || {};
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
          throw new Error("Missing required card payment details");
        }
        await connection.execute(
          "INSERT INTO card_payments (payment_id, card_number, expiry_date, cvv, cardholder_name) VALUES (?, ?, ?, ?, ?)",
          [paymentId, cardNumber, expiryDate, cvv, cardholderName]
        );
      } else if (payment_method === "e-wallet") {
        const { walletType, accountNumber } = payment_details || {};
        if (!walletType || !accountNumber) {
          throw new Error("Missing required e-wallet payment details");
        }
        await connection.execute(
          "INSERT INTO e_wallet_payments (payment_id, wallet_type, account_number) VALUES (?, ?, ?)",
          [paymentId, walletType, accountNumber]
        );
      }

      // Update booking payment status
      await connection.execute(
        "UPDATE bookings SET payment_status = 'paid' WHERE id = ?",
        [booking_id]
      );

      await connection.commit();

      // Fetch complete payment details
      let paymentDetails = null;
      if (payment_method === "card") {
        const [cardDetails] = await connection.execute(
          "SELECT * FROM card_payments WHERE payment_id = ?",
          [paymentId]
        );
        paymentDetails = cardDetails[0];
      } else if (payment_method === "e-wallet") {
        const [walletDetails] = await connection.execute(
          "SELECT * FROM e_wallet_payments WHERE payment_id = ?",
          [paymentId]
        );
        paymentDetails = walletDetails[0];
      }

      res.status(201).json({
        message: "Payment processed successfully",
        id: paymentId,
        payment: {
          id: paymentId,
          booking_id,
          amount,
          payment_method,
          payment_details: paymentDetails,
          status: status || "completed",
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      message: "Error processing payment",
      error: error.message,
    });
  }
});

// Get payment by booking ID
router.get("/booking/:bookingId", verifyToken, async (req, res) => {
  try {
    const [payments] = await pool.execute(
        "SELECT * FROM payments WHERE booking_id = ?",
        [req.params.bookingId]
      );

      if (payments.length === 0) {
        return res.status(404).json({ message: "Payment not found" });
      }

    res.json(payments[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching payment" });
  }
});

module.exports = router;
