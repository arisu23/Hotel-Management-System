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
    const connection = await pool.getConnection();
    try {
      // Get payment record
      const [payments] = await connection.execute(
        "SELECT * FROM payments WHERE booking_id = ?",
        [req.params.bookingId]
      );

      if (payments.length === 0) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const payment = payments[0];

      // Get payment details based on payment method
      let paymentDetails = null;
      if (payment.payment_method === "card") {
        const [cardDetails] = await connection.execute(
          "SELECT * FROM card_payments WHERE payment_id = ?",
          [payment.id]
        );
        paymentDetails = cardDetails[0];
      } else if (payment.payment_method === "e-wallet") {
        const [walletDetails] = await connection.execute(
          "SELECT * FROM e_wallet_payments WHERE payment_id = ?",
          [payment.id]
        );
        paymentDetails = walletDetails[0];
      }

      res.json({
        ...payment,
        payment_details: paymentDetails,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      message: "Error fetching payment details",
      error: error.message,
    });
  }
});

// Cancel payment
router.put("/:bookingId/cancel", verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get payment ID
      const [payments] = await connection.execute(
        "SELECT id, payment_method FROM payments WHERE booking_id = ?",
        [bookingId]
      );

      if (payments.length > 0) {
        const payment = payments[0];

        // Delete payment details based on payment method
        if (payment.payment_method === "card") {
          await connection.execute(
            "DELETE FROM card_payments WHERE payment_id = ?",
            [payment.id]
          );
        } else if (payment.payment_method === "e-wallet") {
          await connection.execute(
            "DELETE FROM e_wallet_payments WHERE payment_id = ?",
            [payment.id]
          );
        }

        // Delete payment record
        await connection.execute("DELETE FROM payments WHERE id = ?", [
          payment.id,
        ]);
      }

      // Update booking payment status to cancelled
      await connection.execute(
        "UPDATE bookings SET payment_status = 'cancelled' WHERE id = ?",
        [bookingId]
      );

      await connection.commit();
      res.json({ message: "Payment cancelled successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error cancelling payment:", error);
    res.status(500).json({
      message: "Error cancelling payment",
      error: error.message,
    });
  }
});

module.exports = router;
