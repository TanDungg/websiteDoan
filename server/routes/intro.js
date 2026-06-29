const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// GET /api/intro -> mounted on /api/intro, so GET /
router.get("/", async (req, res) => {
  try {
    const introResult = await runQuery(
      "SELECT * FROM intro_settings WHERE id = 1",
    );
    const bchResult = await runQuery(
      "SELECT * FROM bch_members"
    );
    const branchesResult = await runQuery(
      `SELECT b.*, t.name as group_name 
       FROM branches b 
       LEFT JOIN branch_types t ON b.branch_type_id = t.id`
    );
    const branchesCountResult = await runQuery("SELECT COUNT(*) AS count FROM branches");
    const membersCountResult = await runQuery("SELECT COUNT(*) AS count FROM union_members");

    const branches = branchesResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      branchTypeId: row.branch_type_id,
      groupName: row.group_name || "",
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedBy: row.updated_by,
      updatedAt: row.updated_at
    }));

    // Sort alphabetically by name
    branches.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const statBranches = branchesCountResult.rows[0]?.count || 0;
    const statMembers = membersCountResult.rows[0]?.count || 0;

    let settings = {
      historyContent: "",
      statMembers: String(statMembers),
      statBranches: String(statBranches),
      branchesContent: "",
    };

    if (introResult.rows.length > 0) {
      const row = introResult.rows[0];
      settings.historyContent = row.history_content;
      settings.branchesContent = row.branches_content;
    }

    const members = bchResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      position: row.position,
      email: row.email,
      phone: row.phone,
      imageUrl: row.image_url,
      responsibility: row.responsibility,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedBy: row.updated_by,
      updatedAt: row.updated_at
    }));

    // Sort BCH members by name
    members.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    res.json({ settings, bchMembers: members, branches });
  } catch (err) {
    console.error("GET /api/intro error:", err);
    res.status(500).json({ error: "Lỗi tải thông tin giới thiệu" });
  }
});

// PUT /api/intro -> mounted on /api/intro, so PUT /
router.put("/", async (req, res) => {
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

module.exports = router;
