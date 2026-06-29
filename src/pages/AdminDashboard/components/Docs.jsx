import React, { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Check } from "lucide-react";
import { Table } from "../../../components";

export default function Docs() {
  const [docs, setDocs] = useState([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState({
    title: "",
    docNo: "",
    category: "Kế hoạch",
    fileUrl: "#",
  });

  const loadDocs = () => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => setDocs(data))
      .catch((err) => console.error("Error fetching admin docs:", err));
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleDocSubmit = (e) => {
    e.preventDefault();
    fetch("/api/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(docForm),
    })
      .then((res) => res.json())
      .then(() => {
        setShowDocModal(false);
        setDocForm({
          title: "",
          docNo: "",
          category: "Kế hoạch",
          fileUrl: "#",
        });
        loadDocs();
      })
      .catch((err) => {
        console.error("Doc save error:", err);
        alert("Có lỗi xảy ra khi thêm văn bản!");
      });
  };

  const handleDeleteDoc = (id) => {
    if (window.confirm("Đồng chí có chắc chắn muốn xóa văn bản này không?")) {
      fetch(`/api/documents/${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          alert("Đã xóa văn bản thành công!");
          loadDocs();
        })
        .catch((err) => {
          console.error("Delete doc error:", err);
          alert("Có lỗi xảy ra khi xóa văn bản!");
        });
    }
  };

  const columns = [
    {
      title: "Số hiệu",
      dataIndex: "docNo",
      key: "docNo",
      width: "20%",
    },
    {
      title: "Tên văn bản",
      dataIndex: "title",
      key: "title",
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
      dataIndex: "category",
      key: "category",
      width: "15%",
      render: (category) => (
        <span className={`doc-cat-tag cat-${category}`}>{category}</span>
      ),
    },
    {
      title: "Ngày ban hành",
      dataIndex: "date",
      key: "date",
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
                <div className="form-group">
                  <label className="form-label">Số hiệu văn bản *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: 15-KH/ĐTN-TA"
                    required
                    value={docForm.docNo}
                    onChange={(e) =>
                      setDocForm({ ...docForm, docNo: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tên văn bản / Tài liệu *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={docForm.title}
                    onChange={(e) =>
                      setDocForm({ ...docForm, title: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Thể loại *</label>
                  <select
                    className="form-control"
                    value={docForm.category}
                    onChange={(e) =>
                      setDocForm({ ...docForm, category: e.target.value })
                    }
                  >
                    <option value="Kế hoạch">Kế hoạch</option>
                    <option value="Nghị quyết">Nghị quyết</option>
                    <option value="Quyết định">Quyết định</option>
                    <option value="Hướng dẫn">Hướng dẫn</option>
                  </select>
                </div>
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
