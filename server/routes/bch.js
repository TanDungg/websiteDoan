const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// POST /api/bch-members -> mounted on /api/bch-members, so POST /
router.post("/", async (req, res) => {
  const {
    name,
    position,
    email,
    phone,
    imageUrl,
    responsibility,
  } = req.body;
  const id = Date.now().toString();
  const createdBy = "admin";
  const createdAt = new Date().toISOString();
  try {
    await runQuery(
      `INSERT INTO bch_members (id, name, position, email, phone, image_url, responsibility, created_by, created_at, updated_by, updated_at)
       VALUES (@id, @name, @position, @email, @phone, @imageUrl, @responsibility, @createdBy, @createdAt, @createdBy, @createdAt)`,
      {
        id,
        name,
        position,
        email,
        phone,
        imageUrl,
        responsibility,
        createdBy,
        createdAt,
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

// PUT /api/bch-members/:id -> mounted on /api/bch-members, so PUT /:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    position,
    email,
    phone,
    imageUrl,
    responsibility,
  } = req.body;
  const updatedBy = "admin";
  const updatedAt = new Date().toISOString();
  try {
    await runQuery(
      `UPDATE bch_members 
       SET name = @name, position = @position, email = @email, phone = @phone, image_url = @imageUrl, responsibility = @responsibility, updated_by = @updatedBy, updated_at = @updatedAt
       WHERE id = @id`,
      {
        id,
        name,
        position,
        email,
        phone,
        imageUrl,
        responsibility,
        updatedBy,
        updatedAt,
      },
    );
    res.json({ success: true, message: "Cập nhật thành viên BCH thành công!" });
  } catch (err) {
    console.error("PUT /api/bch-members error:", err);
    res.status(500).json({ error: "Lỗi cập nhật thành viên BCH" });
  }
});

// DELETE /api/bch-members/:id -> mounted on /api/bch-members, so DELETE /:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery("DELETE FROM bch_members WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa thành viên BCH thành công!" });
  } catch (err) {
    console.error("DELETE /api/bch-members error:", err);
    res.status(500).json({ error: "Lỗi xóa thành viên BCH" });
  }
});

module.exports = router;
