const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// GET /api/feedbacks -> mounted on /api/feedbacks, so GET /
router.get("/", async (req, res) => {
  try {
    const result = await runQuery("SELECT * FROM feedbacks ORDER BY date DESC");
    const feedbacks = result.rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      phone: row.phone,
      email: row.email,
      unit: row.unit,
      subject: row.subject,
      message: row.message,
      date: row.date,
    }));
    res.json(feedbacks);
  } catch (err) {
    console.error("Fetch feedbacks API error:", err);
    res.status(500).json({ error: "Lỗi lấy hòm thư góp ý" });
  }
});

// POST /api/feedbacks -> mounted on /api/feedbacks, so POST /
router.post("/", async (req, res) => {
  const { fullName, phone, email, unit, subject, message } = req.body;
  const id = Date.now().toString();
  const date = new Date().toISOString().split("T")[0];
  try {
    await runQuery(
      `INSERT INTO feedbacks (id, full_name, phone, email, unit, subject, message, date)
       VALUES (@id, @fullName, @phone, @email, @unit, @subject, @message, @date)`,
      { id, fullName, phone, email, unit, subject, message, date },
    );
    res.status(201).json({
      success: true,
      message: "Gửi góp ý thành công! Xin cảm ơn bạn!",
    });
  } catch (err) {
    console.error("Submit feedback API error:", err);
    res.status(500).json({ error: "Lỗi gửi ý kiến đóng góp" });
  }
});

// DELETE /api/feedbacks/:id -> mounted on /api/feedbacks, so DELETE /:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery("DELETE FROM feedbacks WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa ý kiến thành công!" });
  } catch (err) {
    console.error("Delete feedback API error:", err);
    res.status(500).json({ error: "Lỗi xóa ý kiến phản hồi" });
  }
});

module.exports = router;
