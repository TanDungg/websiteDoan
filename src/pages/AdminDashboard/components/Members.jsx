import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check, Calendar, Phone, Mail, Clock } from "lucide-react";
import { Table, Modal } from "../../../components";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: "",
    dob: "",
    phone: "",
    email: "",
    branchId: "",
    joinDate: "",
    status: "Sinh hoạt",
  });

  const loadData = () => {
    // Load members
    fetch("/api/union-members")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
        }
      })
      .catch((err) => console.error("Error fetching union members:", err));

    // Load branches for dropdown
    fetch("/api/intro")
      .then((res) => res.json())
      .then((data) => {
        if (data.branches) {
          setBranches(data.branches);
        }
      })
      .catch((err) => console.error("Error fetching branches:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenMemberModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({
        name: member.name || "",
        dob: member.dob || "",
        phone: member.phone || "",
        email: member.email || "",
        branchId: member.branch_id || "",
        joinDate: member.join_date || "",
        status: member.status || "Sinh hoạt",
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        name: "",
        dob: "",
        phone: "",
        email: "",
        branchId: branches[0]?.id || "",
        joinDate: new Date().toISOString().split("T")[0],
        status: "Sinh hoạt",
      });
    }
    setShowMemberModal(true);
  };

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    if (!memberForm.branchId) {
      alert("Đồng chí vui lòng chọn chi đoàn sinh hoạt!");
      return;
    }

    const url = editingMember ? `/api/union-members/${editingMember.id}` : "/api/union-members";
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
        loadData();
      })
      .catch((err) => {
        console.error("Member save error:", err);
        alert("Có lỗi xảy ra khi lưu thông tin đoàn viên!");
      });
  };

  const handleDeleteMember = (id) => {
    if (
      window.confirm(
        "Đồng chí có chắc chắn muốn xóa đoàn viên này ra khỏi hệ thống không?"
      )
    ) {
      fetch(`/api/union-members/${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          alert("Đã xóa đoàn viên thành công!");
          loadData();
        })
        .catch((err) => {
          console.error("Delete member error:", err);
          alert("Có lỗi xảy ra khi xóa đoàn viên!");
        });
    }
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      width: "25%",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Thông tin liên hệ",
      key: "contact",
      width: "25%",
      render: (_, record) => (
        <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "2px" }}>
          {record.dob && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={12} className="text-muted" /> {record.dob}
            </span>
          )}
          {record.phone && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Phone size={12} className="text-muted" /> {record.phone}
            </span>
          )}
          {record.email && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--primary)" }}>
              <Mail size={12} /> {record.email}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Chi đoàn",
      dataIndex: "branch_name",
      key: "branch_name",
      width: "20%",
      render: (branchName) => (
        <span style={{ fontWeight: 500, color: "var(--text-main)" }}>
          {branchName || "Chưa phân phối"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => {
        let badgeBg = "#ebf8ff";
        let badgeColor = "#2b6cb0";

        if (status === "Trưởng thành Đoàn") {
          badgeBg = "#f0fff4";
          badgeColor = "#2f855a";
        } else if (status === "Tạm vắng") {
          badgeBg = "#feebc8";
          badgeColor = "#c05621";
        } else if (status === "Đã chuyển sinh hoạt") {
          badgeBg = "#edf2f7";
          badgeColor = "#4a5568";
        }

        return (
          <span
            className="badge"
            style={{
              backgroundColor: badgeBg,
              color: badgeColor,
              fontSize: "0.75rem",
              padding: "4px 8px",
              borderRadius: "12px",
              fontWeight: 600,
            }}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "Nhật ký",
      key: "audit",
      width: "15%",
      render: (_, record) => {
        const createDate = record.created_at ? new Date(record.created_at).toLocaleDateString("vi-VN") : "";
        return (
          <div
            style={{ fontSize: "0.75rem", color: "#718096" }}
            title={`Tạo bởi: ${record.created_by || "n/a"}\nLúc: ${record.created_at || "n/a"}\nSửa bởi: ${record.updated_by || "n/a"}\nLúc: ${record.updated_at || "n/a"}`}
          >
            <div>Tạo: {record.created_by || "admin"}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
              <Clock size={10} /> {createDate || "Mới"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <div className="action-buttons-group">
          <button
            className="action-btn edit-btn"
            type="button"
            title="Sửa thông tin đoàn viên"
            onClick={() => handleOpenMemberModal(record)}
          >
            <Edit size={16} />
          </button>
          <button
            className="action-btn delete-btn"
            type="button"
            title="Xóa đoàn viên"
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
        <h3>Quản lý Hồ sơ Đoàn viên xã</h3>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => handleOpenMemberModal()}
        >
          <Plus size={18} />
          <span>Thêm đoàn viên</span>
        </button>
      </div>

      <Table
        columns={columns}
        data={members}
        emptyMessage="Chưa có đoàn viên nào được thêm vào hệ thống."
      />

      {/* MODAL: ADD/EDIT MEMBER */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title={editingMember ? "Cập nhật Hồ sơ Đoàn viên" : "Tiếp nhận Đoàn viên Mới"}
        maxWidth="600px"
        onSubmit={handleMemberSubmit}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowMemberModal(false)}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{editingMember ? "Cập nhật" : "Tiếp nhận"}</span>
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Họ và tên đoàn viên *</label>
          <input
            type="text"
            className="form-control"
            required
            value={memberForm.name}
            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
            placeholder="Ví dụ: Nguyễn Văn A"
          />
        </div>

        <div style={{ display: "flex", gap: "15px" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Ngày sinh</label>
            <input
              type="date"
              className="form-control"
              value={memberForm.dob}
              onChange={(e) => setMemberForm({ ...memberForm, dob: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Ngày vào Đoàn</label>
            <input
              type="date"
              className="form-control"
              value={memberForm.joinDate}
              onChange={(e) => setMemberForm({ ...memberForm, joinDate: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "15px" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Số điện thoại</label>
            <input
              type="text"
              className="form-control"
              value={memberForm.phone}
              onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
              placeholder="Ví dụ: 0905xxxxxx"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              placeholder="Vi dụ: nguyenvana@gmail.com"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "15px" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Chi đoàn sinh hoạt *</label>
            <select
              className="form-control"
              required
              value={memberForm.branchId}
              onChange={(e) => setMemberForm({ ...memberForm, branchId: e.target.value })}
            >
              <option value="" disabled>-- Chọn Chi đoàn --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Trạng thái sinh hoạt *</label>
            <select
              className="form-control"
              required
              value={memberForm.status}
              onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
            >
              <option value="Sinh hoạt">Sinh hoạt</option>
              <option value="Tạm vắng">Tạm vắng</option>
              <option value="Đã chuyển sinh hoạt">Đã chuyển sinh hoạt</option>
              <option value="Trưởng thành Đoàn">Trưởng thành Đoàn</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
