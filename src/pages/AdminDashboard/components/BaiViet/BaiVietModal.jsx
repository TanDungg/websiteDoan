import React, { useState, useEffect, useRef } from "react";
import { Check, Upload, X } from "lucide-react";
import { Modal, FormItem } from "src/components";
import { newsCategories } from "src/data/mockData";
import { generateUUID } from "src/utils/Commons";
import apiService from "src/services/apiService";

export default function BaiVietModal({ isOpen, onClose, post, onSave }) {
  const fileInputRef = useRef(null);
  const [isImageCardHovered, setIsImageCardHovered] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [postForm, setPostForm] = useState({
    id: "",
    tieuDe: "",
    tomTat: "",
    noiDung: "",
    danhMuc: "hoat-dong",
    anhDaiDien: "",
    tacGia: "BCH Đoàn xã",
    tinNoiBat: false,
  });

  useEffect(() => {
    if (isOpen) {
      setTempImage(null);
      if (post) {
        setPostForm({
          id: post.id,
          tieuDe: post.tieuDe,
          tomTat: post.tomTat,
          noiDung: "",
          danhMuc: post.danhMuc,
          anhDaiDien: post.anhDaiDien || "",
          tacGia: post.tacGia,
          tinNoiBat: post.tinNoiBat || false,
        });

        // Fetch the full post details in background
        apiService
          .get(`/api/baiViet/${post.id}`)
          .then((detail) => {
            setPostForm((prev) => {
              if (prev.id === post.id) {
                return { ...prev, noiDung: detail.noiDung };
              }
              return prev;
            });
          })
          .catch((err) =>
            console.error("Error loading post content details:", err),
          );
      } else {
        setPostForm({
          id: generateUUID(),
          tieuDe: "",
          tomTat: "",
          noiDung: "",
          danhMuc: "hoat-dong",
          anhDaiDien: "",
          tacGia: "BCH Đoàn xã",
          tinNoiBat: false,
        });
      }
    }
  }, [isOpen, post]);

  const compressImage = (file, maxWidth, maxHeight, quality, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        callback(compressedBase64);
      };
    };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Kích thước tệp vượt quá giới hạn 10MB!");
      return;
    }

    compressImage(file, 1200, 1200, 0.7, (compressedBase64) => {
      setTempImage({
        fileData: compressedBase64,
        fileName: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
        previewUrl: URL.createObjectURL(file),
      });
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(postForm, tempImage);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post ? "Sửa bài viết" : "Viết bài mới"}
      maxWidth="750px"
      onSubmit={handleSubmit}
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button type="submit" className="btn btn-primary">
            <Check size={16} />
            <span>{post ? "Cập nhật" : "Đăng bài"}</span>
          </button>
        </>
      }
    >
      <FormItem
        label="Tiêu đề bài viết"
        type="text"
        required
        placeholder="Nhập tiêu đề bài viết..."
        value={postForm.tieuDe}
        onChange={(val) => setPostForm({ ...postForm, tieuDe: val })}
      />

      <div style={{ display: "flex", gap: "20px" }}>
        <FormItem
          label="Chuyên mục"
          type="select"
          required
          value={postForm.danhMuc}
          onChange={(val) => setPostForm({ ...postForm, danhMuc: val })}
          options={newsCategories.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
          style={{ flex: 1, marginBottom: 0 }}
        />

        <div
          className="form-group"
          style={{
            flex: 1,
            marginBottom: 0,
          }}
        >
          <label
            className="form-label"
            style={{ opacity: 0, userSelect: "none" }}
          >
            Ghim tin nổi bật
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "0 16px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              backgroundColor: postForm.tinNoiBat ? "#f0fdf4" : "#f8fafc",
              borderColor: postForm.tinNoiBat ? "#22c55e" : "#cbd5e1",
              width: "100%",
              height: "42px",
              transition: "all 0.2s ease",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setPostForm({ ...postForm, tinNoiBat: !postForm.tinNoiBat })
              }
              style={{
                position: "relative",
                width: "42px",
                height: "22px",
                borderRadius: "11px",
                backgroundColor: postForm.tinNoiBat ? "#22c55e" : "#cbd5e1",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "background-color 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: postForm.tinNoiBat ? "22px" : "2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  transition: "left 0.2s ease",
                }}
              />
            </button>

            <span
              style={{
                fontWeight: 600,
                fontSize: "0.85rem",
                color: postForm.tinNoiBat ? "#166534" : "#475569",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() =>
                setPostForm({ ...postForm, tinNoiBat: !postForm.tinNoiBat })
              }
            >
              Ghim tin nổi bật ở Banner Trang chủ
            </span>
          </div>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: "15px" }}>
        <label className="form-label">Ảnh bìa bài viết *</label>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "190px",
            borderRadius: "8px",
            overflow: "hidden",
            border: isImageCardHovered
              ? "1px solid var(--primary)"
              : "1px solid #cbd5e1",
            backgroundColor: "#f8fafc",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={() => setIsImageCardHovered(true)}
          onMouseLeave={() => setIsImageCardHovered(false)}
        >
          {tempImage || postForm.anhDaiDien ? (
            <>
              <img
                src={tempImage ? tempImage.previewUrl : postForm.anhDaiDien}
                alt="Preview Cover"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  backdropFilter: "blur(3px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: isImageCardHovered ? 1 : 0,
                  transition: "opacity 0.2s ease",
                  color: "#fff",
                }}
              >
                <Upload size={28} />
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                  Nhấp chuột để chọn ảnh bìa khác
                </span>
              </div>

              <button
                type="button"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(239, 68, 68, 0.9)",
                  color: "#fff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                  zIndex: 2,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTempImage(null);
                  setPostForm({ ...postForm, anhDaiDien: "" });
                }}
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <Upload
                size={32}
                style={{ color: "#94a3b8", marginBottom: "8px" }}
              />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#64748b",
                }}
              >
                Tải ảnh bìa bài viết lên
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  marginTop: "4px",
                }}
              >
                Hỗ trợ JPG, PNG, WEBP tối đa 10MB
              </span>
            </>
          )}
        </div>
      </div>

      <FormItem
        label="Tóm tắt ngắn (Dành cho trang chủ/danh sách tin)"
        type="textarea"
        rows="2"
        required
        placeholder="Nhập tóm tắt bài viết..."
        value={postForm.tomTat}
        onChange={(val) => setPostForm({ ...postForm, tomTat: val })}
      />

      <FormItem
        label="Nội dung bài viết chi tiết (Nhập HTML hoặc văn bản thường)"
        type="textarea"
        rows="8"
        required
        placeholder="Nội dung bài viết..."
        value={postForm.noiDung}
        onChange={(val) => setPostForm({ ...postForm, noiDung: val })}
      />

      <div style={{ display: "flex", gap: "20px" }}>
        <FormItem
          label="Tác giả bài đăng"
          type="text"
          required
          value={postForm.tacGia}
          onChange={(val) => setPostForm({ ...postForm, tacGia: val })}
          style={{ flex: 1 }}
        />

        <div style={{ flex: 1 }} />
      </div>
    </Modal>
  );
}
