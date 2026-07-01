const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");
const { sendRealtimeUpdate } = require("../realtime");

// GET /api/gopY -> mounted on /api/gopY, so GET /
router.get("/", async (req, res) => {
  try {
    const result = await runQuery('SELECT * FROM "gopY" ORDER BY "ngayGui" DESC');
    const feedbacks = result.rows.map((row) => ({
      id: row.id,
      hoTen: row.hoTen,
      soDienThoai: row.soDienThoai,
      email: row.email,
      donVi: row.donVi,
      tieuDe: row.tieuDe,
      noiDung: row.noiDung,
      ngayGui: row.ngayGui,
    }));
    res.json(feedbacks);
  } catch (err) {
    console.error("Fetch feedbacks API error:", err);
    res.status(500).json({ error: "Lỗi lấy hòm thư góp ý" });
  }
});

// POST /api/gopY -> mounted on /api/gopY, so POST /
router.post("/", async (req, res) => {
  const { hoTen, soDienThoai, email, donVi, tieuDe, noiDung } = req.body;
  const id = Date.now().toString();
  const date = new Date().toISOString().split("T")[0];
  try {
    await runQuery(
      `INSERT INTO "gopY" ("id", "hoTen", "soDienThoai", "email", "donVi", "tieuDe", "noiDung", "ngayGui")
       VALUES (@id, @hoTen, @soDienThoai, @email, @donVi, @tieuDe, @noiDung, @date)`,
      { id, hoTen, soDienThoai, email, donVi, tieuDe, noiDung, date },
    );
    sendRealtimeUpdate("gopY");
    res.status(201).json({
      success: true,
      message: "Gửi góp ý thành công! Xin cảm ơn bạn!",
    });
  } catch (err) {
    console.error("Submit feedback API error:", err);
    res.status(500).json({ error: "Lỗi gửi ý kiến đóng góp" });
  }
});

// DELETE /api/gopY/:id -> mounted on /api/gopY, so DELETE /:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM "gopY" WHERE "id" = @id', { id });
    sendRealtimeUpdate("gopY");
    res.json({ success: true, message: "Xóa ý kiến thành công!" });
  } catch (err) {
    console.error("Delete feedback API error:", err);
    res.status(500).json({ error: "Lỗi xóa ý kiến phản hồi" });
  }
});

module.exports = router;
