const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

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

    // Extract raw base64 data and mime type
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let base64Buffer;
    let extension = ".jpg";

    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      base64Buffer = Buffer.from(matches[2], "base64");
      if (mimeType === "image/png") extension = ".png";
      else if (mimeType === "image/webp") extension = ".webp";
      else if (mimeType === "image/gif") extension = ".gif";
    } else {
      // Fallback if not a data URI format
      base64Buffer = Buffer.from(fileData, "base64");
    }

    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const savedFileName = `${resolvedFileId}${extension}`;
    const filePath = path.join(uploadsDir, savedFileName);

    // Save file to disk
    fs.writeFileSync(filePath, base64Buffer);

    const relativePath = `/uploads/${savedFileName}`;

    res.json({
      success: true,
      fileId: resolvedFileId,
      filePath: relativePath,
      url: relativePath,
      fileName: fileName,
      fileType: fileType || "cover",
    });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ error: "Lỗi tải tệp lên máy chủ" });
  }
});

module.exports = router;
