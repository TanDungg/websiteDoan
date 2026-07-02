import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Phone, Mail, Clock, Download } from "lucide-react";
import { Table } from "../../../../components";
import { useRealtimeRefresh } from "../../../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";
import ExcelImportModal from "../ExcelImportModal/ExcelImportModal";
import MemberModal from "./MemberModal";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const loadData = () => {
    // Load members
    apiService.get("/api/doanVien")
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
        }
      })
      .catch((err) => console.error("Error fetching union members:", err));

    // Load branches for dropdown
    apiService.get("/api/gioiThieu")
      .then((data) => {
        if (data.branches) {
          setBranches(data.branches);
        }
      })
      .catch((err) => console.error("Error fetching branches:", err));
  };

  useRealtimeRefresh("doanVien", () => {
    loadData();
  });

  useRealtimeRefresh("chiDoan", () => {
    loadData();
  });

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenMemberModal = (member = null) => {
    setEditingMember(member);
    setShowMemberModal(true);
  };

  const handleSaveMember = (formData) => {
    if (!formData.chiDoanId) {
      alert("Bạn vui lòng chọn chi đoàn sinh hoạt!");
      return;
    }

    if (editingMember) {
      apiService.put(
        `/api/doanVien/${editingMember.id}`,
        formData,
        "Cập nhật thông tin đoàn viên thành công!"
      )
        .then(() => {
          setShowMemberModal(false);
          loadData();
        })
        .catch((err) => console.error("Member save error:", err));
    } else {
      apiService.post(
        "/api/doanVien",
        formData,
        true,
        "Tiếp nhận đoàn viên thành công!"
      )
        .then(() => {
          setShowMemberModal(false);
          loadData();
        })
        .catch((err) => console.error("Member save error:", err));
    }
  };

  const handleDeleteMember = (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa đoàn viên này ra khỏi hệ thống không?"
      )
    ) {
      apiService.delete(`/api/doanVien/${id}`, "Đã xóa đoàn viên thành công!")
        .then(() => {
          loadData();
        })
        .catch((err) => console.error("Delete member error:", err));
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
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => setShowImportModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={16} />
            <span>Import Excel</span>
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => handleOpenMemberModal()}
          >
            <Plus size={18} />
            <span>Thêm đoàn viên</span>
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={members}
        emptyMessage="Chưa có đoàn viên nào được thêm vào hệ thống."
      />

      <MemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        member={editingMember}
        branches={branches}
        onSave={handleSaveMember}
      />

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        type="members"
        branches={branches}
        onSuccess={loadData}
      />
    </div>
  );
}
