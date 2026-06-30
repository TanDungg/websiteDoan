import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit, Check, Upload, X } from "lucide-react";
import { newsCategories } from "src/data/mockData";
import { Table, Modal, FormItem } from "src/components";
import { generateUUID } from "src/utils/Commons";

export default function Posts() {
  const fileInputRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [isImageCardHovered, setIsImageCardHovered] = useState(false);
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

  const loadPosts = () => {
    fetch("/api/baiViet")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error fetching admin posts:", err));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleOpenPostModal = (post = null) => {
    setTempImage(null);
    if (post) {
      setEditingPost(post);
      setPostForm({
        id: post.id,
        tieuDe: post.tieuDe,
        tomTat: post.tomTat,
        noiDung: post.noiDung,
        danhMuc: post.danhMuc,
        anhDaiDien: post.anhDaiDien || "",
        tacGia: post.tacGia,
        tinNoiBat: post.tinNoiBat || false,
      });
    } else {
      setEditingPost(null);
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
    setShowPostModal(true);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    let finalImageUrl = postForm.anhDaiDien;

    if (tempImage) {
      const fileId = generateUUID();
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileData: tempImage.fileData,
            fileName: tempImage.fileName,
            fileId,
            postId: postForm.id,
            fileType: "cover",
          }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          finalImageUrl = uploadData.filePath;
        } else {
          alert("Tải ảnh lên máy chủ thất bại!");
          return;
        }
      } catch (err) {
        console.error("Upload during post submit error:", err);
        alert("Có lỗi xảy ra khi tải ảnh bìa lên máy chủ!");
        return;
      }
    }

    if (!finalImageUrl) {
      alert("Bạn vui lòng chọn ảnh bìa bài viết!");
      return;
    }

    const url = editingPost ? `/api/baiViet/${editingPost.id}` : "/api/baiViet";
    const method = editingPost ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...postForm,
        anhDaiDien: finalImageUrl,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert(
          editingPost
            ? "Cập nhật bài viết thành công!"
            : "Đăng bài viết thành công!",
        );
        setShowPostModal(false);
        loadPosts();
      })
      .catch((err) => {
        console.error("Post save error:", err);
        alert("Có lỗi xảy ra khi lưu bài viết!");
      });
  };

  const handleDeletePost = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      fetch(`/api/baiViet/${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          alert("Đã xóa bài viết thành công!");
          loadPosts();
        })
        .catch((err) => {
          console.error("Delete post error:", err);
          alert("Có lỗi xảy ra khi xóa bài viết!");
        });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = reader.result;
      setTempImage({
        fileData: base64Data,
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
      });
    };
  };

  const columns = [
    {
      title: "Tiêu đề bài viết",
      dataIndex: "tieuDe",
      key: "tieuDe",
      width: "40%",
      render: (text) => <span className="post-title-cell">{text}</span>,
    },
    {
      title: "Chuyên mục",
      dataIndex: "danhMuc",
      key: "danhMuc",
      width: "20%",
      render: (category) => (
        <span className={`badge badge-${category}`}>
          {newsCategories.find((c) => c.id === category)?.name || "Chuyên mục"}
        </span>
      ),
    },
    {
      title: "Ngày đăng",
      dataIndex: "ngayDang",
      key: "ngayDang",
      width: "15%",
    },
    {
      title: "Tác giả",
      dataIndex: "tacGia",
      key: "tacGia",
      width: "13%",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "12%",
      align: "center",
      render: (_, record) => (
        <div className="action-buttons-group">
          <button
            className="action-btn edit-btn"
            title="Sửa bài"
            onClick={() => handleOpenPostModal(record)}
          >
            <Edit size={16} />
          </button>
          <button
            className="action-btn delete-btn"
            title="Xóa bài"
            onClick={() => handleDeletePost(record.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="panel-wrapper">
      <div className="panel-header">
        <h3>Danh sách Bài viết</h3>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenPostModal()}
        >
          <Plus size={18} />
          <span>Viết bài mới</span>
        </button>
      </div>

      <Table
        columns={columns}
        data={posts}
        emptyMessage="Chưa có bài viết nào được đăng tải."
      />

      {/* MODAL: ADD/EDIT POST */}
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title={editingPost ? "Sửa bài viết" : "Viết bài mới"}
        maxWidth="750px"
        onSubmit={handlePostSubmit}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowPostModal(false)}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{editingPost ? "Cập nhật" : "Đăng bài"}</span>
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

                {/* Overlay on hover to tell user they can click to change directly */}
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

                {/* Stop propagation so clicking X doesn't open the file picker */}
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
    </div>
  );
}
