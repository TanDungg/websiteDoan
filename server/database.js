const { Pool } = require("pg");
const sql = require("mssql");
require("dotenv").config();

const isPg = !!process.env.DATABASE_URL;

console.log(
  `Database Adapter: Using ${isPg ? "Supabase PostgreSQL" : "Microsoft SQL Server"}`,
);

// --- PostgreSQL Pool Setup ---
let pgPool = null;
if (isPg) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_URL.includes("localhost") ||
      process.env.DATABASE_URL.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
  });
}

// --- MS SQL Server Config Setup ---
const sqlConfig = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "tamanh_youth",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Seed admin default
const mockAdmin = { tenDangNhap: "admin", matKhau: "admin123" };

// --- Mock Database Store ---
let useMockDb = false;
let mockDbStore = null;

function initMockDbStore() {
  mockDbStore = {
    taiKhoanAdmin: [mockAdmin],
    baiViet: [],
    vanBan: [],
    gopY: [],
    intro: {
      id: 1,
      lichSu: "",
      soLuongDoanVien: "0",
      soLuongChiDoan: "0",
      thongTinChiDoan: "",
    },
    thanhVienBch: [],
    albumAnh: [],
    anhAlbum: [],
    loaiChiDoan: [],
    chiDoan: [],
    doanVien: [],
  };
}

function runMockQuery(queryText, params = {}) {
  const normalized = queryText.replace(/\s+/g, " ").trim();
  const tblMatch = 
    queryText.match(/FROM\s+"(\w+)"/i)?.[1] || 
    queryText.match(/INTO\s+"(\w+)"/i)?.[1] || 
    queryText.match(/UPDATE\s+"(\w+)"/i)?.[1] || 
    queryText.match(/DELETE\s+FROM\s+"(\w+)"/i)?.[1];

  if (!tblMatch || !mockDbStore[tblMatch]) {
    // If it's a count query or special query
    if (normalized.includes("COUNT(*) AS count FROM \"chiDoan\"")) {
      return { rows: [{ count: mockDbStore.chiDoan.length }], rowCount: 1 };
    }
    if (normalized.includes("COUNT(*) AS count FROM \"doanVien\"")) {
      return { rows: [{ count: mockDbStore.doanVien.length }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  const table = mockDbStore[tblMatch];

  // 1. SELECT queries
  if (normalized.startsWith("SELECT")) {
    if (tblMatch === "taiKhoanAdmin") {
      const user = table.find(
        (u) => u.tenDangNhap === params.tenDangNhap && u.matKhau === params.matKhau
      );
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }

    if (tblMatch === "intro") {
      return { rows: [table], rowCount: 1 };
    }

    let list = [...table];

    // Filter by ID
    if (params.id !== undefined) {
      list = list.filter((item) => String(item.id) === String(params.id));
    }

    // Custom filtering for specific tables
    if (tblMatch === "baiViet") {
      if (params.category !== undefined) {
        list = list.filter((item) => item.danhMuc === params.category);
      }
      if (params.search !== undefined) {
        const term = params.search.replace(/%/g, "").toLowerCase();
        list = list.filter(
          (item) =>
            (item.tieuDe && item.tieuDe.toLowerCase().includes(term)) ||
            (item.tomTat && item.tomTat.toLowerCase().includes(term))
        );
      }
      // Sort by date/ngayDang descending
      list.sort((a, b) => (b.ngayDang || "").localeCompare(a.ngayDang || ""));
    }

    if (tblMatch === "vanBan") {
      list.sort((a, b) => (b.ngayBanHanh || "").localeCompare(a.ngayBanHanh || ""));
    }

    if (tblMatch === "gopY") {
      list.sort((a, b) => (b.ngayGui || "").localeCompare(a.ngayGui || ""));
    }

    if (tblMatch === "thanhVienBch") {
      // Sort by display order or position
      list.sort((a, b) => (a.chucVu || 0) - (b.chucVu || 0));
    }

    if (tblMatch === "chiDoan") {
      list = list.map((cd) => {
        const type = mockDbStore.loaiChiDoan.find((t) => String(t.id) === String(cd.loaiChiDoanId));
        return { ...cd, groupName: type ? type.tenLoai : "" };
      });
      list.sort((a, b) => (a.tenChiDoan || "").localeCompare(b.tenChiDoan || ""));
    }

    if (tblMatch === "doanVien") {
      list = list.map((dv) => {
        const cd = mockDbStore.chiDoan.find((b) => String(b.id) === String(dv.chiDoanId));
        return { ...dv, branchName: cd ? cd.tenChiDoan : "" };
      });
      list.sort((a, b) => (a.hoTen || "").localeCompare(b.hoTen || ""));
    }

    if (tblMatch === "anhAlbum" && params.albumId !== undefined) {
      list = list.filter((item) => String(item.albumId) === String(params.albumId));
    }

    return { rows: list, rowCount: list.length };
  }

  // 2. INSERT queries
  if (normalized.startsWith("INSERT")) {
    if (tblMatch === "intro") {
      mockDbStore.intro = { ...params };
      return { rows: [], rowCount: 1 };
    }
    const newItem = { ...params };
    table.push(newItem);
    return { rows: [], rowCount: 1 };
  }

  // 3. UPDATE queries
  if (normalized.startsWith("UPDATE")) {
    if (tblMatch === "intro") {
      mockDbStore.intro = { ...mockDbStore.intro, ...params };
      return { rows: [], rowCount: 1 };
    }
    const index = table.findIndex((item) => String(item.id) === String(params.id));
    if (index !== -1) {
      table[index] = { ...table[index], ...params };
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 4. DELETE queries
  if (normalized.startsWith("DELETE")) {
    const origLen = table.length;
    mockDbStore[tblMatch] = table.filter((item) => String(item.id) !== String(params.id));
    
    // Cascade deletes
    if (tblMatch === "albumAnh") {
      mockDbStore.anhAlbum = mockDbStore.anhAlbum.filter((img) => String(img.albumId) !== String(params.id));
    }
    if (tblMatch === "loaiChiDoan") {
      mockDbStore.chiDoan = mockDbStore.chiDoan.filter((cd) => String(cd.loaiChiDoanId) !== String(params.id));
    }
    if (tblMatch === "chiDoan") {
      mockDbStore.doanVien = mockDbStore.doanVien.filter((dv) => String(dv.chiDoanId) !== String(params.id));
    }

    return { rows: [], rowCount: origLen - mockDbStore[tblMatch].length };
  }

  return { rows: [], rowCount: 0 };
}

async function runQuery(queryText, params = {}) {
  if (useMockDb) {
    return runMockQuery(queryText, params);
  }

  if (isPg) {
    let pgQuery = queryText;
    const values = [];
    let count = 1;

    const matches = queryText.match(/@\w+/g) || [];
    const uniqueMatches = [...new Set(matches)];

    uniqueMatches.forEach((match) => {
      const key = match.replace("@", "");
      values.push(params[key]);
      const regex = new RegExp(match, "g");
      pgQuery = pgQuery.replace(regex, `$${count}`);
      count++;
    });

    const res = await pgPool.query(pgQuery, values);
    return { rows: res.rows, rowCount: res.rowCount };
  } else {
    // MS SQL Server
    const request = new sql.Request();
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
    const res = await request.query(queryText);
    return { rows: res.recordset, rowCount: res.rowsAffected[0] };
  }
}

const initializeDatabase = async () => {
  if (isPg) {
    try {
      const client = await pgPool.connect();
      try {
        // Create tables with double-quoted camelCase names
        await client.query(`
          CREATE TABLE IF NOT EXISTS "taiKhoanAdmin" (
            "tenDangNhap" VARCHAR(50) PRIMARY KEY,
            "matKhau" VARCHAR(255) NOT NULL
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS "baiViet" (
            "id" VARCHAR(50) PRIMARY KEY,
            "tieuDe" VARCHAR(255) NOT NULL,
            "tomTat" TEXT,
            "noiDung" TEXT,
            "danhMuc" VARCHAR(50),
            "anhDaiDien" TEXT,
            "ngayDang" VARCHAR(20),
            "tacGia" VARCHAR(100),
            "luotXem" INTEGER DEFAULT 0,
            "tinNoiBat" BOOLEAN DEFAULT FALSE,
            "createdBy" VARCHAR(100),
            "createdAt" VARCHAR(30),
            "updatedBy" VARCHAR(100),
            "updatedAt" VARCHAR(30)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS "vanBan" (
            "id" VARCHAR(50) PRIMARY KEY,
            "tenVanBan" VARCHAR(255) NOT NULL,
            "soHieu" VARCHAR(100),
            "ngayBanHanh" VARCHAR(20),
            "loaiVanBan" VARCHAR(50),
            "duongDanFile" VARCHAR(512),
            "createdBy" VARCHAR(100),
            "createdAt" VARCHAR(30),
            "updatedBy" VARCHAR(100),
            "updatedAt" VARCHAR(30)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS "gopY" (
            "id" VARCHAR(50) PRIMARY KEY,
            "hoTen" VARCHAR(100) NOT NULL,
            "soDienThoai" VARCHAR(20),
            "email" VARCHAR(100),
            "donVi" VARCHAR(150),
            "tieuDe" VARCHAR(255),
            "noiDung" TEXT,
            "ngayGui" VARCHAR(20),
            "createdBy" VARCHAR(100),
            "createdAt" VARCHAR(30),
            "updatedBy" VARCHAR(100),
            "updatedAt" VARCHAR(30)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS "thanhVienBch" (
            "id" VARCHAR(50) PRIMARY KEY,
            "hoTen" VARCHAR(100) NOT NULL,
            "chucVu" INTEGER NOT NULL,
            "email" VARCHAR(100),
            "soDienThoai" VARCHAR(20),
            "anhDaiDien" TEXT,
            "nhiemVu" TEXT,
            "createdBy" VARCHAR(100),
            "createdAt" VARCHAR(30),
            "updatedBy" VARCHAR(100),
            "updatedAt" VARCHAR(30)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS "intro" (
            "id" INTEGER PRIMARY KEY DEFAULT 1,
            "lichSu" TEXT,
            "soLuongDoanVien" VARCHAR(50) DEFAULT '0',
            "soLuongChiDoan" VARCHAR(50) DEFAULT '0',
            "thongTinChiDoan" TEXT
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS "albumAnh" (
            "id" VARCHAR(50) PRIMARY KEY,
            "tieuDe" VARCHAR(255) NOT NULL,
            "ngayTao" VARCHAR(20),
            "createdBy" VARCHAR(100),
            "createdAt" VARCHAR(30),
            "updatedBy" VARCHAR(100),
            "updatedAt" VARCHAR(30)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS "anhAlbum" (
            "id" VARCHAR(50) PRIMARY KEY,
            "albumId" VARCHAR(50) NOT NULL REFERENCES "albumAnh"("id") ON DELETE CASCADE,
            "duongDanAnh" TEXT NOT NULL,
            "tenFile" VARCHAR(255),
            "createdBy" VARCHAR(100),
            "createdAt" VARCHAR(30),
            "updatedBy" VARCHAR(100),
            "updatedAt" VARCHAR(30)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS "loaiChiDoan" (
            "id" VARCHAR(50) PRIMARY KEY,
            "tenLoai" VARCHAR(255) NOT NULL,
            "createdBy" VARCHAR(100),
            "createdAt" VARCHAR(30),
            "updatedBy" VARCHAR(100),
            "updatedAt" VARCHAR(30)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS "chiDoan" (
            "id" VARCHAR(50) PRIMARY KEY,
            "tenChiDoan" VARCHAR(255) NOT NULL,
            "loaiChiDoanId" VARCHAR(50) REFERENCES "loaiChiDoan"("id") ON DELETE CASCADE,
            "createdBy" VARCHAR(100),
            "createdAt" VARCHAR(30),
            "updatedBy" VARCHAR(100),
            "updatedAt" VARCHAR(30)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS "doanVien" (
            "id" VARCHAR(50) PRIMARY KEY,
            "hoTen" VARCHAR(100) NOT NULL,
            "ngaySinh" VARCHAR(20),
            "soDienThoai" VARCHAR(20),
            "email" VARCHAR(100),
            "chiDoanId" VARCHAR(50) NOT NULL REFERENCES "chiDoan"("id") ON DELETE CASCADE,
            "ngayVaoDoan" VARCHAR(20),
            "trangThai" VARCHAR(50) DEFAULT 'Đoàn viên',
            "createdBy" VARCHAR(100),
            "createdAt" VARCHAR(30),
            "updatedBy" VARCHAR(100),
            "updatedAt" VARCHAR(30)
          );
        `);

        // Seed admin if empty
        const adminCheck = await client.query('SELECT COUNT(*) FROM "taiKhoanAdmin"');
        if (parseInt(adminCheck.rows[0].count) === 0) {
          await client.query(
            'INSERT INTO "taiKhoanAdmin" ("tenDangNhap", "matKhau") VALUES ($1, $2)',
            [mockAdmin.tenDangNhap, mockAdmin.matKhau]
          );
        }

        // Seed initial intro settings if empty
        const introCheck = await client.query('SELECT COUNT(*) FROM "intro"');
        if (parseInt(introCheck.rows[0].count) === 0) {
          await client.query(
            'INSERT INTO "intro" ("id", "lichSu", "soLuongDoanVien", "soLuongChiDoan", "thongTinChiDoan") VALUES ($1, $2, $3, $4, $5)',
            [1, "", "0", "0", ""]
          );
        }

        console.log("PostgreSQL schema initialized successfully.");
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn("⚠️ PostgreSQL Connection/Initialization Failed:", err.message);
      console.warn("⚠️ Falling back to built-in IN-MEMORY mock database store.");
      useMockDb = true;
      initMockDbStore();
    }
  } else {
    // MS SQL Server Init
    try {
      const dbName = sqlConfig.database || "tamanh_youth";
      try {
        const masterConfig = { ...sqlConfig, database: "master" };
        await sql.connect(masterConfig);
        await sql.query(`
          IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'${dbName.replace(/'/g, "''")}')
          BEGIN
            CREATE DATABASE [${dbName}]
          END
        `);
        await sql.close();
      } catch (err) {
        console.warn("⚠️ Failed to verify database existence via master database.");
        try {
          await sql.close();
        } catch (_) {}
      }

      await sql.connect(sqlConfig);

      // Create MS SQL Server tables
      await sql.query(`
        IF OBJECT_ID('taiKhoanAdmin', 'U') IS NULL
        CREATE TABLE [taiKhoanAdmin] (
          [tenDangNhap] NVARCHAR(50) PRIMARY KEY,
          [matKhau] NVARCHAR(255) NOT NULL
        );
      `);
      await sql.query(`
        IF OBJECT_ID('baiViet', 'U') IS NULL
        CREATE TABLE [baiViet] (
          [id] NVARCHAR(50) PRIMARY KEY,
          [tieuDe] NVARCHAR(255) NOT NULL,
          [tomTat] NVARCHAR(MAX),
          [noiDung] NVARCHAR(MAX),
          [danhMuc] NVARCHAR(50),
          [anhDaiDien] NVARCHAR(MAX),
          [ngayDang] NVARCHAR(20),
          [tacGia] NVARCHAR(100),
          [luotXem] INT DEFAULT 0,
          [tinNoiBat] BIT DEFAULT 0,
          [createdBy] NVARCHAR(100),
          [createdAt] NVARCHAR(30),
          [updatedBy] NVARCHAR(100),
          [updatedAt] NVARCHAR(30)
        );
      `);
      await sql.query(`
        IF OBJECT_ID('vanBan', 'U') IS NULL
        CREATE TABLE [vanBan] (
          [id] NVARCHAR(50) PRIMARY KEY,
          [tenVanBan] NVARCHAR(255) NOT NULL,
          [soHieu] NVARCHAR(100),
          [ngayBanHanh] NVARCHAR(20),
          [loaiVanBan] NVARCHAR(50),
          [duongDanFile] NVARCHAR(512),
          [createdBy] NVARCHAR(100),
          [createdAt] NVARCHAR(30),
          [updatedBy] NVARCHAR(100),
          [updatedAt] NVARCHAR(30)
        );
      `);
      await sql.query(`
        IF OBJECT_ID('gopY', 'U') IS NULL
        CREATE TABLE [gopY] (
          [id] NVARCHAR(50) PRIMARY KEY,
          [hoTen] NVARCHAR(100) NOT NULL,
          [soDienThoai] NVARCHAR(20),
          [email] NVARCHAR(100),
          [donVi] NVARCHAR(150),
          [tieuDe] NVARCHAR(255),
          [noiDung] NVARCHAR(MAX),
          [ngayGui] NVARCHAR(20),
          [createdBy] NVARCHAR(100),
          [createdAt] NVARCHAR(30),
          [updatedBy] NVARCHAR(100),
          [updatedAt] NVARCHAR(30)
        );
      `);
      await sql.query(`
        IF OBJECT_ID('thanhVienBch', 'U') IS NULL
        CREATE TABLE [thanhVienBch] (
          [id] NVARCHAR(50) PRIMARY KEY,
          [hoTen] NVARCHAR(100) NOT NULL,
          [chucVu] INT NOT NULL,
          [email] NVARCHAR(100),
          [soDienThoai] NVARCHAR(20),
          [anhDaiDien] NVARCHAR(MAX),
          [nhiemVu] NVARCHAR(MAX),
          [createdBy] NVARCHAR(100),
          [createdAt] NVARCHAR(30),
          [updatedBy] NVARCHAR(100),
          [updatedAt] NVARCHAR(30)
        );
      `);
      await sql.query(`
        IF OBJECT_ID('intro', 'U') IS NULL
        CREATE TABLE [intro] (
          [id] INT PRIMARY KEY DEFAULT 1,
          [lichSu] NVARCHAR(MAX),
          [soLuongDoanVien] NVARCHAR(50) DEFAULT '0',
          [soLuongChiDoan] NVARCHAR(50) DEFAULT '0',
          [thongTinChiDoan] NVARCHAR(MAX)
        );
      `);
      await sql.query(`
        IF OBJECT_ID('albumAnh', 'U') IS NULL
        CREATE TABLE [albumAnh] (
          [id] NVARCHAR(50) PRIMARY KEY,
          [tieuDe] NVARCHAR(255) NOT NULL,
          [ngayTao] NVARCHAR(20),
          [createdBy] NVARCHAR(100),
          [createdAt] NVARCHAR(30),
          [updatedBy] NVARCHAR(100),
          [updatedAt] NVARCHAR(30)
        );
      `);
      await sql.query(`
        IF OBJECT_ID('anhAlbum', 'U') IS NULL
        CREATE TABLE [anhAlbum] (
          [id] NVARCHAR(50) PRIMARY KEY,
          [albumId] NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES [albumAnh](id) ON DELETE CASCADE,
          [duongDanAnh] NVARCHAR(MAX) NOT NULL,
          [tenFile] NVARCHAR(255),
          [createdBy] NVARCHAR(100),
          [createdAt] NVARCHAR(30),
          [updatedBy] NVARCHAR(100),
          [updatedAt] NVARCHAR(30)
        );
      `);
      await sql.query(`
        IF OBJECT_ID('loaiChiDoan', 'U') IS NULL
        CREATE TABLE [loaiChiDoan] (
          [id] NVARCHAR(50) PRIMARY KEY,
          [tenLoai] NVARCHAR(255) NOT NULL,
          [createdBy] NVARCHAR(100),
          [createdAt] NVARCHAR(30),
          [updatedBy] NVARCHAR(100),
          [updatedAt] NVARCHAR(30)
        );
      `);
      await sql.query(`
        IF OBJECT_ID('chiDoan', 'U') IS NULL
        CREATE TABLE [chiDoan] (
          [id] NVARCHAR(50) PRIMARY KEY,
          [tenChiDoan] NVARCHAR(255) NOT NULL,
          [loaiChiDoanId] NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES [loaiChiDoan](id) ON DELETE CASCADE,
          [createdBy] NVARCHAR(100),
          [createdAt] NVARCHAR(30),
          [updatedBy] NVARCHAR(100),
          [updatedAt] NVARCHAR(30)
        );
      `);
      await sql.query(`
        IF OBJECT_ID('doanVien', 'U') IS NULL
        CREATE TABLE [doanVien] (
          [id] NVARCHAR(50) PRIMARY KEY,
          [hoTen] NVARCHAR(100) NOT NULL,
          [ngaySinh] NVARCHAR(20),
          [soDienThoai] NVARCHAR(20),
          [email] NVARCHAR(100),
          [chiDoanId] NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES [chiDoan](id) ON DELETE CASCADE,
          [ngayVaoDoan] NVARCHAR(20),
          [trangThai] NVARCHAR(50) DEFAULT N'Đoàn viên',
          [createdBy] NVARCHAR(100),
          [createdAt] NVARCHAR(30),
          [updatedBy] NVARCHAR(100),
          [updatedAt] NVARCHAR(30)
        );
      `);

      // Seed admin default in MSSQL
      const adminCheck = await sql.query('SELECT COUNT(*) as count FROM [taiKhoanAdmin]');
      if (adminCheck.recordset[0].count === 0) {
        const req = new sql.Request();
        req.input("user", mockAdmin.tenDangNhap);
        req.input("pass", mockAdmin.matKhau);
        await req.query('INSERT INTO [taiKhoanAdmin] ([tenDangNhap], [matKhau]) VALUES (@user, @pass)');
      }

      // Seed intro default in MSSQL
      const introCheck = await sql.query('SELECT COUNT(*) as count FROM [intro]');
      if (introCheck.recordset[0].count === 0) {
        await sql.query('INSERT INTO [intro] ([id], [lichSu], [soLuongDoanVien], [soLuongChiDoan], [thongTinChiDoan]) VALUES (1, \'\', \'0\', \'0\', \'\')');
      }

      console.log("MS SQL Server schema initialized successfully.");
    } catch (err) {
      console.warn("⚠️ MS SQL Server Connection/Initialization Failed:", err.message);
      console.warn("⚠️ Falling back to built-in IN-MEMORY mock database store.");
      useMockDb = true;
      initMockDbStore();
    }
  }
};

module.exports = {
  runQuery,
  initializeDatabase,
  isPg,
};
