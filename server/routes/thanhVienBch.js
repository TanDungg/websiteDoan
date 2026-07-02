const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");
const { sendRealtimeUpdate } = require("../realtime");

// POST /api/thanhVienBch -> mounted on /api/thanhVienBch, so POST /
router.post("/", async (req, res) => {
  const {
    hoTen,
    chucVu,
    email,
    soDienThoai,
    anhDaiDien,
    nhiemVu,
  } = req.body;
  const id = Date.now().toString();
  const createdBy = "admin";
  const createdAt = new Date().toISOString();
  try {
    await runQuery(
      `INSERT INTO "thanhVienBch" ("id", "hoTen", "chucVu", "email", "soDienThoai", "anhDaiDien", "nhiemVu", "createdBy", "createdAt", "updatedBy", "updatedAt")
       VALUES (@id, @hoTen, @chucVu, @email, @soDienThoai, @anhDaiDien, @nhiemVu, @createdBy, @createdAt, @createdBy, @createdAt)`,
      {
        id,
        hoTen,
        chucVu: parseInt(chucVu) || 4,
        email,
        soDienThoai,
        anhDaiDien,
        nhiemVu,
        createdBy,
        createdAt,
      },
    );
    sendRealtimeUpdate("thanhVienBch");
    res
      .status(201)
      .json({ success: true, message: "Thêm thành viên BCH thành công!", id });
  } catch (err) {
    console.error("POST /api/thanhVienBch error:", err);
    res.status(500).json({ error: "Lỗi thêm thành viên BCH" });
  }
});

// PUT /api/thanhVienBch/:id -> mounted on /api/thanhVienBch, so PUT /:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    hoTen,
    chucVu,
    email,
    soDienThoai,
    anhDaiDien,
    nhiemVu,
  } = req.body;
  const updatedBy = "admin";
  const updatedAt = new Date().toISOString();
  try {
    await runQuery(
      `UPDATE "thanhVienBch" 
       SET "hoTen" = @hoTen, "chucVu" = @chucVu, "email" = @email, "soDienThoai" = @soDienThoai, "anhDaiDien" = @anhDaiDien, "nhiemVu" = @nhiemVu, "updatedBy" = @updatedBy, "updatedAt" = @updatedAt
       WHERE "id" = @id`,
      {
        id,
        hoTen,
        chucVu: parseInt(chucVu) || 4,
        email,
        soDienThoai,
        anhDaiDien,
        nhiemVu,
        updatedBy,
        updatedAt,
      },
    );
    sendRealtimeUpdate("thanhVienBch");
    res.json({ success: true, message: "Cập nhật thành viên BCH thành công!" });
  } catch (err) {
    console.error("PUT /api/thanhVienBch error:", err);
    res.status(500).json({ error: "Lỗi cập nhật thành viên BCH" });
  }
});

// DELETE /api/thanhVienBch/:id -> mounted on /api/thanhVienBch, so DELETE /:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM "thanhVienBch" WHERE "id" = @id', { id });
    sendRealtimeUpdate("thanhVienBch");
    res.json({ success: true, message: "Xóa thành viên BCH thành công!" });
  } catch (err) {
    console.error("DELETE /api/thanhVienBch error:", err);
    res.status(500).json({ error: "Lỗi xóa thành viên BCH" });
  }
});

// POST /api/thanhVienBch/bulk
router.post("/bulk", async (req, res) => {
  const { list } = req.body;
  if (!Array.isArray(list)) {
    return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
  }
  const createdBy = "admin";
  const createdAt = new Date().toISOString();
  try {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const { hoTen, chucVu, email, soDienThoai, anhDaiDien, nhiemVu } = item;
      const id = (Date.now() + i).toString() + Math.random().toString(36).substring(2, 6);
      const chucVuVal = parseInt(chucVu) || 4;
      const imgVal = anhDaiDien || "";
      await runQuery(
        `INSERT INTO "thanhVienBch" ("id", "hoTen", "chucVu", "email", "soDienThoai", "anhDaiDien", "nhiemVu", "createdBy", "createdAt", "updatedBy", "updatedAt")
         VALUES (@id, @hoTen, @chucVuVal, @email, @soDienThoai, @imgVal, @nhiemVu, @createdBy, @createdAt, @createdBy, @createdAt)`,
        {
          id,
          hoTen,
          chucVuVal,
          email,
          soDienThoai,
          imgVal,
          nhiemVu,
          createdBy,
          createdAt,
        },
      );
    }
    sendRealtimeUpdate("thanhVienBch");
    res.json({ success: true, message: `Import thành công ${list.length} thành viên BCH!` });
  } catch (err) {
    console.error("POST /api/thanhVienBch/bulk error:", err);
    res.status(500).json({ error: "Lỗi import danh sách thành viên BCH", details: err.message });
  }
});

module.exports = router;
