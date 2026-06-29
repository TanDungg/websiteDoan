const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { runQuery } = require("../database");

// GET /api/gallery -> mounted on /api/gallery, so GET /
router.get("/", async (req, res) => {
  try {
    const result = await runQuery(
      `SELECT g.id, g.title, g.date, gp.id AS photo_id, gp.image_url, gp.file_name 
       FROM gallery g 
       LEFT JOIN gallery_photos gp ON g.id = gp.gallery_id 
       ORDER BY g.date DESC`
    );

    const albumsMap = {};
    result.rows.forEach((row) => {
      const albumId = row.id;
      if (!albumsMap[albumId]) {
        albumsMap[albumId] = {
          id: albumId,
          title: row.title,
          date: row.date,
          images: [],
        };
      }
      if (row.image_url) {
        albumsMap[albumId].images.push({
          id: row.photo_id,
          imageUrl: row.image_url,
          fileName: row.file_name || "Hình ảnh",
        });
      }
    });

    const items = Object.values(albumsMap);
    res.json(items);
  } catch (err) {
    console.error("GET /api/gallery error:", err);
    res.status(500).json({ error: "Lỗi lấy danh sách hình ảnh thư viện" });
  }
});

// POST /api/gallery -> mounted on /api/gallery, so POST /
router.post("/", async (req, res) => {
  const { title, files } = req.body;
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
      `INSERT INTO gallery (id, title, date, created_by, created_at, updated_by, updated_at)
       VALUES (@id, @title, @date, @createdBy, @createdAt, @createdBy, @createdAt)`,
      { id: galleryId, title: title?.trim() || "Album hình ảnh hoạt động", date, createdBy, createdAt }
    );

    for (const file of files) {
      const { fileData, fileName } = file;
      if (!fileData || !fileName) continue;

      const photoId = crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).substring(2, 5);

      const imageUrl = fileData;

      await runQuery(
        `INSERT INTO gallery_photos (id, gallery_id, image_url, file_name, created_by, created_at, updated_by, updated_at)
         VALUES (@id, @galleryId, @imageUrl, @fileName, @createdBy, @createdAt, @createdBy, @createdAt)`,
        { id: photoId, galleryId, imageUrl, fileName, createdBy, createdAt }
      );
    }
    res.status(201).json({
      success: true,
      message: "Đăng tải thành công tất cả hình ảnh lên thư viện!",
    });
  } catch (err) {
    console.error("POST /api/gallery error:", err);
    res.status(500).json({ error: "Lỗi lưu hình ảnh thư viện" });
  }
});

// DELETE /api/gallery/:id -> mounted on /api/gallery, so DELETE /:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const photosRes = await runQuery(
      "SELECT image_url FROM gallery_photos WHERE gallery_id = @id",
      { id }
    );

    const uploadsPath = path.join(__dirname, "../uploads");

    photosRes.rows.forEach((row) => {
      const imageUrl = row.image_url;
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

    await runQuery("DELETE FROM gallery WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa album thư viện thành công!" });
  } catch (err) {
    console.error("DELETE /api/gallery error:", err);
    res.status(500).json({ error: "Lỗi xóa hình ảnh thư viện" });
  }
});

module.exports = router;
