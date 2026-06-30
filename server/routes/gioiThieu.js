const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// GET /api/gioiThieu -> mounted on /api/gioiThieu, so GET /
router.get("/", async (req, res) => {
  try {
    const introResult = await runQuery(
      'SELECT * FROM "intro" WHERE "id" = 1',
    );
    const bchResult = await runQuery(
      'SELECT * FROM "thanhVienBch"'
    );
    const branchesResult = await runQuery(
      `SELECT b.*, t."tenLoai" as "groupName" 
       FROM "chiDoan" b 
       LEFT JOIN "loaiChiDoan" t ON b."loaiChiDoanId" = t."id"`
    );
    const branchesCountResult = await runQuery('SELECT COUNT(*) AS count FROM "chiDoan"');
    const membersCountResult = await runQuery('SELECT COUNT(*) AS count FROM "doanVien"');

    const branches = branchesResult.rows.map((row) => ({
      id: row.id,
      tenChiDoan: row.tenChiDoan,
      loaiChiDoanId: row.loaiChiDoanId,
      groupName: row.groupName || "",
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedBy: row.updatedBy,
      updatedAt: row.updatedAt
    }));

    // Sort alphabetically by name
    branches.sort((a, b) => (a.tenChiDoan || '').localeCompare(b.tenChiDoan || ''));

    const statBranches = branchesCountResult.rows[0]?.count || 0;
    const statMembers = membersCountResult.rows[0]?.count || 0;

    let settings = {
      lichSu: "",
      soLuongDoanVien: String(statMembers),
      soLuongChiDoan: String(statBranches),
      thongTinChiDoan: "",
    };

    if (introResult.rows.length > 0) {
      const row = introResult.rows[0];
      settings.lichSu = row.lichSu;
      settings.thongTinChiDoan = row.thongTinChiDoan;
    }

    const members = bchResult.rows.map((row) => ({
      id: row.id,
      hoTen: row.hoTen,
      chucVu: row.chucVu,
      email: row.email,
      soDienThoai: row.soDienThoai,
      anhDaiDien: row.anhDaiDien,
      nhiemVu: row.nhiemVu,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedBy: row.updatedBy,
      updatedAt: row.updatedAt
    }));

    // Sort BCH members by position order first, then name
    members.sort((a, b) => {
      const posDiff = (a.chucVu || 99) - (b.chucVu || 99);
      if (posDiff !== 0) return posDiff;
      return (a.hoTen || '').localeCompare(b.hoTen || '');
    });

    res.json({ settings, bchMembers: members, branches });
  } catch (err) {
    console.error("GET /api/gioiThieu error:", err);
    res.status(500).json({ error: "Lỗi tải thông tin giới thiệu" });
  }
});

// PUT /api/gioiThieu -> mounted on /api/gioiThieu, so PUT /
router.put("/", async (req, res) => {
  const { lichSu, thongTinChiDoan } = req.body;
  try {
    const introCheck = await runQuery(
      'SELECT * FROM "intro" WHERE "id" = 1',
    );
    if (introCheck.rows.length === 0) {
      await runQuery(
        `INSERT INTO "intro" ("id", "lichSu", "thongTinChiDoan")
         VALUES (1, @lichSu, @thongTinChiDoan)`,
        { lichSu, thongTinChiDoan },
      );
    } else {
      await runQuery(
        `UPDATE "intro" 
         SET "lichSu" = @lichSu, "thongTinChiDoan" = @thongTinChiDoan
         WHERE "id" = 1`,
        { lichSu, thongTinChiDoan },
      );
    }
    res.json({ success: true, message: "Cập nhật giới thiệu thành công!" });
  } catch (err) {
    console.error("PUT /api/gioiThieu error:", err);
    res.status(500).json({ error: "Lỗi cập nhật giới thiệu" });
  }
});

module.exports = router;
