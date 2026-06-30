import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check } from "lucide-react";
import { Table, FormItem } from "../../../components";

const getChucVuString = (pos) => {
  switch (Number(pos)) {
    case 1:
      return "Bí thư Đoàn xã";
    case 2:
      return "Phó Bí thư Đoàn xã";
    case 3:
      return "Ủy viên Ban Thường vụ";
    case 4:
      return "Ủy viên Ban Chấp hành";
    default:
      return "Thành viên BCH";
  }
};

const positionOptions = [
  { value: 1, label: "Bí thư Đoàn xã" },
  { value: 2, label: "Phó Bí thư Đoàn xã" },
  { value: 3, label: "Ủy viên Ban Thường vụ" },
  { value: 4, label: "Ủy viên Ban Chấp hành" },
];

export default function Bch() {
  const [bchMembers, setBchMembers] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    hoTen: "",
    chucVu: 4,
    email: "",
    soDienThoai: "",
    anhDaiDien: "",
    nhiemVu: "",
  });

  const loadBch = () => {
    fetch("/api/gioiThieu")
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
        hoTen: member.hoTen,
        chucVu: Number(member.chucVu) || 4,
        email: member.email,
        soDienThoai: member.soDienThoai,
        anhDaiDien: member.anhDaiDien || "",
        nhiemVu: member.nhiemVu || "",
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        hoTen: "",
        chucVu: 4,
        email: "",
        soDienThoai: "",
        anhDaiDien: "",
        nhiemVu: "",
      });
    }
    setShowMemberModal(true);
  };

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    if (!memberForm.anhDaiDien || !memberForm.anhDaiDien.trim()) {
      alert(
        "Bạn vui lòng tải lên hoặc dán liên kết ảnh đại diện cho thành viên BCH!",
      );
      return;
    }

    const url = editingMember
      ? `/api/thanhVienBch/${editingMember.id}`
      : "/api/thanhVienBch";
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
        alert(
          editingMember
            ? "Cập nhật thành viên BCH thành công!"
            : "Thêm thành viên BCH mới thành công!",
        );
        setShowMemberModal(false);
        loadBch();
      })
      .catch((err) => {
        console.error("Member save error:", err);
        alert("Có lỗi xảy ra khi lưu thông tin thành viên!");
      });
  };

  const handleDeleteMember = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thành viên BCH này không?")) {
      fetch(`/api/thanhVienBch/${id}`, {
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
            setMemberForm((prev) => ({ ...prev, anhDaiDien: data.url }));
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
      dataIndex: "hoTen",
      key: "hoTen",
      width: "25%",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Chức vụ",
      dataIndex: "chucVu",
      key: "chucVu",
      width: "25%",
      render: (chucVu) => (
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
          {getChucVuString(chucVu)}
        </span>
      ),
    },
    {
      title: "Email / SĐT",
      key: "contact",
      width: "25%",
      render: (_, record) => (
        <div style={{ fontSize: "0.85rem" }}>
          {record.soDienThoai && <div>📞 {record.soDienThoai}</div>}
          {record.email && <div>✉️ {record.email}</div>}
        </div>
      ),
    },
    {
      title: "Nhiệm vụ",
      dataIndex: "nhiemVu",
      key: "nhiemVu",
      width: "18%",
      render: (text) => <span style={{ fontSize: "0.85rem" }}>{text}</span>,
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
                <FormItem
                  label="Họ và tên"
                  type="text"
                  required
                  value={memberForm.hoTen}
                  onChange={(val) =>
                    setMemberForm({ ...memberForm, hoTen: val })
                  }
                />

                <FormItem
                  label="Chức danh / Chức vụ"
                  type="select"
                  required
                  value={memberForm.chucVu}
                  onChange={(val) =>
                    setMemberForm({ ...memberForm, chucVu: Number(val) })
                  }
                  options={positionOptions}
                />

                <div className="row" style={{ display: "flex", gap: "15px" }}>
                  <FormItem
                    label="Số điện thoại"
                    type="text"
                    required
                    value={memberForm.soDienThoai}
                    onChange={(val) =>
                      setMemberForm({ ...memberForm, soDienThoai: val })
                    }
                    style={{ flex: 1 }}
                  />
                  <FormItem
                    label="Email"
                    type="email"
                    required
                    value={memberForm.email}
                    onChange={(val) =>
                      setMemberForm({ ...memberForm, email: val })
                    }
                    style={{ flex: 1 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ảnh đại diện *</label>
                  <div
                    className="image-upload-wrapper"
                    style={{
                      display: "flex",
                      gap: "15px",
                      alignItems: "center",
                    }}
                  >
                    {memberForm.anhDaiDien ? (
                      <img
                        src={memberForm.anhDaiDien}
                        alt="Preview"
                        className="image-preview-thumbnail"
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid #cbd5e1",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "8px",
                          border: "1px dashed #cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f8fafc",
                          color: "#64748b",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          textAlign: "center",
                          padding: "4px",
                          lineHeight: "1.2",
                        }}
                      >
                        Chưa có ảnh
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <label
                          className="image-upload-btn-label"
                          style={{
                            margin: 0,
                            cursor: "pointer",
                            padding: "6px 12px",
                            border: "1px dashed var(--primary)",
                            borderRadius: "4px",
                            backgroundColor: "var(--primary-light)",
                            color: "var(--primary)",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Tải ảnh từ máy
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageUpload}
                          />
                        </label>
                        {memberForm.anhDaiDien &&
                          memberForm.anhDaiDien.startsWith("data:") && (
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                padding: "4px 10px",
                                fontSize: "0.75rem",
                                backgroundColor: "#fee2e2",
                                color: "#dc2626",
                                border: "1px solid #fca5a5",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setMemberForm({ ...memberForm, anhDaiDien: "" })
                              }
                            >
                              Xóa ảnh đã tải
                            </button>
                          )}
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Hoặc dán liên kết ảnh (URL) vào đây..."
                        style={{ width: "100%" }}
                        value={
                          memberForm.anhDaiDien &&
                          memberForm.anhDaiDien.startsWith("data:")
                            ? "[Ảnh đã tải từ máy tính]"
                            : memberForm.anhDaiDien
                        }
                        disabled={
                          memberForm.anhDaiDien &&
                          memberForm.anhDaiDien.startsWith("data:")
                        }
                        onChange={(e) =>
                          setMemberForm({
                            ...memberForm,
                            anhDaiDien: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <FormItem
                  label="Phân công nhiệm vụ / Trách nhiệm"
                  type="textarea"
                  rows="2"
                  placeholder="Ví dụ: Phụ trách chung, Chỉ đạo toàn diện công tác Đoàn và phong trào thanh thiếu nhi xã..."
                  value={memberForm.nhiemVu}
                  onChange={(val) =>
                    setMemberForm({ ...memberForm, nhiemVu: val })
                  }
                />
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
