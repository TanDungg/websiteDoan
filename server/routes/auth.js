const express = require("express");
const router = express.Router();
const { runQuery } = require("../database");

// POST /api/auth/login -> mounted on /api/auth, so POST /login
router.post("/login", async (req, res) => {
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

module.exports = router;
