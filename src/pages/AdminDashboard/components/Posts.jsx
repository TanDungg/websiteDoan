import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Check } from "lucide-react";
import { newsCategories } from "src/data/mockData";
import { Table, Modal, RichTextEditor } from "src/components";
import { generateUUID } from "src/utils/Commons";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [tempImage, setTempImage] = useState(null);
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
      alert("Đồng chí vui lòng chọn ảnh bìa bài viết!");
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
    if (window.confirm("Đồng chí có chắc chắn muốn xóa bài viết này không?")) {
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

        <div className="form-group">
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

        <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0 12px" }}>
          <input
            type="checkbox"
            id="post-is-hot"
            style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--primary)" }}
            checked={postForm.isHot}
            onChange={(e) =>
              setPostForm({ ...postForm, isHot: e.target.checked })
            }
          />
          <label htmlFor="post-is-hot" className="form-label" style={{ marginBottom: 0, cursor: "pointer", fontWeight: 600, color: "var(--text-main)" }}>
            Tin nổi bật (Ghim lên Slider biểu ngữ Banner tại trang chủ)
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Ảnh bìa bài viết *</label>
          <div className="image-upload-wrapper">
            {tempImage || postForm.imageUrl ? (
              <img
                src={tempImage ? tempImage.previewUrl : postForm.imageUrl}
                alt="Preview"
                className="image-preview-thumbnail"
              />
            ) : (
              <div className="image-preview-placeholder">Chưa chọn ảnh</div>
            )}
            <label className="image-upload-btn-label">
              Tải ảnh từ máy
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Hoặc nhập liên kết ảnh (URL)..."
              style={{ flex: 1 }}
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
