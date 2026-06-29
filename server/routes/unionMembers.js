const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// GET /api/union-members -> list all members
router.get("/", async (req, res) => {
  try {
    // Join with branches to get branch name
    const result = await runQuery(
      `SELECT m.*, b.name as branch_name 
       FROM union_members m 
       LEFT JOIN branches b ON m.branch_id = b.id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/union-members error:", err);
    res.status(500).json({ error: "Lỗi tải danh sách đoàn viên" });
  }
});

// POST /api/union-members -> create a member
router.post("/", async (req, res) => {
  const { name, dob, phone, email, branchId, joinDate, status } = req.body;
  const id = Date.now().toString();
  const createdBy = "admin";
  const createdAt = new Date().toISOString();

  try {
    await runQuery(
      `INSERT INTO union_members (id, name, dob, phone, email, branch_id, join_date, status, created_by, created_at, updated_by, updated_at)
       VALUES (@id, @name, @dob, @phone, @email, @branchId, @joinDate, @status, @createdBy, @createdAt, @createdBy, @createdAt)`,
      {
        id,
        name,
        dob,
        phone,
        email,
        branchId,
        joinDate,
        status: status || "Sinh hoạt",
        createdBy,
        createdAt,
      }
    );
    res.status(201).json({ success: true, message: "Thêm đoàn viên thành công!", id });
  } catch (err) {
    console.error("POST /api/union-members error:", err);
    res.status(500).json({ error: "Lỗi thêm đoàn viên", details: err.message });
  }
});

// PUT /api/union-members/:id -> update a member
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, dob, phone, email, branchId, joinDate, status } = req.body;
  const updatedBy = "admin";
  const updatedAt = new Date().toISOString();

  try {
    await runQuery(
      `UPDATE union_members 
       SET name = @name, dob = @dob, phone = @phone, email = @email, branch_id = @branchId, join_date = @joinDate, status = @status, updated_by = @updatedBy, updated_at = @updatedAt
       WHERE id = @id`,
      {
        id,
        name,
        dob,
        phone,
        email,
        branchId,
        joinDate,
        status,
        updatedBy,
        updatedAt,
      }
    );
    res.json({ success: true, message: "Cập nhật thông tin đoàn viên thành công!" });
  } catch (err) {
    console.error("PUT /api/union-members error:", err);
    res.status(500).json({ error: "Lỗi cập nhật thông tin đoàn viên" });
  }
});

// DELETE /api/union-members/:id -> delete a member
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await runQuery("DELETE FROM union_members WHERE id = @id", { id });
    res.json({ success: true, message: "Xóa đoàn viên thành công!" });
  } catch (err) {
    console.error("DELETE /api/union-members error:", err);
    res.status(500).json({ error: "Lỗi xóa đoàn viên" });
  }
});

module.exports = router;
