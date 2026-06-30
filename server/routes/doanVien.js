const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

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
    res.json({ success: true, message: "Xóa đoàn viên thành công!" });
  } catch (err) {
    console.error("DELETE /api/doanVien error:", err);
    res.status(500).json({ error: "Lỗi xóa đoàn viên" });
  }
});

module.exports = router;
