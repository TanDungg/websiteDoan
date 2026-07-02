import React, { useState, useEffect } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import { Table } from "../../../../components";
import { useRealtimeRefresh } from "../../../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";
import DocModal from "./DocModal";

export default function Docs() {
  const [docs, setDocs] = useState([]);
  const [showDocModal, setShowDocModal] = useState(false);

  const loadDocs = () => {
    apiService.get("/api/vanBan")
      .then((data) => setDocs(data))
      .catch((err) => console.error("Error fetching admin docs:", err));
  };

  useRealtimeRefresh("vanBan", () => {
    loadDocs();
  });

  useEffect(() => {
    loadDocs();
  }, []);

  const handleSaveDoc = (formData) => {
    apiService.post(
      "/api/vanBan",
      {
        ...formData,
        duongDanFile: "#",
      },
      true,
      "Đăng tải văn bản mới thành công!"
    )
      .then(() => {
        setShowDocModal(false);
        loadDocs();
      })
      .catch((err) => console.error("Doc save error:", err));
  };

  const handleDeleteDoc = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa văn bản này không?")) {
      apiService.delete(`/api/vanBan/${id}`, "Đã xóa văn bản thành công!")
        .then(() => {
          loadDocs();
        })
        .catch((err) => console.error("Delete doc error:", err));
    }
  };

  const columns = [
    {
      title: "Số hiệu",
      dataIndex: "soHieu",
      key: "soHieu",
      width: "20%",
    },
    {
      title: "Tên văn bản",
      dataIndex: "tenVanBan",
      key: "tenVanBan",
      width: "45%",
      render: (text) => (
        <span className="doc-title-cell">
          <FileText
            size={16}
            style={{
              color: "var(--primary)",
              marginRight: "8px",
            }}
          />
          {text}
        </span>
      ),
    },
    {
      title: "Thể loại",
      dataIndex: "loaiVanBan",
      key: "loaiVanBan",
      width: "15%",
      render: (loaiVanBan) => (
        <span className={`doc-cat-tag cat-${loaiVanBan}`}>{loaiVanBan}</span>
      ),
    },
    {
      title: "Ngày ban hành",
      dataIndex: "ngayBanHanh",
      key: "ngayBanHanh",
      width: "13%",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "7%",
      align: "center",
      render: (_, record) => (
        <button
          className="action-btn delete-btn"
          title="Xóa văn bản"
          onClick={() => handleDeleteDoc(record.id)}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="panel-wrapper">
      <div className="panel-header">
        <h3>Danh sách Văn bản - Tài liệu</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowDocModal(true)}
        >
          <Plus size={18} />
          <span>Thêm văn bản</span>
        </button>
      </div>

      <Table
        columns={columns}
        data={docs}
        emptyMessage="Chưa có văn bản nào được cập nhật."
      />

      <DocModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        onSave={handleSaveDoc}
      />
    </div>
  );
}
