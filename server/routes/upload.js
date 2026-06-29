const express = require("express");
const router = express.Router();

// POST /api/upload -> mounted on /api/upload, so POST /
router.post("/", (req, res) => {
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

module.exports = router;
