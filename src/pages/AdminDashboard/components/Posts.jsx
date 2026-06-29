import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit, Check, Upload, Image, X } from "lucide-react";
import { newsCategories } from "src/data/mockData";
import { Table, Modal, RichTextEditor } from "src/components";
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
    title: "",
    summary: "",
    content: "",
    category: "hoat-dong",
    imageUrl: "",
    author: "BCH Đoàn xã",
    isHot: false,
  });

  const loadPosts = () => {
    fetch("/api/posts")
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
        title: post.title,
        summary: post.summary,
        content: post.content,
        category: post.category,
        imageUrl: post.imageUrl || "",
        author: post.author,
        isHot: post.isHot || false,
      });
    } else {
      setEditingPost(null);
      setPostForm({
        id: generateUUID(),
        title: "",
        summary: "",
        content: "",
        category: "hoat-dong",
        imageUrl: "",
        author: "BCH Đoàn xã",
        isHot: false,
      });
    }
    setShowPostModal(true);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    let finalImageUrl = postForm.imageUrl;

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

    const url = editingPost ? `/api/posts/${editingPost.id}` : "/api/posts";
    const method = editingPost ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...postForm,
        imageUrl: finalImageUrl,
      }),
    })
      .then((res) => res.json())
      .then(() => {
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
      fetch(`/api/posts/${id}`, {
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
      dataIndex: "title",
      key: "title",
      width: "40%",
      render: (text) => <span className="post-title-cell">{text}</span>,
    },
    {
      title: "Chuyên mục",
      dataIndex: "category",
      key: "category",
      width: "20%",
      render: (category) => (
        <span className={`badge badge-${category}`}>
          {newsCategories.find((c) => c.id === category)?.name || "Chuyên mục"}
        </span>
      ),
    },
    {
      title: "Ngày đăng",
      dataIndex: "date",
      key: "date",
      width: "15%",
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
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
        <div className="form-group">
          <label className="form-label">Tiêu đề bài viết *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nhập tiêu đề bài viết..."
            required
            value={postForm.title}
            onChange={(e) =>
              setPostForm({ ...postForm, title: e.target.value })
            }
          />
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Chuyên mục *</label>
            <select
              className="form-control"
              value={postForm.category}
              onChange={(e) =>
                setPostForm({ ...postForm, category: e.target.value })
              }
            >
              {newsCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className="form-group"
            style={{
              flex: 1,
              marginBottom: 0,
            }}
          >
            <label className="form-label" style={{ opacity: 0, userSelect: "none", marginBottom: "6px" }}>Ghim tin nổi bật</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "0 16px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                backgroundColor: postForm.isHot ? "#f0fdf4" : "#f8fafc",
                borderColor: postForm.isHot ? "#22c55e" : "#cbd5e1",
                width: "100%",
                height: "42px",
                transition: "all 0.2s ease",
              }}
            >
              <button
                type="button"
                onClick={() => setPostForm({ ...postForm, isHot: !postForm.isHot })}
                style={{
                  position: "relative",
                  width: "42px",
                  height: "22px",
                  borderRadius: "11px",
                  backgroundColor: postForm.isHot ? "#22c55e" : "#cbd5e1",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "background-color 0.2s ease",
                  display: "inline-flex",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: postForm.isHot ? "22px" : "2px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    transition: "left 0.2s ease"
                  }}
                />
              </button>
              
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: postForm.isHot ? "#166534" : "#475569",
                  cursor: "pointer",
                  userSelect: "none"
                }}
                onClick={() => setPostForm({ ...postForm, isHot: !postForm.isHot })}
              >
                Ghim Tin nổi bật ở Banner Trang chủ
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
            {tempImage || postForm.imageUrl ? (
              <>
                <img
                  src={tempImage ? tempImage.previewUrl : postForm.imageUrl}
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
                    transition: "transform 0.2s ease",
                    zIndex: 10,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempImage(null);
                    setPostForm({ ...postForm, imageUrl: "" });
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                  title="Gỡ bỏ ảnh bìa"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: isImageCardHovered
                      ? "var(--primary-light)"
                      : "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isImageCardHovered ? "var(--primary)" : "#64748b",
                    transition: "all 0.2s",
                  }}
                >
                  <Image size={24} />
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "#334155",
                  }}
                >
                  Kéo thả hoặc nhấp chuột để tải ảnh bìa lên
                </span>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Định dạng hỗ trợ: JPG, PNG, WEBP, GIF
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#64748b",
                whiteSpace: "nowrap",
              }}
            >
              Hoặc nhập liên kết ảnh (URL):
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập liên kết ảnh bìa từ Internet (ví dụ: https://...)"
              style={{ flex: 1, height: "36px" }}
              value={postForm.imageUrl}
              onChange={(e) => {
                setTempImage(null);
                setPostForm({ ...postForm, imageUrl: e.target.value });
              }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tóm tắt *</label>
          <textarea
            className="form-control"
            rows="2"
            required
            placeholder="Nhập tóm tắt..."
            value={postForm.summary}
            onChange={(e) =>
              setPostForm({ ...postForm, summary: e.target.value })
            }
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label">
            Nội dung chi tiết (Trình soạn thảo trực quan) *
          </label>
          <RichTextEditor
            value={postForm.content}
            onChange={(val) => setPostForm({ ...postForm, content: val })}
            placeholder="Nhập nội dung bài viết..."
          />
        </div>
      </Modal>
    </div>
  );
}
