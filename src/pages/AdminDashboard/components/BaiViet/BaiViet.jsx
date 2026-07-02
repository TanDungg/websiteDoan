import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { newsCategories } from "src/data/mockData";
import { Table } from "src/components";
import { generateUUID } from "src/utils/Commons";
import { useRealtimeRefresh } from "../../../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";
import BaiVietModal from "./BaiVietModal";

export default function BaiViet() {
  const [posts, setPosts] = useState([]);
  const [showBaiVietModal, setShowBaiVietModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const loadPosts = () => {
    apiService
      .get("/api/baiViet")
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error fetching admin posts:", err));
  };

  useRealtimeRefresh("baiViet", () => {
    loadPosts();
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const handleOpenBaiVietModal = (post = null) => {
    setEditingPost(post);
    setShowBaiVietModal(true);
  };

  const handleSavePost = async (postForm, tempImage) => {
    let finalImageUrl = postForm.anhDaiDien;

    if (tempImage) {
      const fileId = generateUUID();
      try {
        const uploadData = await apiService.post(
          "/api/upload",
          {
            fileData: tempImage.fileData,
            fileName: tempImage.fileName,
            fileId,
            postId: postForm.id,
            fileType: "cover",
          },
          false,
        );
        if (uploadData.success) {
          finalImageUrl = uploadData.filePath;
        } else {
          return;
        }
      } catch (err) {
        console.error("Upload during post submit error:", err);
        return;
      }
    }

    if (!finalImageUrl) {
      alert("Bạn vui lòng chọn ảnh bìa bài viết!");
      return;
    }

    try {
      if (editingPost) {
        await apiService.put(
          `/api/baiViet/${editingPost.id}`,
          {
            ...postForm,
            anhDaiDien: finalImageUrl,
          },
          "Cập nhật bài viết thành công!",
        );
      } else {
        await apiService.post(
          "/api/baiViet",
          {
            ...postForm,
            anhDaiDien: finalImageUrl,
          },
          true,
          "Đăng bài viết thành công!",
        );
      }
      setShowBaiVietModal(false);
      loadPosts();
    } catch (err) {
      console.error("Post save error:", err);
    }
  };

  const handleDeletePost = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      apiService
        .delete(`/api/baiViet/${id}`, "Đã xóa bài viết thành công!")
        .then(() => {
          loadPosts();
        })
        .catch((err) => {
          console.error("Delete post error:", err);
        });
    }
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
            onClick={() => handleOpenBaiVietModal(record)}
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
          onClick={() => handleOpenBaiVietModal()}
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

      <BaiVietModal
        isOpen={showBaiVietModal}
        onClose={() => setShowBaiVietModal(false)}
        post={editingPost}
        onSave={handleSavePost}
      />
    </div>
  );
}
