const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");
const { sendRealtimeUpdate } = require("../realtime");

// POST /api/chiDoan
router.post("/", async (req, res) => {
  const { name, tenChiDoan, branchTypeId, loaiChiDoanId } = req.body;
  const nameVal = tenChiDoan || name;
  const typeIdVal = loaiChiDoanId || branchTypeId;
  const id = Date.now().toString();
  const createdBy = "admin";
  const createdAt = new Date().toISOString();
  try {
    await runQuery(
      `INSERT INTO "chiDoan" ("id", "tenChiDoan", "loaiChiDoanId", "createdBy", "createdAt", "updatedBy", "updatedAt")
       VALUES (@id, @nameVal, @typeIdVal, @createdBy, @createdAt, @createdBy, @createdAt)`,
      {
        id,
        nameVal,
        typeIdVal,
        createdBy,
        createdAt,
      },
    );
    sendRealtimeUpdate("chiDoan");
    res
      .status(201)
      .json({ success: true, message: "Thêm chi đoàn thành công!", id });
  } catch (err) {
    console.error("POST /api/chiDoan error:", err);
    res.status(500).json({ error: "Lỗi thêm chi đoàn trực thuộc", details: err.message });
  }
});

// PUT /api/chiDoan/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, tenChiDoan, branchTypeId, loaiChiDoanId } = req.body;
  const nameVal = tenChiDoan || name;
  const typeIdVal = loaiChiDoanId || branchTypeId;
  const updatedBy = "admin";
  const updatedAt = new Date().toISOString();
  try {
    await runQuery(
      `UPDATE "chiDoan" 
       SET "tenChiDoan" = @nameVal, "loaiChiDoanId" = @typeIdVal, "updatedBy" = @updatedBy, "updatedAt" = @updatedAt
       WHERE "id" = @id`,
      {
        id,
        nameVal,
        typeIdVal,
        updatedBy,
        updatedAt,
      },
    );
    sendRealtimeUpdate("chiDoan");
    res.json({ success: true, message: "Cập nhật chi đoàn thành công!" });
  } catch (err) {
    console.error("PUT /api/chiDoan error:", err);
    res.status(500).json({ error: "Lỗi cập nhật chi đoàn trực thuộc" });
  }
});

// DELETE /api/chiDoan/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM "chiDoan" WHERE "id" = @id', { id });
    sendRealtimeUpdate("chiDoan");
    res.json({ success: true, message: "Xóa chi đoàn thành công!" });
  } catch (err) {
    console.error("DELETE /api/chiDoan error:", err);
    res.status(500).json({ error: "Lỗi xóa chi đoàn trực thuộc" });
  }
});

module.exports = router;
