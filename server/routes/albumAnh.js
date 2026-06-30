const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { runQuery } = require("../database");

// GET /api/albumAnh
router.get("/", async (req, res) => {
  try {
    const result = await runQuery(
      `SELECT g."id", g."tieuDe", g."ngayTao", gp."id" AS "photo_id", gp."duongDanAnh", gp."tenFile" 
       FROM "albumAnh" g 
       LEFT JOIN "anhAlbum" gp ON g."id" = gp."albumId" 
       ORDER BY g."ngayTao" DESC`
    );

    const albumsMap = {};
    result.rows.forEach((row) => {
      const albumId = row.id;
      if (!albumsMap[albumId]) {
        albumsMap[albumId] = {
          id: albumId,
          tieuDe: row.tieuDe,
          ngayTao: row.ngayTao,
          images: [],
        };
      }
      if (row.duongDanAnh) {
        albumsMap[albumId].images.push({
          id: row.photo_id,
          duongDanAnh: row.duongDanAnh,
          tenFile: row.tenFile || "Hình ảnh",
        });
      }
    });

    const items = Object.values(albumsMap);
    res.json(items);
  } catch (err) {
    console.error("GET /api/albumAnh error:", err);
    res.status(500).json({ error: "Lỗi lấy danh sách hình ảnh thư viện" });
  }
});

// POST /api/albumAnh
router.post("/", async (req, res) => {
  const { title, tieuDe, files } = req.body;
  const titleVal = tieuDe || title;
  if (!files || !Array.isArray(files) || files.length === 0) {
    return res
      .status(400)
      .json({ error: "Không có tệp tin nào được gửi lên!" });
  }

  const date = new Date().toISOString().split("T")[0];
  const crypto = require("crypto");
  const galleryId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

  const createdBy = "admin";
  const createdAt = new Date().toISOString();
  try {
    await runQuery(
      `INSERT INTO "albumAnh" ("id", "tieuDe", "ngayTao", "createdBy", "createdAt", "updatedBy", "updatedAt")
       VALUES (@id, @titleVal, @date, @createdBy, @createdAt, @createdBy, @createdAt)`,
      { id: galleryId, titleVal: titleVal?.trim() || "Album hình ảnh hoạt động", date, createdBy, createdAt }
    );

    for (const file of files) {
      const { fileData, duongDanAnh, fileName, tenFile } = file;
      const fileDataVal = duongDanAnh || fileData;
      const fileNameVal = tenFile || fileName;
      if (!fileDataVal || !fileNameVal) continue;

      const photoId = crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).substring(2, 5);

      await runQuery(
        `INSERT INTO "anhAlbum" ("id", "albumId", "duongDanAnh", "tenFile", "createdBy", "createdAt", "updatedBy", "updatedAt")
         VALUES (@id, @galleryId, @fileDataVal, @fileNameVal, @createdBy, @createdAt, @createdBy, @createdAt)`,
        { id: photoId, galleryId, fileDataVal, fileNameVal, createdBy, createdAt }
      );
    }
    res.status(201).json({
      success: true,
      message: "Đăng tải thành công tất cả hình ảnh lên thư viện!",
    });
  } catch (err) {
    console.error("POST /api/albumAnh error:", err);
    res.status(500).json({ error: "Lỗi lưu hình ảnh thư viện" });
  }
});

// DELETE /api/albumAnh/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const photosRes = await runQuery(
      'SELECT "duongDanAnh" FROM "anhAlbum" WHERE "albumId" = @id',
      { id }
    );

    const uploadsPath = path.join(__dirname, "../uploads");

    photosRes.rows.forEach((row) => {
      const imageUrl = row.duongDanAnh;
      if (imageUrl && imageUrl.startsWith("/uploads/")) {
        const actualPath = path.join(uploadsPath, imageUrl.replace("/uploads/", ""));
        if (fs.existsSync(actualPath)) {
          try {
            fs.unlinkSync(actualPath);
          } catch (_) {
            // Ignore unlinking errors
          }
        }
      }
    });

    await runQuery('DELETE FROM "albumAnh" WHERE "id" = @id', { id });
    res.json({ success: true, message: "Xóa album thư viện thành công!" });
  } catch (err) {
    console.error("DELETE /api/albumAnh error:", err);
    res.status(500).json({ error: "Lỗi xóa hình ảnh thư viện" });
  }
});

module.exports = router;
