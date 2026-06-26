import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Check } from "lucide-react";
import { newsCategories } from "../../../data/mockData";
import RichTextEditor from "../../../components/RichTextEditor/RichTextEditor";
import Table from "../../../components/Table/Table";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postForm, setPostForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "hoat-dong",
    imageUrl:
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80",
    author: "BCH Đoàn xã",
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
    if (post) {
      setEditingPost(post);
      setPostForm({
        title: post.title,
        summary: post.summary,
        content: post.content,
        category: post.category,
        imageUrl: post.imageUrl,
        author: post.author,
      });
    } else {
      setEditingPost(null);
      setPostForm({
        title: "",
        summary: "",
        content: "",
        category: "hoat-dong",
        imageUrl:
          "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80",
        author: "BCH Đoàn xã",
      });
    }
    setShowPostModal(true);
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    const url = editingPost ? `/api/posts/${editingPost.id}` : "/api/posts";
    const method = editingPost ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postForm),
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

      fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileData: base64Data, fileName: file.name }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPostForm((prev) => ({ ...prev, imageUrl: data.url }));
          } else {
            alert("Tải ảnh lên thất bại!");
          }
        })
        .catch((err) => {
          console.error("Upload error:", err);
          alert("Có lỗi xảy ra khi tải ảnh lên!");
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
        <button className="btn btn-primary" onClick={() => handleOpenPostModal()}>
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
      {showPostModal && (
        <div className="modal-overlay">
          <div className="modal-container card animate-fade-in" style={{ maxWidth: "750px" }}>
            <div className="modal-header">
              <h3>{editingPost ? "Sửa bài viết" : "Viết bài mới"}</h3>
              <button className="modal-close" onClick={() => setShowPostModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handlePostSubmit} className="modal-form">
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tiêu đề bài viết *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Chuyên mục *</label>
                  <select
                    className="form-control"
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                  >
                    {newsCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ảnh bìa bài viết *</label>
                  <div className="image-upload-wrapper">
                    <img
                      src={postForm.imageUrl}
                      alt="Preview"
                      className="image-preview-thumbnail"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
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
                      onChange={(e) => setPostForm({ ...postForm, imageUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tóm tắt ngắn *</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    required
                    value={postForm.summary}
                    onChange={(e) => setPostForm({ ...postForm, summary: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung chi tiết (Trình soạn thảo trực quan) *</label>
                  <RichTextEditor
                    value={postForm.content}
                    onChange={(val) => setPostForm({ ...postForm, content: val })}
                    placeholder="Nhập nội dung bài viết..."
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowPostModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>{editingPost ? "Cập nhật" : "Đăng bài"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
