const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// POST /api/branches -> mounted on /api/branches, so POST /
router.post("/", async (req, res) => {
  const { name, branchTypeId } = req.body;
  const id = Date.now().toString();
  const createdBy = "admin";
  const createdAt = new Date().toISOString();
  try {
    await runQuery(
      `INSERT INTO branches (id, name, branch_type_id, created_by, created_at, updated_by, updated_at)
       VALUES (@id, @name, @branchTypeId, @createdBy, @createdAt, @createdBy, @createdAt)`,
      {
        id,
        name,
        branchTypeId,
        createdBy,
        createdAt,
      },
    );
    res
      .status(201)
      .json({ success: true, message: "Thêm chi đoàn thành công!", id });
  } catch (err) {
    console.error("POST /api/branches error:", err);
    res.status(500).json({ error: "Lỗi thêm chi đoàn trực thuộc" });
  }
});

// PUT /api/branches/:id -> mounted on /api/branches, so PUT /:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, branchTypeId } = req.body;
  const updatedBy = "admin";
  const updatedAt = new Date().toISOString();
  try {
    await runQuery(
      `UPDATE branches 
       SET name = @name, branch_type_id = @branchTypeId, updated_by = @updatedBy, updated_at = @updatedAt
       WHERE id = @id`,
      {
        id,
        name,
        branchTypeId,
        updatedBy,
        updatedAt,
      },
    );
    res.json({ success: true, message: "Cập nhật chi đoàn thành công!" });
  } catch (err) {
    console.error("PUT /api/branches error:", err);
    res.status(500).json({ error: "Lỗi cập nhật chi đoàn trực thuộc" });
  }
});

// DELETE /api/branches/:id -> mounted on /api/branches, so DELETE /:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery("DELETE FROM branches WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa chi đoàn thành công!" });
  } catch (err) {
    console.error("DELETE /api/branches error:", err);
    res.status(500).json({ error: "Lỗi xóa chi đoàn trực thuộc" });
  }
});

module.exports = router;
