import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check } from "lucide-react";
import { Table } from "../../../components";

export default function Bch() {
  const [bchMembers, setBchMembers] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    imageUrl: "",
    responsibility: "",
    displayOrder: 1,
  });

  const loadBch = () => {
    fetch("/api/intro")
      .then((res) => res.json())
      .then((data) => {
        if (data.bchMembers) {
          setBchMembers(data.bchMembers);
        }
      })
      .catch((err) => console.error("Error fetching bch members:", err));
  };

  useEffect(() => {
    loadBch();
  }, []);

  const handleOpenMemberModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({
        name: member.name,
        position: member.position,
        email: member.email,
        phone: member.phone,
        imageUrl:
          member.imageUrl ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
        responsibility: member.responsibility || "",
        displayOrder: member.displayOrder || 1,
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        name: "",
        position: "",
        email: "",
        phone: "",
        imageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
        responsibility: "",
        displayOrder: bchMembers.length + 1,
      });
    }
    setShowMemberModal(true);
  };

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    const url = editingMember
      ? `/api/bch-members/${editingMember.id}`
      : "/api/bch-members";
    const method = editingMember ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memberForm),
    })
      .then((res) => res.json())
      .then(() => {
        setShowMemberModal(false);
        loadBch();
      })
      .catch((err) => {
        console.error("Member save error:", err);
        alert("Có lỗi xảy ra khi lưu thông tin thành viên!");
      });
  };

  const handleDeleteMember = (id) => {
    if (
      window.confirm("Đồng chí có chắc chắn muốn xóa thành viên BCH này không?")
    ) {
      fetch(`/api/bch-members/${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          alert("Đã xóa thành viên BCH thành công!");
          loadBch();
        })
        .catch((err) => {
          console.error("Delete member error:", err);
          alert("Có lỗi xảy ra khi xóa thành viên BCH!");
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
            setMemberForm((prev) => ({ ...prev, imageUrl: data.url }));
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
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      width: "25%",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      width: "20%",
      render: (position) => (
        <span
          className="badge badge-primary"
          style={{
            backgroundColor: "var(--primary)",
            color: "#fff",
            fontSize: "0.8rem",
            padding: "3px 8px",
            borderRadius: "4px",
          }}
        >
          {position}
        </span>
      ),
    },
    {
      title: "Email / SĐT",
      key: "contact",
      width: "25%",
      render: (_, record) => (
        <div style={{ fontSize: "0.85rem" }}>
          <div>📞 {record.phone}</div>
          <div>✉️ {record.email}</div>
        </div>
      ),
    },
    {
      title: "Nhiệm vụ",
      dataIndex: "responsibility",
      key: "responsibility",
      width: "18%",
      render: (text) => <span style={{ fontSize: "0.85rem" }}>{text}</span>,
    },
    {
      title: "Thứ tự",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: "8%",
      align: "center",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "7%",
      align: "center",
      render: (_, record) => (
        <div className="action-buttons-group">
          <button
            className="action-btn edit-btn"
            type="button"
            title="Sửa thành viên"
            onClick={() => handleOpenMemberModal(record)}
          >
            <Edit size={16} />
          </button>
          <button
            className="action-btn delete-btn"
            type="button"
            title="Xóa thành viên"
            onClick={() => handleDeleteMember(record.id)}
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
        <h3>Ban Chấp Hành đương nhiệm</h3>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => handleOpenMemberModal()}
        >
          <Plus size={18} />
          <span>Thêm thành viên BCH</span>
        </button>
      </div>

      <Table
        columns={columns}
        data={bchMembers}
        emptyMessage="Chưa có thành viên BCH nào được thiết lập."
      />

      {/* MODAL: ADD/EDIT BCH MEMBER */}
      {showMemberModal && (
        <div className="modal-overlay">
          <div
            className="modal-container card animate-fade-in"
            style={{ maxWidth: "550px" }}
          >
            <div className="modal-header">
              <h3>
                {editingMember ? "Sửa thành viên BCH" : "Thêm thành viên BCH"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowMemberModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleMemberSubmit} className="modal-form">
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={memberForm.name}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Chức danh / Chức vụ *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Ví dụ: Bí thư Đoàn xã"
                    value={memberForm.position}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, position: e.target.value })
                    }
                  />
                </div>

                <div className="row" style={{ display: "flex", gap: "15px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Số điện thoại *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={memberForm.phone}
                      onChange={(e) =>
                        setMemberForm({ ...memberForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={memberForm.email}
                      onChange={(e) =>
                        setMemberForm({ ...memberForm, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ảnh đại diện *</label>
                  <div className="image-upload-wrapper">
                    <img
                      src={memberForm.imageUrl}
                      alt="Preview"
                      className="image-preview-thumbnail"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80";
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
                      value={memberForm.imageUrl}
                      onChange={(e) =>
                        setMemberForm({
                          ...memberForm,
                          imageUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Phân công nhiệm vụ / Trách nhiệm
                  </label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Ví dụ: Phụ trách chung, Chỉ đạo toàn diện công tác Đoàn và phong trào thanh thiếu nhi xã..."
                    value={memberForm.responsibility}
                    onChange={(e) =>
                      setMemberForm({
                        ...memberForm,
                        responsibility: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Thứ tự hiển thị *</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={memberForm.displayOrder}
                    onChange={(e) =>
                      setMemberForm({
                        ...memberForm,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowMemberModal(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>{editingMember ? "Cập nhật" : "Thêm mới"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
