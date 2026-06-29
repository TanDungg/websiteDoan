const express = require("express");
const cors = require("cors");
const path = require("path");
const { runQuery, initializeDatabase } = require("./database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API: Authentication
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await runQuery(
      "SELECT * FROM admins WHERE username = @username AND password = @password",
      { username, password },
    );
    if (result.rows.length > 0) {
      res.json({ success: true, session: "active" });
    } else {
      res.status(401).json({
        success: false,
        error: "Sai tài khoản hoặc mật khẩu đăng nhập!",
      });
    }
  } catch (err) {
    console.error("Login API error:", err);
    res.status(500).json({ success: false, error: "Lỗi hệ thống máy chủ" });
  }
});

// API: Posts
app.get("/api/posts", async (req, res) => {
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

    // Map column names to camelCase for React matching standard
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

app.get("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Increment view count
    await runQuery("UPDATE posts SET views = views + 1 WHERE id = @id", { id });

    // Get post
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

app.post("/api/posts", async (req, res) => {
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

app.put("/api/posts/:id", async (req, res) => {
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

app.delete("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const fs = require("fs");
    const uploadsPath = path.join(__dirname, "uploads");

    // 1. Delete all files starting with "postId-" from the uploads folder
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

    // Also delete the cover image if it is legacy (for safety and backward compatibility)
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

    // 2. Delete post from DB
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

// API: Documents
app.get("/api/documents", async (req, res) => {
  try {
    const result = await runQuery("SELECT * FROM documents ORDER BY date DESC");
    const docs = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      docNo: row.doc_no,
      date: row.date,
      category: row.category,
      fileUrl: row.file_url,
    }));
    res.json(docs);
  } catch (err) {
    console.error("Fetch docs API error:", err);
    res.status(500).json({ error: "Lỗi lấy danh sách văn bản" });
  }
});

app.post("/api/documents", async (req, res) => {
  const { title, docNo, category, fileUrl } = req.body;
  const id = Date.now().toString();
  const date = new Date().toISOString().split("T")[0];
  try {
    await runQuery(
      `INSERT INTO documents (id, title, doc_no, date, category, file_url)
       VALUES (@id, @title, @docNo, @date, @category, @fileUrl)`,
      { id, title, docNo, date, category, fileUrl },
    );
    res
      .status(201)
      .json({ success: true, message: "Thêm văn bản thành công!", id });
  } catch (err) {
    console.error("Create doc API error:", err);
    res.status(500).json({ error: "Lỗi thêm văn bản" });
  }
});

app.delete("/api/documents/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery("DELETE FROM documents WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa văn bản thành công!" });
  } catch (err) {
    console.error("Delete doc API error:", err);
    res.status(500).json({ error: "Lỗi xóa văn bản" });
  }
});

// API: Feedbacks
app.get("/api/feedbacks", async (req, res) => {
  try {
    const result = await runQuery("SELECT * FROM feedbacks ORDER BY date DESC");
    const feedbacks = result.rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      phone: row.phone,
      email: row.email,
      unit: row.unit,
      subject: row.subject,
      message: row.message,
      date: row.date,
    }));
    res.json(feedbacks);
  } catch (err) {
    console.error("Fetch feedbacks API error:", err);
    res.status(500).json({ error: "Lỗi lấy hòm thư góp ý" });
  }
});

app.post("/api/feedbacks", async (req, res) => {
  const { fullName, phone, email, unit, subject, message } = req.body;
  const id = Date.now().toString();
  const date = new Date().toISOString().split("T")[0];
  try {
    await runQuery(
      `INSERT INTO feedbacks (id, full_name, phone, email, unit, subject, message, date)
       VALUES (@id, @fullName, @phone, @email, @unit, @subject, @message, @date)`,
      { id, fullName, phone, email, unit, subject, message, date },
    );
    res.status(201).json({
      success: true,
      message: "Gửi góp ý thành công! Xin cảm ơn đồng chí!",
    });
  } catch (err) {
    console.error("Submit feedback API error:", err);
    res.status(500).json({ error: "Lỗi gửi ý kiến đóng góp" });
  }
});

app.delete("/api/feedbacks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery("DELETE FROM feedbacks WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa ý kiến thành công!" });
  } catch (err) {
    console.error("Delete feedback API error:", err);
    res.status(500).json({ error: "Lỗi xóa ý kiến phản hồi" });
  }
});

// API: Introduction & BCH Members
app.get("/api/intro", async (req, res) => {
  try {
    const introResult = await runQuery(
      "SELECT * FROM intro_settings WHERE id = 1",
    );
    const bchResult = await runQuery(
      "SELECT * FROM bch_members ORDER BY display_order ASC",
    );
    const branchesResult = await runQuery(
      "SELECT * FROM branches ORDER BY display_order ASC",
    );

    let settings = {
      historyContent: "",
      statMembers: "0",
      statBranches: "0",
      branchesContent: "",
    };

    if (introResult.rows.length > 0) {
      const row = introResult.rows[0];
      settings = {
        historyContent: row.history_content,
        statMembers: row.stat_members,
        statBranches: row.stat_branches,
        branchesContent: row.branches_content,
      };
    }

    const members = bchResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      position: row.position,
      email: row.email,
      phone: row.phone,
      imageUrl: row.image_url,
      responsibility: row.responsibility,
      displayOrder: row.display_order,
    }));

    const branches = branchesResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      groupName: row.group_name,
      displayOrder: row.display_order,
    }));

    res.json({ settings, bchMembers: members, branches });
  } catch (err) {
    console.error("GET /api/intro error:", err);
    res.status(500).json({ error: "Lỗi tải thông tin giới thiệu" });
  }
});

app.put("/api/intro", async (req, res) => {
  const { historyContent, statMembers, statBranches, branchesContent } =
    req.body;
  try {
    const introCheck = await runQuery(
      "SELECT * FROM intro_settings WHERE id = 1",
    );
    if (introCheck.rows.length === 0) {
      await runQuery(
        `INSERT INTO intro_settings (id, history_content, stat_members, stat_branches, branches_content)
         VALUES (1, @historyContent, @statMembers, @statBranches, @branchesContent)`,
        { historyContent, statMembers, statBranches, branchesContent },
      );
    } else {
      await runQuery(
        `UPDATE intro_settings 
         SET history_content = @historyContent, stat_members = @statMembers, stat_branches = @statBranches, branches_content = @branchesContent
         WHERE id = 1`,
        { historyContent, statMembers, statBranches, branchesContent },
      );
    }
    res.json({ success: true, message: "Cập nhật giới thiệu thành công!" });
  } catch (err) {
    console.error("PUT /api/intro error:", err);
    res.status(500).json({ error: "Lỗi cập nhật giới thiệu" });
  }
});

app.post("/api/bch-members", async (req, res) => {
  const {
    name,
    position,
    email,
    phone,
    imageUrl,
    responsibility,
    displayOrder,
  } = req.body;
  const id = Date.now().toString();
  try {
    await runQuery(
      `INSERT INTO bch_members (id, name, position, email, phone, image_url, responsibility, display_order)
       VALUES (@id, @name, @position, @email, @phone, @imageUrl, @responsibility, @displayOrder)`,
      {
        id,
        name,
        position,
        email,
        phone,
        imageUrl,
        responsibility,
        displayOrder: parseInt(displayOrder) || 0,
      },
    );
    res
      .status(201)
      .json({ success: true, message: "Thêm thành viên BCH thành công!", id });
  } catch (err) {
    console.error("POST /api/bch-members error:", err);
    res.status(500).json({ error: "Lỗi thêm thành viên BCH" });
  }
});

app.put("/api/bch-members/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    position,
    email,
    phone,
    imageUrl,
    responsibility,
    displayOrder,
  } = req.body;
  try {
    await runQuery(
      `UPDATE bch_members 
       SET name = @name, position = @position, email = @email, phone = @phone, image_url = @imageUrl, responsibility = @responsibility, display_order = @displayOrder
       WHERE id = @id`,
      {
        id,
        name,
        position,
        email,
        phone,
        imageUrl,
        responsibility,
        displayOrder: parseInt(displayOrder) || 0,
      },
    );
    res.json({ success: true, message: "Cập nhật thành viên BCH thành công!" });
  } catch (err) {
    console.error("PUT /api/bch-members error:", err);
    res.status(500).json({ error: "Lỗi cập nhật thành viên BCH" });
  }
});

app.delete("/api/bch-members/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery("DELETE FROM bch_members WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa thành viên BCH thành công!" });
  } catch (err) {
    console.error("DELETE /api/bch-members error:", err);
    res.status(500).json({ error: "Lỗi xóa thành viên BCH" });
  }
});

// API: Chi đoàn trực thuộc CRUD
app.post("/api/branches", async (req, res) => {
  const { name, groupName, displayOrder } = req.body;
  const id = Date.now().toString();
  try {
    await runQuery(
      `INSERT INTO branches (id, name, group_name, display_order)
       VALUES (@id, @name, @groupName, @displayOrder)`,
      {
        id,
        name,
        groupName,
        displayOrder: parseInt(displayOrder) || 0,
      },
    );
    res
      .status(201)
      .json({ success: true, message: "Thêm chi đoàn thành công!", id });
  } catch (err) {
    console.error("POST /api/branches error:", err);
    res.status(500).json({ error: "Lỗi thêm chi đoàn trực thuộc" });
  }
});

app.put("/api/branches/:id", async (req, res) => {
  const { id } = req.params;
  const { name, groupName, displayOrder } = req.body;
  try {
    await runQuery(
      `UPDATE branches 
       SET name = @name, group_name = @groupName, display_order = @displayOrder
       WHERE id = @id`,
      {
        id,
        name,
        groupName,
        displayOrder: parseInt(displayOrder) || 0,
      },
    );
    res.json({ success: true, message: "Cập nhật chi đoàn thành công!" });
  } catch (err) {
    console.error("PUT /api/branches error:", err);
    res.status(500).json({ error: "Lỗi cập nhật chi đoàn trực thuộc" });
  }
});

app.delete("/api/branches/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery("DELETE FROM branches WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa chi đoàn thành công!" });
  } catch (err) {
    console.error("DELETE /api/branches error:", err);
    res.status(500).json({ error: "Lỗi xóa chi đoàn trực thuộc" });
  }
});

// Setup uploads folder
const fs = require("fs");
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

// API: File Upload
app.post("/api/upload", (req, res) => {
  const { fileData, fileName, fileId, fileType } = req.body;
  if (!fileData || !fileName) {
    return res
      .status(400)
      .json({ error: "Thiếu dữ liệu tệp tin hoặc tên tệp!" });
  }
  try {
    const crypto = require("crypto");
    const resolvedFileId =
      fileId ||
      (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());

    res.json({
      success: true,
      fileId: resolvedFileId,
      filePath: fileData,
      url: fileData,
      fileName: fileName,
      fileType: fileType || "cover",
    });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ error: "Lỗi tải tệp lên máy chủ" });
  }
});

// API: Gallery
// API: Gallery
app.get("/api/gallery", async (req, res) => {
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

app.post("/api/gallery", async (req, res) => {
  const { title, files } = req.body;
  if (!files || !Array.isArray(files) || files.length === 0) {
    return res
      .status(400)
      .json({ error: "Không có tệp tin nào được gửi lên!" });
  }

  const date = new Date().toISOString().split("T")[0];
  const crypto = require("crypto");
  const galleryId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

  try {
    await runQuery(
      `INSERT INTO gallery (id, title, date)
       VALUES (@id, @title, @date)`,
      { id: galleryId, title: title?.trim() || "Album hình ảnh hoạt động", date }
    );

    for (const file of files) {
      const { fileData, fileName } = file;
      if (!fileData || !fileName) continue;

      const photoId = crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).substring(2, 5);

      const imageUrl = fileData;

      await runQuery(
        `INSERT INTO gallery_photos (id, gallery_id, image_url, file_name)
         VALUES (@id, @galleryId, @imageUrl, @fileName)`,
        { id: photoId, galleryId, imageUrl, fileName }
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

app.delete("/api/gallery/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const photosRes = await runQuery(
      "SELECT image_url FROM gallery_photos WHERE gallery_id = @id",
      { id }
    );

    photosRes.rows.forEach((row) => {
      const imageUrl = row.image_url;
      if (imageUrl && imageUrl.startsWith("/uploads/")) {
        const actualPath = path.join(__dirname, imageUrl);
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

// Serve static React build in production
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// Spa Routing Fallback
app.get("*", (req, res, next) => {
  if (req.url.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// Start DB Initialization & Server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });
