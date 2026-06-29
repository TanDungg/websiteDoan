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
