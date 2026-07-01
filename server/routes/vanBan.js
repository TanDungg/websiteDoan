const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");
const { sendRealtimeUpdate } = require("../realtime");

// GET /api/vanBan -> mounted on /api/vanBan, so GET /
router.get("/", async (req, res) => {
  try {
    const result = await runQuery('SELECT * FROM "vanBan" ORDER BY "ngayBanHanh" DESC');
    const docs = result.rows.map((row) => ({
      id: row.id,
      tenVanBan: row.tenVanBan,
      soHieu: row.soHieu,
      ngayBanHanh: row.ngayBanHanh,
      loaiVanBan: row.loaiVanBan,
      duongDanFile: row.duongDanFile,
    }));
    res.json(docs);
  } catch (err) {
    console.error("Fetch docs API error:", err);
    res.status(500).json({ error: "Lỗi lấy danh sách văn bản" });
  }
});

// POST /api/vanBan -> mounted on /api/vanBan, so POST /
router.post("/", async (req, res) => {
  const { tenVanBan, soHieu, loaiVanBan, duongDanFile } = req.body;
  const id = Date.now().toString();
  const date = new Date().toISOString().split("T")[0];
  const createdBy = "admin";
  const createdAt = new Date().toISOString();
  try {
    await runQuery(
      `INSERT INTO "vanBan" ("id", "tenVanBan", "soHieu", "ngayBanHanh", "loaiVanBan", "duongDanFile", "createdBy", "createdAt", "updatedBy", "updatedAt")
       VALUES (@id, @tenVanBan, @soHieu, @date, @loaiVanBan, @duongDanFile, @createdBy, @createdAt, @createdBy, @createdAt)`,
      { id, tenVanBan, soHieu, date, loaiVanBan, duongDanFile, createdBy, createdAt },
    );
    sendRealtimeUpdate("vanBan");
    res
      .status(201)
      .json({ success: true, message: "Thêm văn bản thành công!", id });
  } catch (err) {
    console.error("Create doc API error:", err);
    res.status(500).json({ error: "Lỗi thêm văn bản" });
  }
});

// DELETE /api/vanBan/:id -> mounted on /api/vanBan, so DELETE /:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM "vanBan" WHERE "id" = @id', { id });
    sendRealtimeUpdate("vanBan");
    res.json({ success: true, message: "Xóa văn bản thành công!" });
  } catch (err) {
    console.error("Delete doc API error:", err);
    res.status(500).json({ error: "Lỗi xóa văn bản" });
  }
});

module.exports = router;
