import React, { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Check } from "lucide-react";
import { Table, FormItem } from "../../../../components";
import { useRealtimeRefresh } from "../../../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";

export default function Docs() {
  const [docs, setDocs] = useState([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState({
    tenVanBan: "",
    soHieu: "",
    loaiVanBan: "Kế hoạch",
    duongDanFile: "#",
  });

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

  const handleDocSubmit = (e) => {
    e.preventDefault();
    apiService.post(
      "/api/vanBan",
      docForm,
      true,
      "Đăng tải văn bản mới thành công!"
    )
      .then(() => {
        setShowDocModal(false);
        setDocForm({
          tenVanBan: "",
          soHieu: "",
          loaiVanBan: "Kế hoạch",
          duongDanFile: "#",
        });
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

      {/* MODAL: ADD DOCUMENT */}
      {showDocModal && (
        <div className="modal-overlay">
          <div
            className="modal-container card animate-fade-in"
            style={{ maxWidth: "500px" }}
          >
            <div className="modal-header">
              <h3>Thêm văn bản - Tài liệu</h3>
              <button
                className="modal-close"
                onClick={() => setShowDocModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleDocSubmit} className="modal-form">
              <div className="modal-body">
                <FormItem
                  label="Số hiệu văn bản"
                  type="text"
                  required
                  placeholder="Ví dụ: 15-KH/ĐTN-TA"
                  value={docForm.soHieu}
                  onChange={(val) => setDocForm({ ...docForm, soHieu: val })}
                />

                <FormItem
                  label="Tên văn bản / Tài liệu"
                  type="text"
                  required
                  value={docForm.tenVanBan}
                  onChange={(val) => setDocForm({ ...docForm, tenVanBan: val })}
                />

                <FormItem
                  label="Thể loại"
                  type="select"
                  required
                  value={docForm.loaiVanBan}
                  onChange={(val) => setDocForm({ ...docForm, loaiVanBan: val })}
                  options={[
                    { value: "Kế hoạch", label: "Kế hoạch" },
                    { value: "Nghị quyết", label: "Nghị quyết" },
                    { value: "Quyết định", label: "Quyết định" },
                    { value: "Hướng dẫn", label: "Hướng dẫn" },
                  ]}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowDocModal(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Thêm văn bản</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
