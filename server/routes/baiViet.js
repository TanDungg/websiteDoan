const express = require("express");
const router = express.Router();
const path = require("path");
const { runQuery } = require("../database");

// GET /api/baiViet -> mounted on /api/baiViet, so GET /
router.get("/", async (req, res) => {
  const { category, search } = req.query;
  try {
    let query = 'SELECT * FROM "baiViet"';
    const params = {};
    const conditions = [];

    if (category) {
      params.category = category;
      conditions.push('"danhMuc" = @category');
    }

    if (search) {
      params.search = `%${search}%`;
      conditions.push('("tieuDe" LIKE @search OR "tomTat" LIKE @search)');
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += ' ORDER BY "ngayDang" DESC';

    const result = await runQuery(query, params);

    const posts = result.rows.map((row) => ({
      id: row.id,
      tieuDe: row.tieuDe,
      tomTat: row.tomTat,
      noiDung: row.noiDung,
      danhMuc: row.danhMuc,
      anhDaiDien: row.anhDaiDien,
      ngayDang: row.ngayDang,
      tacGia: row.tacGia,
      luotXem: row.luotXem,
      tinNoiBat: row.tinNoiBat === 1 || row.tinNoiBat === true,
    }));

    res.json(posts);
  } catch (err) {
    console.error("Fetch posts API error:", err);
    res.status(500).json({ error: "Lỗi lấy danh sách bài viết" });
  }
});

// GET /api/baiViet/:id -> mounted on /api/baiViet, so GET /:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery('UPDATE "baiViet" SET "luotXem" = "luotXem" + 1 WHERE "id" = @id', { id });

    const result = await runQuery('SELECT * FROM "baiViet" WHERE "id" = @id', { id });
    if (result.rows.length > 0) {
      const row = result.rows[0];
      res.json({
        id: row.id,
        tieuDe: row.tieuDe,
        tomTat: row.tomTat,
        noiDung: row.noiDung,
        danhMuc: row.danhMuc,
        anhDaiDien: row.anhDaiDien,
        ngayDang: row.ngayDang,
        tacGia: row.tacGia,
        luotXem: row.luotXem,
        tinNoiBat: row.tinNoiBat === 1 || row.tinNoiBat === true,
      });
    } else {
      res.status(404).json({ error: "Không tìm thấy bài viết" });
    }
  } catch (err) {
    console.error("Get post details API error:", err);
    res.status(500).json({ error: "Lỗi lấy chi tiết bài viết" });
  }
});

// POST /api/baiViet -> mounted on /api/baiViet, so POST /
router.post("/", async (req, res) => {
  const { id, tieuDe, tomTat, noiDung, danhMuc, anhDaiDien, tacGia, tinNoiBat } =
    req.body;
  const crypto = require("crypto");
  const postId =
    id || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());
  const date = new Date().toISOString().split("T")[0];
  const createdBy = "admin";
  const createdAt = new Date().toISOString();
  try {
    await runQuery(
      `INSERT INTO "baiViet" ("id", "tieuDe", "tomTat", "noiDung", "danhMuc", "anhDaiDien", "tacGia", "ngayDang", "luotXem", "tinNoiBat", "createdBy", "createdAt", "updatedBy", "updatedAt")
       VALUES (@id, @tieuDe, @tomTat, @noiDung, @danhMuc, @anhDaiDien, @tacGia, @date, 0, @tinNoiBat, @createdBy, @createdAt, @createdBy, @createdAt)`,
      {
        id: postId,
        tieuDe,
        tomTat,
        noiDung,
        danhMuc,
        anhDaiDien,
        tacGia,
        date,
        tinNoiBat: tinNoiBat === true || tinNoiBat === "true" || tinNoiBat === 1 ? 1 : 0,
        createdBy,
        createdAt,
      },
    );
    res.status(201).json({
      success: true,
      message: "Đăng bài viết thành công!",
      id: postId,
    });
  } catch (err) {
    console.error("Create post API error:", err);
    res.status(500).json({ error: "Lỗi đăng bài viết" });
  }
});

// PUT /api/baiViet/:id -> mounted on /api/baiViet, so PUT /:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { tieuDe, tomTat, noiDung, danhMuc, anhDaiDien, tacGia, tinNoiBat } =
    req.body;
  const updatedBy = "admin";
  const updatedAt = new Date().toISOString();
  try {
    await runQuery(
      `UPDATE "baiViet" 
       SET "tieuDe" = @tieuDe, "tomTat" = @tomTat, "noiDung" = @noiDung, "danhMuc" = @danhMuc, "anhDaiDien" = @anhDaiDien, "tacGia" = @tacGia, "tinNoiBat" = @tinNoiBat, "updatedBy" = @updatedBy, "updatedAt" = @updatedAt
       WHERE "id" = @id`,
      {
        id,
        tieuDe,
        tomTat,
        noiDung,
        danhMuc,
        anhDaiDien,
        tacGia,
        tinNoiBat: tinNoiBat === true || tinNoiBat === "true" || tinNoiBat === 1 ? 1 : 0,
        updatedBy,
        updatedAt,
      },
    );
    res.json({ success: true, message: "Cập nhật bài viết thành công!" });
  } catch (err) {
    console.error("Update post API error:", err);
    res.status(500).json({ error: "Lỗi cập nhật bài viết" });
  }
});

// DELETE /api/baiViet/:id -> mounted on /api/baiViet, so DELETE /:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const fs = require("fs");
    const uploadsPath = path.join(__dirname, "../uploads");

    if (fs.existsSync(uploadsPath)) {
      try {
        const files = fs.readdirSync(uploadsPath);
        for (const file of files) {
          if (file.startsWith(`${id}-`)) {
            const actualPath = path.join(uploadsPath, file);
            if (fs.existsSync(actualPath)) {
              fs.unlinkSync(actualPath);
            }
          }
        }
      } catch (fileErr) {
        console.error("Error deleting post files from disk:", fileErr);
      }
    }

    const postRes = await runQuery(
      'SELECT "anhDaiDien" FROM "baiViet" WHERE "id" = @id',
      { id },
    );
    if (postRes.rows.length > 0) {
      const coverUrl = postRes.rows[0].anhDaiDien;
      if (coverUrl && coverUrl.startsWith("/uploads/")) {
        const legacyFileName = coverUrl.replace("/uploads/", "");
        const actualPath = path.join(uploadsPath, legacyFileName);
        if (fs.existsSync(actualPath)) {
          try {
            fs.unlinkSync(actualPath);
          } catch (_) {
            /* ignore */
          }
        }
      }
    }

    await runQuery('DELETE FROM "baiViet" WHERE "id" = @id', { id });
    res.json({
      success: true,
      message: "Xóa bài viết và các tệp đính kèm thành công!",
    });
  } catch (err) {
    console.error("Delete post API error:", err);
    res.status(500).json({ error: "Lỗi xóa bài viết" });
  }
});

module.exports = router;
