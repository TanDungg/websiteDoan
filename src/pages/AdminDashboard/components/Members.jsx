import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check, Calendar, Phone, Mail, Clock } from "lucide-react";
import { Table, Modal, FormItem } from "../../../components";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    hoTen: "",
    ngaySinh: "",
    soDienThoai: "",
    email: "",
    chiDoanId: "",
    ngayVaoDoan: "",
    trangThai: "Đoàn viên",
  });

  const loadData = () => {
    // Load members
    fetch("/api/doanVien")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
        }
      })
      .catch((err) => console.error("Error fetching union members:", err));

    // Load branches for dropdown
    fetch("/api/gioiThieu")
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
        hoTen: member.hoTen || "",
        ngaySinh: member.ngaySinh || "",
        soDienThoai: member.soDienThoai || "",
        email: member.email || "",
        chiDoanId: member.chiDoanId || "",
        ngayVaoDoan: member.ngayVaoDoan || "",
        trangThai: member.trangThai || "Đoàn viên",
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        hoTen: "",
        ngaySinh: "",
        soDienThoai: "",
        email: "",
        chiDoanId: branches[0]?.id || "",
        ngayVaoDoan: new Date().toISOString().split("T")[0],
        trangThai: "Đoàn viên",
      });
    }
    setShowMemberModal(true);
  };

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    if (!memberForm.chiDoanId) {
      alert("Bạn vui lòng chọn chi đoàn sinh hoạt!");
      return;
    }

    const url = editingMember ? `/api/doanVien/${editingMember.id}` : "/api/doanVien";
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
        alert(editingMember ? "Cập nhật thông tin đoàn viên thành công!" : "Tiếp nhận đoàn viên thành công!");
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
        "Bạn có chắc chắn muốn xóa đoàn viên này ra khỏi hệ thống không?"
      )
    ) {
      fetch(`/api/doanVien/${id}`, {
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
      dataIndex: "hoTen",
      key: "hoTen",
      width: "25%",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Thông tin liên hệ",
      key: "contact",
      width: "25%",
      render: (_, record) => (
        <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "2px" }}>
          {record.ngaySinh && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={12} className="text-muted" /> {record.ngaySinh}
            </span>
          )}
          {record.soDienThoai && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Phone size={12} className="text-muted" /> {record.soDienThoai}
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
      dataIndex: "branchName",
      key: "branchName",
      width: "20%",
      render: (branchName) => (
        <span style={{ fontWeight: 500, color: "var(--text-main)" }}>
          {branchName || "Chưa phân phối"}
        </span>
      ),
    },
    {
      title: "Chức vụ",
      dataIndex: "trangThai",
      key: "trangThai",
      width: "15%",
      render: (status) => {
        let badgeBg = "#ebf8ff";
        let badgeColor = "#2b6cb0";

        if (status === "Bí thư") {
          badgeBg = "#fed7d7";
          badgeColor = "#c53030";
        } else if (status === "Phó Bí thư") {
          badgeBg = "#feebc8";
          badgeColor = "#c05621";
        } else if (status === "Ủy viên") {
          badgeBg = "#e2e8f0";
          badgeColor = "#4a5568";
        } else if (status === "Đoàn viên") {
          badgeBg = "#f0fff4";
          badgeColor = "#2f855a";
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
        const createDate = record.createdAt ? new Date(record.createdAt).toLocaleDateString("vi-VN") : "";
        return (
          <div
            style={{ fontSize: "0.75rem", color: "#718096" }}
            title={`Tạo bởi: ${record.createdBy || "n/a"}\nLúc: ${record.createdAt || "n/a"}\nSửa bởi: ${record.updatedBy || "n/a"}\nLúc: ${record.updatedAt || "n/a"}`}
          >
            <div>Tạo: {record.createdBy || "admin"}</div>
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
        <FormItem
          label="Họ và tên đoàn viên"
          type="text"
          required
          placeholder="Ví dụ: Nguyễn Văn A"
          value={memberForm.hoTen}
          onChange={(val) => setMemberForm({ ...memberForm, hoTen: val })}
        />

        <div style={{ display: "flex", gap: "15px" }}>
          <FormItem
            label="Ngày sinh"
            type="date"
            value={memberForm.ngaySinh}
            onChange={(val) => setMemberForm({ ...memberForm, ngaySinh: val })}
            style={{ flex: 1 }}
          />
          <FormItem
            label="Ngày vào Đoàn"
            type="date"
            value={memberForm.ngayVaoDoan}
            onChange={(val) => setMemberForm({ ...memberForm, ngayVaoDoan: val })}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", gap: "15px" }}>
          <FormItem
            label="Số điện thoại"
            type="text"
            placeholder="Ví dụ: 0905xxxxxx"
            value={memberForm.soDienThoai}
            onChange={(val) => setMemberForm({ ...memberForm, soDienThoai: val })}
            style={{ flex: 1 }}
          />
          <FormItem
            label="Email"
            type="email"
            placeholder="Vi dụ: nguyenvana@gmail.com"
            value={memberForm.email}
            onChange={(val) => setMemberForm({ ...memberForm, email: val })}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", gap: "15px" }}>
          <FormItem
            label="Chi đoàn sinh hoạt"
            type="select"
            required
            value={memberForm.chiDoanId}
            onChange={(val) => setMemberForm({ ...memberForm, chiDoanId: val })}
            options={[
              { value: "", label: "-- Chọn Chi đoàn --" },
              ...branches.map((b) => ({ value: b.id, label: b.tenChiDoan }))
            ]}
            style={{ flex: 1 }}
          />
          <FormItem
            label="Chức vụ"
            type="select"
            required
            value={memberForm.trangThai}
            onChange={(val) => setMemberForm({ ...memberForm, trangThai: val })}
            options={[
              { value: "Đoàn viên", label: "Đoàn viên" },
              { value: "Ủy viên", label: "Ủy viên" },
              { value: "Phó Bí thư", label: "Phó Bí thư" },
              { value: "Bí thư", label: "Bí thư" }
            ]}
            style={{ flex: 1 }}
          />
        </div>
      </Modal>
    </div>
  );
}
