const express = require("express");
const cors = require("cors");
const path = require("path");
const { initializeDatabase } = require("./database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Setup uploads folder
const fs = require("fs");
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

// API Routers Mount
app.use("/api/auth", require("./routes/auth"));
app.use("/api/baiViet", require("./routes/baiViet"));
app.use("/api/vanBan", require("./routes/vanBan"));
app.use("/api/gopY", require("./routes/gopY"));
app.use("/api/thanhVienBch", require("./routes/thanhVienBch"));
app.use("/api/gioiThieu", require("./routes/gioiThieu"));
app.use("/api/chiDoan", require("./routes/chiDoan"));
app.use("/api/loaiChiDoan", require("./routes/loaiChiDoan"));
app.use("/api/doanVien", require("./routes/doanVien"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/albumAnh", require("./routes/albumAnh"));

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
