const express = require("express");
const router = express.Router();
const { pool } = require("../config/db.config");

// Get monthly income data
router.get("/monthly-income", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const query = `
      WITH RECURSIVE months AS (
        SELECT 1 as month
        UNION ALL
        SELECT month + 1
        FROM months
        WHERE month < 12
      ),
      monthly_payments AS (
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          SUM(amount) as total
        FROM payments 
        WHERE status = 'paid'
        AND YEAR(created_at) = ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      )
      SELECT 
        DATE_FORMAT(STR_TO_DATE(CONCAT(?, '-', m.month, '-01'), '%Y-%m-%d'), '%Y-%m') as month,
        COALESCE(mp.total, 0) as total
      FROM months m
      LEFT JOIN monthly_payments mp ON DATE_FORMAT(STR_TO_DATE(CONCAT(?, '-', m.month, '-01'), '%Y-%m-%d'), '%Y-%m') = mp.month
      ORDER BY m.month ASC
    `;

    const [results] = await pool.query(query, [
      currentYear,
      currentYear,
      currentYear,
    ]);

    // Format the months to be more readable
    const formattedResults = results.map((item) => ({
      ...item,
      month: new Date(item.month + "-01").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }),
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Error fetching monthly income:", error);
    res.status(500).json({ error: "Failed to fetch monthly income data" });
  }
});

module.exports = router;
