const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// GET /api/loaiChiDoan
router.get("/", async (req, res) => {
  try {
    const result = await runQuery('SELECT * FROM "loaiChiDoan"');
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/loaiChiDoan error:", err);
    res.status(500).json({ error: "Lỗi tải danh mục phân loại chi đoàn" });
  }
});

// POST /api/loaiChiDoan
router.post("/", async (req, res) => {
  const { name, tenLoai } = req.body;
  const nameVal = tenLoai || name;
  const id = Date.now().toString();
  const createdBy = "admin";
  const createdAt = new Date().toISOString();

  try {
    await runQuery(
      `INSERT INTO "loaiChiDoan" ("id", "tenLoai", "createdBy", "createdAt", "updatedBy", "updatedAt")
       VALUES (@id, @nameVal, @createdBy, @createdAt, @createdBy, @createdAt)`,
      { id, nameVal, createdBy, createdAt }
    );
    res.status(201).json({ success: true, message: "Thêm phân loại chi đoàn thành công!", id });
  } catch (err) {
    console.error("POST /api/loaiChiDoan error:", err);
    res.status(500).json({ error: "Lỗi thêm phân loại chi đoàn" });
  }
});

// PUT /api/loaiChiDoan/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, tenLoai } = req.body;
  const nameVal = tenLoai || name;
  const updatedBy = "admin";
  const updatedAt = new Date().toISOString();

  try {
    await runQuery(
      `UPDATE "loaiChiDoan" 
       SET "tenLoai" = @nameVal, "updatedBy" = @updatedBy, "updatedAt" = @updatedAt
       WHERE "id" = @id`,
      { id, nameVal, updatedBy, updatedAt }
    );
    res.json({ success: true, message: "Cập nhật phân loại chi đoàn thành công!" });
  } catch (err) {
    console.error("PUT /api/loaiChiDoan error:", err);
    res.status(500).json({ error: "Lỗi cập nhật phân loại chi đoàn" });
  }
});

// DELETE /api/loaiChiDoan/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM "loaiChiDoan" WHERE "id" = @id', { id });
    res.json({ success: true, message: "Xóa phân loại chi đoàn thành công!" });
  } catch (err) {
    console.error("DELETE /api/loaiChiDoan error:", err);
    res.status(500).json({ error: "Lỗi xóa phân loại chi đoàn" });
  }
});

module.exports = router;
