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
app.use("/api/posts", require("./routes/posts"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/feedbacks", require("./routes/feedbacks"));
app.use("/api/bch-members", require("./routes/bch"));
app.use("/api/intro", require("./routes/intro"));
app.use("/api/branches", require("./routes/branches"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/gallery", require("./routes/gallery"));

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
