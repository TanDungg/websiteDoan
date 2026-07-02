const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");
const { sendRealtimeUpdate } = require("../realtime");

// GET /api/doanVien
router.get("/", async (req, res) => {
  try {
    const result = await runQuery(
      `SELECT m.*, b."tenChiDoan" as "branchName" 
       FROM "doanVien" m 
       LEFT JOIN "chiDoan" b ON m."chiDoanId" = b."id"`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/doanVien error:", err);
    res.status(500).json({ error: "Lỗi tải danh sách đoàn viên" });
  }
});

// POST /api/doanVien
router.post("/", async (req, res) => {
  const { name, hoTen, dob, ngaySinh, phone, soDienThoai, email, branchId, chiDoanId, joinDate, ngayVaoDoan, status, trangThai } = req.body;
  const hoTenVal = hoTen || name;
  const ngaySinhVal = ngaySinh || dob;
  const soDienThoaiVal = soDienThoai || phone;
  const chiDoanIdVal = chiDoanId || branchId;
  const ngayVaoDoanVal = ngayVaoDoan || joinDate;
  const trangThaiVal = trangThai || status || "Đoàn viên";

  const id = Date.now().toString();
  const createdBy = "admin";
  const createdAt = new Date().toISOString();

  try {
    await runQuery(
      `INSERT INTO "doanVien" ("id", "hoTen", "ngaySinh", "soDienThoai", "email", "chiDoanId", "ngayVaoDoan", "trangThai", "createdBy", "createdAt", "updatedBy", "updatedAt")
       VALUES (@id, @hoTenVal, @ngaySinhVal, @soDienThoaiVal, @email, @chiDoanIdVal, @ngayVaoDoanVal, @trangThaiVal, @createdBy, @createdAt, @createdBy, @createdAt)`,
      {
        id,
        hoTenVal,
        ngaySinhVal,
        soDienThoaiVal,
        email,
        chiDoanIdVal,
        ngayVaoDoanVal,
        trangThaiVal,
        createdBy,
        createdAt,
      }
    );
    sendRealtimeUpdate("doanVien");
    res.status(201).json({ success: true, message: "Thêm đoàn viên thành công!", id });
  } catch (err) {
    console.error("POST /api/doanVien error:", err);
    res.status(500).json({ error: "Lỗi thêm đoàn viên", details: err.message });
  }
});

// PUT /api/doanVien/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, hoTen, dob, ngaySinh, phone, soDienThoai, email, branchId, chiDoanId, joinDate, ngayVaoDoan, status, trangThai } = req.body;
  const hoTenVal = hoTen || name;
  const ngaySinhVal = ngaySinh || dob;
  const soDienThoaiVal = soDienThoai || phone;
  const chiDoanIdVal = chiDoanId || branchId;
  const ngayVaoDoanVal = ngayVaoDoan || joinDate;
  const trangThaiVal = trangThai || status;

  const updatedBy = "admin";
  const updatedAt = new Date().toISOString();

  try {
    await runQuery(
      `UPDATE "doanVien" 
       SET "hoTen" = @hoTenVal, "ngaySinh" = @ngaySinhVal, "soDienThoai" = @soDienThoaiVal, "email" = @email, "chiDoanId" = @chiDoanIdVal, "ngayVaoDoan" = @ngayVaoDoanVal, "trangThai" = @trangThaiVal, "updatedBy" = @updatedBy, "updatedAt" = @updatedAt
       WHERE "id" = @id`,
      {
        id,
        hoTenVal,
        ngaySinhVal,
        soDienThoaiVal,
        email,
        chiDoanIdVal,
        ngayVaoDoanVal,
        trangThaiVal,
        updatedBy,
        updatedAt,
      }
    );
    sendRealtimeUpdate("doanVien");
    res.json({ success: true, message: "Cập nhật thông tin đoàn viên thành công!" });
  } catch (err) {
    console.error("PUT /api/doanVien error:", err);
    res.status(500).json({ error: "Lỗi cập nhật thông tin đoàn viên" });
  }
});

// DELETE /api/doanVien/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('DELETE FROM "doanVien" WHERE "id" = @id', { id });
    sendRealtimeUpdate("doanVien");
    res.json({ success: true, message: "Xóa đoàn viên thành công!" });
  } catch (err) {
    console.error("DELETE /api/doanVien error:", err);
    res.status(500).json({ error: "Lỗi xóa đoàn viên" });
  }
});

// POST /api/doanVien/bulk
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
      const hoTenVal = item.hoTen || item.name;
      const ngaySinhVal = item.ngaySinh || item.dob || "";
      const soDienThoaiVal = item.soDienThoai || item.phone || "";
      const email = item.email || "";
      const chiDoanIdVal = item.chiDoanId || item.branchId;
      const ngayVaoDoanVal = item.ngayVaoDoan || item.joinDate || "";
      const trangThaiVal = item.trangThai || item.status || "Đoàn viên";
      
      const id = (Date.now() + i).toString() + Math.random().toString(36).substring(2, 6);
      await runQuery(
        `INSERT INTO "doanVien" ("id", "hoTen", "ngaySinh", "soDienThoai", "email", "chiDoanId", "ngayVaoDoan", "trangThai", "createdBy", "createdAt", "updatedBy", "updatedAt")
         VALUES (@id, @hoTenVal, @ngaySinhVal, @soDienThoaiVal, @email, @chiDoanIdVal, @ngayVaoDoanVal, @trangThaiVal, @createdBy, @createdAt, @createdBy, @createdAt)`,
        {
          id,
          hoTenVal,
          ngaySinhVal,
          soDienThoaiVal,
          email,
          chiDoanIdVal,
          ngayVaoDoanVal,
          trangThaiVal,
          createdBy,
          createdAt,
        }
      );
    }
    sendRealtimeUpdate("doanVien");
    res.json({ success: true, message: `Import thành công ${list.length} đoàn viên!` });
  } catch (err) {
    console.error("POST /api/doanVien/bulk error:", err);
    res.status(500).json({ error: "Lỗi import danh sách đoàn viên", details: err.message });
  }
});

module.exports = router;
