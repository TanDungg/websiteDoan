import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import { Table } from "../../../../components";
import { useRealtimeRefresh } from "../../../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";
import ExcelImportModal from "../ExcelImportModal/ExcelImportModal";
import BchMemberModal from "./BchMemberModal";

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
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const loadBch = () => {
    apiService.get("/api/gioiThieu")
      .then((data) => {
        if (data.bchMembers) {
          setBchMembers(data.bchMembers);
        }
      })
      .catch((err) => console.error("Error fetching bch members:", err));
  };

  useRealtimeRefresh("thanhVienBch", () => {
    loadBch();
  });

  useEffect(() => {
    loadBch();
  }, []);

  const handleOpenMemberModal = (member = null) => {
    setEditingMember(member);
    setShowMemberModal(true);
  };

  const handleSaveMember = (formData) => {
    if (!formData.anhDaiDien || !formData.anhDaiDien.trim()) {
      alert(
        "Bạn vui lòng tải lên hoặc dán liên kết ảnh đại diện cho thành viên BCH!",
      );
      return;
    }

    if (editingMember) {
      apiService.put(
        `/api/thanhVienBch/${editingMember.id}`,
        formData,
        "Cập nhật thành viên BCH thành công!"
      )
        .then(() => {
          setShowMemberModal(false);
          loadBch();
        })
        .catch((err) => console.error("Member save error:", err));
    } else {
      apiService.post(
        "/api/thanhVienBch",
        formData,
        true,
        "Thêm thành viên BCH mới thành công!"
      )
        .then(() => {
          setShowMemberModal(false);
          loadBch();
        })
        .catch((err) => console.error("Member save error:", err));
    }
  };

  const handleDeleteMember = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thành viên BCH này không?")) {
      apiService.delete(`/api/thanhVienBch/${id}`, "Đã xóa thành viên BCH thành công!")
        .then(() => {
          loadBch();
        })
        .catch((err) => {
          console.error("Delete member error:", err);
        });
    }
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
            <span>Thêm thành viên BCH</span>
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={bchMembers}
        emptyMessage="Chưa có thành viên BCH nào được thiết lập."
      />

      <BchMemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        member={editingMember}
        positionOptions={positionOptions}
        onSave={handleSaveMember}
      />

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        type="bch"
        onSuccess={loadBch}
      />
    </div>
  );
}
