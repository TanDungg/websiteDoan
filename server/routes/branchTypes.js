const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// GET /api/branch-types -> list all branch types
router.get("/", async (req, res) => {
  try {
    const result = await runQuery("SELECT * FROM branch_types");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/branch-types error:", err);
    res.status(500).json({ error: "Lỗi tải danh mục phân loại chi đoàn" });
  }
});

// POST /api/branch-types -> create a new branch type
router.post("/", async (req, res) => {
  const { name } = req.body;
  const id = Date.now().toString();
  const createdBy = "admin"; // default logged-in admin user
  const createdAt = new Date().toISOString();

  try {
    await runQuery(
      `INSERT INTO branch_types (id, name, created_by, created_at, updated_by, updated_at)
       VALUES (@id, @name, @createdBy, @createdAt, @createdBy, @createdAt)`,
      { id, name, createdBy, createdAt }
    );
    res.status(201).json({ success: true, message: "Thêm phân loại chi đoàn thành công!", id });
  } catch (err) {
    console.error("POST /api/branch-types error:", err);
    res.status(500).json({ error: "Lỗi thêm phân loại chi đoàn" });
  }
});

// PUT /api/branch-types/:id -> update a branch type
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const updatedBy = "admin";
  const updatedAt = new Date().toISOString();

  try {
    await runQuery(
      `UPDATE branch_types 
       SET name = @name, updated_by = @updatedBy, updated_at = @updatedAt
       WHERE id = @id`,
      { id, name, updatedBy, updatedAt }
    );
    res.json({ success: true, message: "Cập nhật phân loại chi đoàn thành công!" });
  } catch (err) {
    console.error("PUT /api/branch-types error:", err);
    res.status(500).json({ error: "Lỗi cập nhật phân loại chi đoàn" });
  }
});

// DELETE /api/branch-types/:id -> delete a branch type
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Delete branches cascading or by foreign key
    await runQuery("DELETE FROM branch_types WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa phân loại chi đoàn thành công!" });
  } catch (err) {
    console.error("DELETE /api/branch-types error:", err);
    res.status(500).json({ error: "Lỗi xóa phân loại chi đoàn" });
  }
});

module.exports = router;
