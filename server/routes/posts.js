const express = require("express");
const router = express.Router();
const path = require("path");
const { runQuery } = require("../database");

// GET /api/posts -> mounted on /api/posts, so GET /
router.get("/", async (req, res) => {
  const { category, search } = req.query;
  try {
    let query = "SELECT * FROM posts";
    const params = {};
    const conditions = [];

    if (category) {
      params.category = category;
      conditions.push("category = @category");
    }

    if (search) {
      params.search = `%${search}%`;
      conditions.push("(title LIKE @search OR summary LIKE @search)");
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY date DESC";

    const result = await runQuery(query, params);

    const posts = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      content: row.content,
      category: row.category,
      imageUrl: row.image_url,
      date: row.date,
      author: row.author,
      views: row.views,
      isHot: row.is_hot === 1 || row.is_hot === true,
    }));

    res.json(posts);
  } catch (err) {
    console.error("Fetch posts API error:", err);
    res.status(500).json({ error: "Lỗi lấy danh sách bài viết" });
  }
});

// GET /api/posts/:id -> mounted on /api/posts, so GET /:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery("UPDATE posts SET views = views + 1 WHERE id = @id", { id });

    const result = await runQuery("SELECT * FROM posts WHERE id = @id", { id });
    if (result.rows.length > 0) {
      const row = result.rows[0];
      res.json({
        id: row.id,
        title: row.title,
        summary: row.summary,
        content: row.content,
        category: row.category,
        imageUrl: row.image_url,
        date: row.date,
        author: row.author,
        views: row.views,
        isHot: row.is_hot === 1 || row.is_hot === true,
      });
    } else {
      res.status(404).json({ error: "Không tìm thấy bài viết" });
    }
  } catch (err) {
    console.error("Get post details API error:", err);
    res.status(500).json({ error: "Lỗi lấy chi tiết bài viết" });
  }
});

// POST /api/posts -> mounted on /api/posts, so POST /
router.post("/", async (req, res) => {
  const { id, title, summary, content, category, imageUrl, author } = req.body;
  const crypto = require("crypto");
  const postId =
    id || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());
  const date = new Date().toISOString().split("T")[0];
  try {
    await runQuery(
      `INSERT INTO posts (id, title, summary, content, category, image_url, author, date, views, is_hot)
       VALUES (@id, @title, @summary, @content, @category, @imageUrl, @author, @date, 0, @isHot)`,
      {
        id: postId,
        title,
        summary,
        content,
        category,
        imageUrl,
        author,
        date,
        isHot: false,
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

// PUT /api/posts/:id -> mounted on /api/posts, so PUT /:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, summary, content, category, imageUrl, author } = req.body;
  try {
    await runQuery(
      `UPDATE posts 
       SET title = @title, summary = @summary, content = @content, category = @category, image_url = @imageUrl, author = @author
       WHERE id = @id`,
      { id, title, summary, content, category, imageUrl, author },
    );
    res.json({ success: true, message: "Cập nhật bài viết thành công!" });
  } catch (err) {
    console.error("Update post API error:", err);
    res.status(500).json({ error: "Lỗi cập nhật bài viết" });
  }
});

// DELETE /api/posts/:id -> mounted on /api/posts, so DELETE /:id
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
      "SELECT image_url FROM posts WHERE id = @id",
      { id },
    );
    if (postRes.rows.length > 0) {
      const coverUrl = postRes.rows[0].image_url;
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

    await runQuery("DELETE FROM posts WHERE id = @id", { id });
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
