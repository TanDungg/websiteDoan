const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// GET /api/thongKe -> statistics of visits
router.get("/", async (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  try {
    // 1. Get today's visits
    const todayResult = await runQuery('SELECT "soLuotTruyCap" FROM "thongKeTruyCap" WHERE "ngay" = @ngay', { ngay: today });
    const homNay = todayResult.rows.length > 0 ? (Number(todayResult.rows[0].soLuotTruyCap) || 0) : 0;

    // 2. Get total visits
    const totalResult = await runQuery('SELECT "soLuotTruyCap" FROM "thongKeTruyCap"');
    const tongCong = totalResult.rows.reduce((sum, row) => sum + (Number(row.soLuotTruyCap) || 0), 0);

    // 3. Mock online users (random number between 5 and 18 for display consistency)
    const online = Math.floor(Math.random() * 14) + 5;

    res.json({
      online,
      homNay,
      tongCong: tongCong || homNay // Fallback to homNay if total is 0
    });
  } catch (err) {
    console.error("Fetch statistics API error:", err);
    res.status(500).json({ error: "Lỗi lấy thống kê truy cập" });
  }
});

module.exports = router;
