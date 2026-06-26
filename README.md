---
title: Doan Xa Tam Anh Website
emoji: ⭐
colorFrom: blue
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Website Đoàn Thanh niên Xã Tam Anh

Hệ thống quản lý thông tin hoạt động Đoàn thanh niên xã Tam Anh, TP. Đà Nẵng.

## Stack Công Nghệ
- **Frontend**: React 18, Vite, Lucide Icons, Custom CSS Component Library.
- **Backend**: Node.js, Express.js.
- **Database**: MS SQL Server / SQLite.
- **Deployment**: Hugging Face Spaces (Docker).

## Hướng dẫn chạy cục bộ

1. Cài đặt các gói phụ thuộc cho cả client và server:
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

2. Tạo tệp `.env` dựa theo mẫu `.env.example`.

3. Chạy môi trường phát triển:
   - Server: `npm run dev` (hoặc `node server/server.js`)
   - Frontend: `npm run dev`