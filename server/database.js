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
  try {
    const connStr = process.env.DATABASE_URL;
    const maskConnStr = connStr.replace(/:([^:@]+)@/, ":******@");
    console.log(`[DB Connection String]: ${maskConnStr}`);
  } catch (e) {
    console.warn("Failed to print connection string debug info");
  }

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
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true, // Required for local development
  },
};

// Seeding Data definitions
const mockAdmin = { username: "admin", password: "admin123" };

const mockPosts = [];

const mockDocs = [];

const mockBchMembers = [
  {
    id: "1",
    name: 'Đồng chí Trần Văn B',
    position: 'Bí thư Đoàn xã',
    email: 'tranvanb.tamanh@danang.gov.vn',
    phone: '0905.123.xxx',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    responsibility: 'Phụ trách chung công tác Đoàn và phong trào thanh thiếu nhi xã Tam Anh. Đại diện pháp nhân của Đoàn xã.',
    displayOrder: 1
  },
  {
    id: "2",
    name: 'Đồng chí Nguyễn Thị C',
    position: 'Phó Bí thư Đoàn xã',
    email: 'nguyenthic.tamanh@danang.gov.vn',
    phone: '0905.456.xxx',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
    responsibility: 'Trực tiếp phụ trách công tác Tổ chức - Kiểm tra, phong trào học sinh trường học và Đội Thiếu niên Tiền phong.',
    displayOrder: 2
  },
  {
    id: "3",
    name: 'Đồng chí Lê Hoàng D',
    position: 'Ủy viên BTV Đoàn xã',
    email: 'lehoangd.tamanh@gmail.com',
    phone: '0905.789.xxx',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    responsibility: 'Phụ trách mảng văn thể mỹ, phong trào khởi nghiệp thanh niên và khối Chi đoàn nông nghiệp.',
    displayOrder: 3
  }
];

const mockBranches = [
  { id: "b1", name: "Chi đoàn Thôn Tam Anh 1", groupName: "Chi đoàn Địa bàn Dân cư", displayOrder: 1 },
  { id: "b2", name: "Chi đoàn Thôn Tam Anh 2", groupName: "Chi đoàn Địa bàn Dân cư", displayOrder: 2 },
  { id: "b3", name: "Chi đoàn Thôn Tam Anh 3", groupName: "Chi đoàn Địa bàn Dân cư", displayOrder: 3 },
  { id: "b4", name: "Chi đoàn Thôn Tam Anh 4", groupName: "Chi đoàn Địa bàn Dân cư", displayOrder: 4 },
  { id: "b5", name: "Chi đoàn Thôn Tam Anh 5", groupName: "Chi đoàn Địa bàn Dân cư", displayOrder: 5 },
  { id: "b6", name: "Chi đoàn Công an xã", groupName: "Chi đoàn Lực lượng vũ trang", displayOrder: 6 },
  { id: "b7", name: "Chi đoàn Quân sự xã (Trung đội dân quân cơ động)", groupName: "Chi đoàn Lực lượng vũ trang", displayOrder: 7 },
  { id: "b8", name: "Chi đoàn Trường Tiểu học Tam Anh", groupName: "Chi đoàn Khối Trường học", displayOrder: 8 },
  { id: "b9", name: "Chi đoàn Trường THCS Tam Anh", groupName: "Chi đoàn Khối Trường học", displayOrder: 9 },
  { id: "b10", name: "Chi đoàn Trường Mầm non Hướng Dương", groupName: "Chi đoàn Khối Trường học", displayOrder: 10 }
];

const mockIntroSettings = {
  id: 1,
  historyContent: `<p>Đoàn TNCS Hồ Chí Minh xã Tam Anh, Thành phố Đà Nẵng là tổ chức chính trị - xã hội của thanh niên Việt Nam tại địa bàn xã Tam Anh. Dưới sự lãnh đạo trực tiếp của Đảng ủy xã Tam Anh và Đoàn TNCS Hồ Chí Minh cấp trên, Đoàn xã luôn giữ vai trò xung kích, đi đầu trong các phong trào hành động cách mạng của thanh niên tại địa phương.</p><p>Trải qua nhiều nhiệm kỳ hoạt động, Đoàn xã Tam Anh đã không ngừng lớn mạnh, quy tụ và đoàn kết các tầng lớp thanh thiếu nhi tích cực tham gia phát triển kinh tế, giữ vững an ninh chính trị, trật tự an toàn xã hội, bảo vệ môi trường, xây dựng nông thôn mới và phát triển đô thị.</p>`,
  statMembers: "350+",
  statBranches: "12",
  branchesContent: `<div class="unit-category"><h3>Chi đoàn Địa bàn Dân cư</h3><ul><li>Chi đoàn Thôn Tam Anh 1</li><li>Chi đoàn Thôn Tam Anh 2</li><li>Chi đoàn Thôn Tam Anh 3</li><li>Chi đoàn Thôn Tam Anh 4</li><li>Chi đoàn Thôn Tam Anh 5</li></ul></div><div class="unit-category"><h3>Chi đoàn Lực lượng vũ trang</h3><ul><li>Chi đoàn Công an xã</li><li>Chi đoàn Quân sự xã (Trung đội dân quân cơ động)</li></ul></div><div class="unit-category"><h3>Chi đoàn Khối Trường học</h3><ul><li>Chi đoàn Trường Tiểu học Tam Anh</li><li>Chi đoàn Trường THCS Tam Anh</li><li>Chi đoàn Trường Mầm non Hướng Dương</li></ul></div>`
};

// --- Mock Database Store ---
let useMockDb = false;
let mockDbStore = null;

function initMockDbStore() {
  mockDbStore = {
    admins: [mockAdmin],
    posts: mockPosts.map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      content: p.content,
      category: p.category,
      image_url: p.imageUrl,
      date: p.date,
      author: p.author,
      views: p.views || 0,
      is_hot: p.isHot ? 1 : 0,
    })),
    documents: mockDocs.map((d) => ({
      id: d.id,
      title: d.title,
      doc_no: d.docNo,
      date: d.date,
      category: d.category,
      file_url: d.fileUrl,
    })),
    feedbacks: [],
    intro: {
      id: mockIntroSettings.id,
      history_content: mockIntroSettings.historyContent,
      stat_members: mockIntroSettings.statMembers,
      stat_branches: mockIntroSettings.statBranches,
      branches_content: mockIntroSettings.branchesContent
    },
    bchMembers: mockBchMembers.map((m) => ({
      id: m.id,
      name: m.name,
      position: m.position,
      email: m.email,
      phone: m.phone,
      image_url: m.imageUrl,
      responsibility: m.responsibility,
      display_order: m.displayOrder
    })),
    gallery: [],
    galleryPhotos: [],
    branches: mockBranches.map((b) => ({
      id: b.id,
      name: b.name,
      group_name: b.groupName,
      display_order: b.displayOrder
    })),
  };
}

function runMockQuery(queryText, params = {}) {
  const normalizedQuery = queryText.replace(/\s+/g, ' ').trim();

  // 1. Authenticate admins
  if (normalizedQuery.includes('FROM admins')) {
    const user = mockDbStore.admins.find(
      (u) => u.username === params.username && u.password === params.password,
    );
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 2. Select posts
  if (normalizedQuery.includes('FROM posts') && normalizedQuery.startsWith('SELECT')) {
    let list = [...mockDbStore.posts];
    if (params.id !== undefined) {
      list = list.filter((p) => String(p.id) === String(params.id));
    }
    if (params.category !== undefined) {
      list = list.filter((p) => p.category === params.category);
    }
    if (params.search !== undefined) {
      const searchTerm = params.search.replace(/%/g, '').toLowerCase();
      list = list.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(searchTerm)) ||
          (p.summary && p.summary.toLowerCase().includes(searchTerm)),
      );
    }
    // Sort by date DESC
    list.sort((a, b) => {
      const da = a.date || '';
      const db = b.date || '';
      return db.localeCompare(da);
    });
    return { rows: list, rowCount: list.length };
  }

  // 3. Update posts views
  if (normalizedQuery.includes('UPDATE posts SET views = views + 1')) {
    const post = mockDbStore.posts.find((p) => String(p.id) === String(params.id));
    if (post) {
      post.views = (post.views || 0) + 1;
    }
    return { rows: [], rowCount: post ? 1 : 0 };
  }

  // 4. Insert into posts
  if (normalizedQuery.includes('INSERT INTO posts')) {
    const newPost = {
      id: params.id,
      title: params.title,
      summary: params.summary,
      content: params.content,
      category: params.category,
      image_url: params.imageUrl,
      author: params.author,
      date: params.date,
      views: 0,
      is_hot: params.isHot ? 1 : 0,
    };
    mockDbStore.posts.push(newPost);
    return { rows: [], rowCount: 1 };
  }

  // 5. Update posts general
  if (normalizedQuery.startsWith('UPDATE posts')) {
    const post = mockDbStore.posts.find((p) => String(p.id) === String(params.id));
    if (post) {
      post.title = params.title;
      post.summary = params.summary;
      post.content = params.content;
      post.category = params.category;
      post.image_url = params.imageUrl;
      post.author = params.author;
    }
    return { rows: [], rowCount: post ? 1 : 0 };
  }

  // 6. Delete from posts
  if (normalizedQuery.includes('DELETE FROM posts')) {
    const originalLength = mockDbStore.posts.length;
    mockDbStore.posts = mockDbStore.posts.filter((p) => String(p.id) !== String(params.id));
    return { rows: [], rowCount: originalLength - mockDbStore.posts.length };
  }

  // 7. Select documents
  if (normalizedQuery.includes('FROM documents') && normalizedQuery.startsWith('SELECT')) {
    let list = [...mockDbStore.documents];
    list.sort((a, b) => {
      const da = a.date || '';
      const db = b.date || '';
      return db.localeCompare(da);
    });
    return { rows: list, rowCount: list.length };
  }

  // 8. Insert into documents
  if (normalizedQuery.includes('INSERT INTO documents')) {
    const newDoc = {
      id: params.id,
      title: params.title,
      doc_no: params.docNo,
      date: params.date,
      category: params.category,
      file_url: params.fileUrl,
    };
    mockDbStore.documents.push(newDoc);
    return { rows: [], rowCount: 1 };
  }

  // 9. Delete from documents
  if (normalizedQuery.includes('DELETE FROM documents')) {
    const originalLength = mockDbStore.documents.length;
    mockDbStore.documents = mockDbStore.documents.filter(
      (d) => String(d.id) !== String(params.id),
    );
    return { rows: [], rowCount: originalLength - mockDbStore.documents.length };
  }

  // 10. Select feedbacks
  if (normalizedQuery.includes('FROM feedbacks') && normalizedQuery.startsWith('SELECT')) {
    let list = [...mockDbStore.feedbacks];
    list.sort((a, b) => {
      const da = a.date || '';
      const db = b.date || '';
      return db.localeCompare(da);
    });
    return { rows: list, rowCount: list.length };
  }

  // 11. Insert into feedbacks
  if (normalizedQuery.includes('INSERT INTO feedbacks')) {
    const newFeedback = {
      id: params.id,
      full_name: params.fullName,
      phone: params.phone,
      email: params.email,
      unit: params.unit,
      subject: params.subject,
      message: params.message,
      date: params.date,
    };
    mockDbStore.feedbacks.push(newFeedback);
    return { rows: [], rowCount: 1 };
  }

  // 12. Delete from feedbacks
  if (normalizedQuery.includes('DELETE FROM feedbacks')) {
    const originalLength = mockDbStore.feedbacks.length;
    mockDbStore.feedbacks = mockDbStore.feedbacks.filter(
      (f) => String(f.id) !== String(params.id),
    );
    return { rows: [], rowCount: originalLength - mockDbStore.feedbacks.length };
  }

  // 13. Select bch_members
  if (normalizedQuery.includes('FROM bch_members') && normalizedQuery.startsWith('SELECT')) {
    const list = [...mockDbStore.bchMembers];
    list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    return { rows: list, rowCount: list.length };
  }

  // 14. Insert into bch_members
  if (normalizedQuery.includes('INSERT INTO bch_members')) {
    const newMember = {
      id: params.id,
      name: params.name,
      position: params.position,
      email: params.email,
      phone: params.phone,
      image_url: params.imageUrl,
      responsibility: params.responsibility,
      display_order: parseInt(params.displayOrder) || 0
    };
    mockDbStore.bchMembers.push(newMember);
    return { rows: [], rowCount: 1 };
  }

  // 15. Update bch_members
  if (normalizedQuery.startsWith('UPDATE bch_members')) {
    const member = mockDbStore.bchMembers.find(m => String(m.id) === String(params.id));
    if (member) {
      member.name = params.name;
      member.position = params.position;
      member.email = params.email;
      member.phone = params.phone;
      member.image_url = params.imageUrl;
      member.responsibility = params.responsibility;
      member.display_order = parseInt(params.displayOrder) || 0;
    }
    return { rows: [], rowCount: member ? 1 : 0 };
  }

  // 16. Delete from bch_members
  if (normalizedQuery.includes('DELETE FROM bch_members')) {
    const originalLength = mockDbStore.bchMembers.length;
    mockDbStore.bchMembers = mockDbStore.bchMembers.filter(m => String(m.id) !== String(params.id));
    return { rows: [], rowCount: originalLength - mockDbStore.bchMembers.length };
  }

  // 17. Select intro_settings
  if (normalizedQuery.includes('FROM intro_settings') && normalizedQuery.startsWith('SELECT')) {
    return { rows: [mockDbStore.intro], rowCount: 1 };
  }

  // 18. Update intro_settings
  if (normalizedQuery.startsWith('UPDATE intro_settings')) {
    mockDbStore.intro.history_content = params.historyContent;
    mockDbStore.intro.stat_members = params.statMembers;
    mockDbStore.intro.stat_branches = params.statBranches;
    mockDbStore.intro.branches_content = params.branchesContent;
    return { rows: [], rowCount: 1 };
  }

  // 19. Select gallery (Relational join)
  if (normalizedQuery.includes('from gallery g left join gallery_photos gp') || normalizedQuery.includes('from gallery')) {
    const list = [];
    mockDbStore.gallery.forEach(g => {
      const photos = mockDbStore.galleryPhotos.filter(gp => String(gp.gallery_id) === String(g.id));
      if (photos.length === 0) {
        list.push({
          id: g.id,
          title: g.title,
          date: g.date,
          photo_id: null,
          image_url: null
        });
      } else {
        photos.forEach(gp => {
          list.push({
            id: g.id,
            title: g.title,
            date: g.date,
            photo_id: gp.id,
            image_url: gp.image_url
          });
        });
      }
    });
    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return { rows: list, rowCount: list.length };
  }

  // 20. Insert into gallery (Relational)
  if (normalizedQuery.includes('insert into gallery') && !normalizedQuery.includes('gallery_photos')) {
    const newAlbum = {
      id: params.id,
      title: params.title,
      date: params.date
    };
    mockDbStore.gallery.push(newAlbum);
    return { rows: [], rowCount: 1 };
  }

  // 20b. Insert into gallery_photos
  if (normalizedQuery.includes('insert into gallery_photos')) {
    const newPhoto = {
      id: params.id,
      gallery_id: params.galleryId,
      image_url: params.imageUrl
    };
    mockDbStore.galleryPhotos.push(newPhoto);
    return { rows: [], rowCount: 1 };
  }

  // 20c. Select from gallery_photos by gallery_id
  if (normalizedQuery.includes('from gallery_photos where gallery_id')) {
    const photos = mockDbStore.galleryPhotos.filter(gp => String(gp.gallery_id) === String(params.id));
    return { rows: photos.map(gp => ({ image_url: gp.image_url })), rowCount: photos.length };
  }

  // 21. Delete from gallery
  if (normalizedQuery.includes('delete from gallery')) {
    const originalLength = mockDbStore.gallery.length;
    mockDbStore.gallery = mockDbStore.gallery.filter(item => String(item.id) !== String(params.id));
    mockDbStore.galleryPhotos = mockDbStore.galleryPhotos.filter(gp => String(gp.gallery_id) !== String(params.id));
    return { rows: [], rowCount: originalLength - mockDbStore.gallery.length };
  }

  // 22. Select branches
  if (normalizedQuery.includes('FROM branches') && normalizedQuery.startsWith('SELECT')) {
    const list = [...mockDbStore.branches];
    list.sort((a, b) => {
      const groupCompare = (a.group_name || '').localeCompare(b.group_name || '');
      if (groupCompare !== 0) return groupCompare;
      return (a.display_order || 0) - (b.display_order || 0);
    });
    return { rows: list, rowCount: list.length };
  }

  // 23. Insert into branches
  if (normalizedQuery.includes('INSERT INTO branches')) {
    const newBranch = {
      id: params.id,
      name: params.name,
      group_name: params.groupName,
      display_order: parseInt(params.displayOrder) || 0
    };
    mockDbStore.branches.push(newBranch);
    return { rows: [], rowCount: 1 };
  }

  // 24. Update branches
  if (normalizedQuery.startsWith('UPDATE branches')) {
    const branch = mockDbStore.branches.find(b => String(b.id) === String(params.id));
    if (branch) {
      branch.name = params.name;
      branch.group_name = params.groupName;
      branch.display_order = parseInt(params.displayOrder) || 0;
    }
    return { rows: [], rowCount: branch ? 1 : 0 };
  }

  // 25. Delete from branches
  if (normalizedQuery.includes('DELETE FROM branches')) {
    const originalLength = mockDbStore.branches.length;
    mockDbStore.branches = mockDbStore.branches.filter(b => String(b.id) !== String(params.id));
    return { rows: [], rowCount: originalLength - mockDbStore.branches.length };
  }

  return { rows: [], rowCount: 0 };
}

// --- Helper: Execute queries abstractly ---
async function runQuery(queryText, params = {}) {
  if (useMockDb) {
    return runMockQuery(queryText, params);
  }

  if (isPg) {
    // Translate named params like @param to $1, $2 for Postgres
    let pgQuery = queryText;
    const values = [];
    let count = 1;

    // Find all @param variables in the query
    const matches = queryText.match(/@\w+/g) || [];
    const uniqueMatches = [...new Set(matches)];

    // Order matters to map params correctly
    uniqueMatches.forEach((match) => {
      const key = match.replace("@", "");
      values.push(params[key]);

      // Regex replace all occurrences of this variable with $count
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

// Database Initialization
const initializeDatabase = async () => {
  if (isPg) {
    // PostgreSQL Init
    try {
      const client = await pgPool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS admins (
            username VARCHAR(50) PRIMARY KEY,
            password VARCHAR(255) NOT NULL
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS posts (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            summary TEXT,
            content TEXT,
            category VARCHAR(50),
            image_url TEXT,
            date VARCHAR(20),
            author VARCHAR(100),
            views INTEGER DEFAULT 0,
            is_hot BOOLEAN DEFAULT FALSE
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS documents (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            doc_no VARCHAR(100),
            date VARCHAR(20),
            category VARCHAR(50),
            file_url VARCHAR(512)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS feedbacks (
            id VARCHAR(50) PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            email VARCHAR(100),
            unit VARCHAR(150),
            subject VARCHAR(255),
            message TEXT,
            date VARCHAR(20)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS bch_members (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            position VARCHAR(100) NOT NULL,
            email VARCHAR(100),
            phone VARCHAR(20),
            image_url TEXT,
            responsibility TEXT,
            display_order INTEGER DEFAULT 0
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS intro_settings (
            id INTEGER PRIMARY KEY DEFAULT 1,
            history_content TEXT,
            stat_members VARCHAR(50) DEFAULT '350+',
            stat_branches VARCHAR(50) DEFAULT '12',
            branches_content TEXT
          );
        `);
        // Migration: check if old gallery table structure exists
        const oldGalleryCheck = await client.query(
          "SELECT column_name FROM information_schema.columns WHERE table_name='gallery' AND column_name='image_url'"
        );
        if (oldGalleryCheck.rows.length > 0) {
          console.log("Migrating gallery table structure: Dropping old gallery table...");
          await client.query("DROP TABLE IF EXISTS gallery_photos CASCADE;");
          await client.query("DROP TABLE IF EXISTS gallery CASCADE;");
        }

        await client.query(`
          CREATE TABLE IF NOT EXISTS gallery (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            date VARCHAR(20)
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS gallery_photos (
            id VARCHAR(50) PRIMARY KEY,
            gallery_id VARCHAR(50) NOT NULL REFERENCES gallery(id) ON DELETE CASCADE,
            image_url TEXT NOT NULL,
            file_name VARCHAR(255)
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS branches (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            group_name VARCHAR(150) NOT NULL,
            display_order INTEGER DEFAULT 0
          );
        `);

        // Migration: ensure image_url columns can store large base64 strings and file_name column exists
        await client.query("ALTER TABLE posts ALTER COLUMN image_url TYPE TEXT;");
        await client.query("ALTER TABLE bch_members ALTER COLUMN image_url TYPE TEXT;");
        await client.query("ALTER TABLE gallery_photos ALTER COLUMN image_url TYPE TEXT;");
        await client.query("ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);");

        // Seed
        const adminCount = await client.query("SELECT COUNT(*) FROM admins");
        if (parseInt(adminCount.rows[0].count) === 0) {
          await client.query(
            "INSERT INTO admins (username, password) VALUES ($1, $2)",
            [mockAdmin.username, mockAdmin.password],
          );
        }
        const postsCount = await client.query("SELECT COUNT(*) FROM posts");
        if (parseInt(postsCount.rows[0].count) === 0) {
          for (const p of mockPosts) {
            await client.query(
              `INSERT INTO posts (id, title, summary, content, category, image_url, date, author, views, is_hot)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                p.id,
                p.title,
                p.summary,
                p.content,
                p.category,
                p.imageUrl,
                p.date,
                p.author,
                p.views,
                p.isHot,
              ],
            );
          }
        }
        const docsCount = await client.query("SELECT COUNT(*) FROM documents");
        if (parseInt(docsCount.rows[0].count) === 0) {
          for (const d of mockDocs) {
            await client.query(
              `INSERT INTO documents (id, title, doc_no, date, category, file_url)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [d.id, d.title, d.docNo, d.date, d.category, d.fileUrl],
            );
          }
        }

        const bchCount = await client.query("SELECT COUNT(*) FROM bch_members");
        if (parseInt(bchCount.rows[0].count) === 0) {
          for (const m of mockBchMembers) {
            await client.query(
              `INSERT INTO bch_members (id, name, position, email, phone, image_url, responsibility, display_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [m.id, m.name, m.position, m.email, m.phone, m.imageUrl, m.responsibility, m.displayOrder]
            );
          }
        }

        const introCount = await client.query("SELECT COUNT(*) FROM intro_settings");
        if (parseInt(introCount.rows[0].count) === 0) {
          await client.query(
            `INSERT INTO intro_settings (id, history_content, stat_members, stat_branches, branches_content)
             VALUES ($1, $2, $3, $4, $5)`,
            [mockIntroSettings.id, mockIntroSettings.historyContent, mockIntroSettings.statMembers, mockIntroSettings.statBranches, mockIntroSettings.branchesContent]
          );
        }

        const branchesCount = await client.query("SELECT COUNT(*) FROM branches");
        if (parseInt(branchesCount.rows[0].count) === 0) {
          for (const b of mockBranches) {
            await client.query(
              `INSERT INTO branches (id, name, group_name, display_order)
               VALUES ($1, $2, $3, $4)`,
              [b.id, b.name, b.groupName, b.displayOrder]
            );
          }
        }

        console.log("PostgreSQL schema created and seeded.");
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn("⚠️ Failed to connect to PostgreSQL:", err.message);
      console.warn("⚠️ Falling back to built-in IN-MEMORY mock database store.");
      useMockDb = true;
      initMockDbStore();
    }
  } else {
    // MS SQL Server Init
    try {
      const dbName = sqlConfig.database || "tamanh_youth";
      // 1. Try to connect to master database first to check/create the target database
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
      } catch (masterErr) {
        console.warn("⚠️ Cannot verify/create database via 'master' (might lack permissions):", masterErr.message);
        try { await sql.close(); } catch (_) { /* ignore */ }
      }

      // 2. Connect to the target database
      await sql.connect(sqlConfig);

      // Create Tables if not exist
      await sql.query(`
        IF OBJECT_ID('admins', 'U') IS NULL
        CREATE TABLE admins (
          username NVARCHAR(50) PRIMARY KEY,
          password NVARCHAR(255) NOT NULL
        );
      `);

      await sql.query(`
        IF OBJECT_ID('posts', 'U') IS NULL
        CREATE TABLE posts (
          id NVARCHAR(50) PRIMARY KEY,
          title NVARCHAR(255) NOT NULL,
          summary NVARCHAR(MAX),
          content NVARCHAR(MAX),
          category NVARCHAR(50),
          image_url NVARCHAR(MAX),
          date NVARCHAR(20),
          author NVARCHAR(100),
          views INT DEFAULT 0,
          is_hot BIT DEFAULT 0
        );
      `);

      await sql.query(`
        IF OBJECT_ID('documents', 'U') IS NULL
        CREATE TABLE documents (
          id NVARCHAR(50) PRIMARY KEY,
          title NVARCHAR(255) NOT NULL,
          doc_no NVARCHAR(100),
          date NVARCHAR(20),
          category NVARCHAR(50),
          file_url NVARCHAR(512)
        );
      `);

      await sql.query(`
        IF OBJECT_ID('feedbacks', 'U') IS NULL
        CREATE TABLE feedbacks (
          id NVARCHAR(50) PRIMARY KEY,
          full_name NVARCHAR(100) NOT NULL,
          phone NVARCHAR(20),
          email NVARCHAR(100),
          unit NVARCHAR(150),
          subject NVARCHAR(255),
          message NVARCHAR(MAX),
          date NVARCHAR(20)
        );
      `);

      await sql.query(`
        IF OBJECT_ID('bch_members', 'U') IS NULL
        CREATE TABLE bch_members (
          id NVARCHAR(50) PRIMARY KEY,
          name NVARCHAR(100) NOT NULL,
          position NVARCHAR(100) NOT NULL,
          email NVARCHAR(100),
          phone NVARCHAR(20),
          image_url NVARCHAR(MAX),
          responsibility NVARCHAR(MAX),
          display_order INT DEFAULT 0
        );
      `);

      await sql.query(`
        IF OBJECT_ID('intro_settings', 'U') IS NULL
        CREATE TABLE intro_settings (
          id INT PRIMARY KEY DEFAULT 1,
          history_content NVARCHAR(MAX),
          stat_members NVARCHAR(50) DEFAULT '350+',
          stat_branches NVARCHAR(50) DEFAULT '12',
          branches_content NVARCHAR(MAX)
        );
      `);
      await sql.query(`
        IF COL_LENGTH('gallery', 'image_url') IS NOT NULL
        BEGIN
          DROP TABLE IF EXISTS gallery_photos;
          DROP TABLE IF EXISTS gallery;
        END
      `);

      await sql.query(`
        IF OBJECT_ID('gallery', 'U') IS NULL
        CREATE TABLE gallery (
          id NVARCHAR(50) PRIMARY KEY,
          title NVARCHAR(255) NOT NULL,
          date NVARCHAR(20)
        );
      `);

      await sql.query(`
        IF OBJECT_ID('gallery_photos', 'U') IS NULL
        CREATE TABLE gallery_photos (
          id NVARCHAR(50) PRIMARY KEY,
          gallery_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES gallery(id) ON DELETE CASCADE,
          image_url NVARCHAR(MAX) NOT NULL,
          file_name NVARCHAR(255)
        );
      `);

      await sql.query(`
        IF OBJECT_ID('branches', 'U') IS NULL
        CREATE TABLE branches (
          id NVARCHAR(50) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          group_name NVARCHAR(150) NOT NULL,
          display_order INT DEFAULT 0
        );
      `);

      // Migration: ensure image_url columns can store large base64 strings and file_name column exists
      await sql.query("ALTER TABLE posts ALTER COLUMN image_url NVARCHAR(MAX);");
      await sql.query("ALTER TABLE bch_members ALTER COLUMN image_url NVARCHAR(MAX);");
      await sql.query("ALTER TABLE gallery_photos ALTER COLUMN image_url NVARCHAR(MAX);");
      await sql.query(`
        IF COL_LENGTH('gallery_photos', 'file_name') IS NULL
        ALTER TABLE gallery_photos ADD file_name NVARCHAR(255);
      `);

      // Seed Admin
      const adminCheck = await sql.query("SELECT COUNT(*) as count FROM admins");
      if (adminCheck.recordset[0].count === 0) {
        const request = new sql.Request();
        request.input("username", mockAdmin.username);
        request.input("password", mockAdmin.password);
        await request.query(
          "INSERT INTO admins (username, password) VALUES (@username, @password)",
        );
      }

      // Seed Posts
      const postsCheck = await sql.query("SELECT COUNT(*) as count FROM posts");
      if (postsCheck.recordset[0].count === 0) {
        for (const p of mockPosts) {
          const request = new sql.Request();
          request.input("id", p.id);
          request.input("title", p.title);
          request.input("summary", p.summary);
          request.input("content", p.content);
          request.input("category", p.category);
          request.input("imageUrl", p.imageUrl);
          request.input("date", p.date);
          request.input("author", p.author);
          request.input("views", p.views);
          request.input("isHot", p.isHot ? 1 : 0);
          await request.query(`
            INSERT INTO posts (id, title, summary, content, category, image_url, date, author, views, is_hot)
            VALUES (@id, @title, @summary, @content, @category, @imageUrl, @date, @author, @views, @isHot)
          `);
        }
      }

      // Seed Documents
      const docsCheck = await sql.query(
        "SELECT COUNT(*) as count FROM documents",
      );
      if (docsCheck.recordset[0].count === 0) {
        for (const d of mockDocs) {
          const request = new sql.Request();
          request.input("id", d.id);
          request.input("title", d.title);
          request.input("docNo", d.docNo);
          request.input("date", d.date);
          request.input("category", d.category);
          request.input("fileUrl", d.fileUrl);
          await request.query(`
            INSERT INTO documents (id, title, doc_no, date, category, file_url)
            VALUES (@id, @title, @docNo, @date, @category, @fileUrl)
          `);
        }
      }

      // Seed BCH Members
      const bchCheck = await sql.query("SELECT COUNT(*) as count FROM bch_members");
      if (bchCheck.recordset[0].count === 0) {
        for (const m of mockBchMembers) {
          const request = new sql.Request();
          request.input("id", m.id);
          request.input("name", m.name);
          request.input("position", m.position);
          request.input("email", m.email);
          request.input("phone", m.phone);
          request.input("imageUrl", m.imageUrl);
          request.input("responsibility", m.responsibility);
          request.input("displayOrder", m.displayOrder);
          await request.query(`
            INSERT INTO bch_members (id, name, position, email, phone, image_url, responsibility, display_order)
            VALUES (@id, @name, @position, @email, @phone, @imageUrl, @responsibility, @displayOrder)
          `);
        }
      }

      // Seed Intro Settings
      const introCheck = await sql.query("SELECT COUNT(*) as count FROM intro_settings");
      if (introCheck.recordset[0].count === 0) {
        const request = new sql.Request();
        request.input("id", mockIntroSettings.id);
        request.input("historyContent", mockIntroSettings.historyContent);
        request.input("statMembers", mockIntroSettings.statMembers);
        request.input("statBranches", mockIntroSettings.statBranches);
        request.input("branchesContent", mockIntroSettings.branchesContent);
        await request.query(`
          INSERT INTO intro_settings (id, history_content, stat_members, stat_branches, branches_content)
          VALUES (@id, @historyContent, @statMembers, @statBranches, @branchesContent)
        `);
      }

      // Seed Branches
      const branchesCheck = await sql.query("SELECT COUNT(*) as count FROM branches");
      if (branchesCheck.recordset[0].count === 0) {
        for (const b of mockBranches) {
          const request = new sql.Request();
          request.input("id", b.id);
          request.input("name", b.name);
          request.input("groupName", b.groupName);
          request.input("displayOrder", b.displayOrder);
          await request.query(`
            INSERT INTO branches (id, name, group_name, display_order)
            VALUES (@id, @name, @groupName, @displayOrder)
          `);
        }
      }

      console.log("MS SQL Server schema checked and seeded.");
    } catch (err) {
      console.warn("⚠️ Failed to connect to Microsoft SQL Server:", err.message);
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
