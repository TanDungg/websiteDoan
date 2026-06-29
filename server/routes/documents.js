const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// GET /api/documents -> mounted on /api/documents, so GET /
router.get("/", async (req, res) => {
  try {
    const result = await runQuery("SELECT * FROM documents ORDER BY date DESC");
    const docs = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      docNo: row.doc_no,
      date: row.date,
      category: row.category,
      fileUrl: row.file_url,
    }));
    res.json(docs);
  } catch (err) {
    console.error("Fetch docs API error:", err);
    res.status(500).json({ error: "Lỗi lấy danh sách văn bản" });
  }
});

// POST /api/documents -> mounted on /api/documents, so POST /
router.post("/", async (req, res) => {
  const { title, docNo, category, fileUrl } = req.body;
  const id = Date.now().toString();
  const date = new Date().toISOString().split("T")[0];
  try {
    await runQuery(
      `INSERT INTO documents (id, title, doc_no, date, category, file_url)
       VALUES (@id, @title, @docNo, @date, @category, @fileUrl)`,
      { id, title, docNo, date, category, fileUrl },
    );
    res
      .status(201)
      .json({ success: true, message: "Thêm văn bản thành công!", id });
  } catch (err) {
    console.error("Create doc API error:", err);
    res.status(500).json({ error: "Lỗi thêm văn bản" });
  }
});

// DELETE /api/documents/:id -> mounted on /api/documents, so DELETE /:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery("DELETE FROM documents WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa văn bản thành công!" });
  } catch (err) {
    console.error("Delete doc API error:", err);
    res.status(500).json({ error: "Lỗi xóa văn bản" });
  }
});

module.exports = router;
