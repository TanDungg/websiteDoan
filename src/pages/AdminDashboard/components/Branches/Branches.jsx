import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Settings, Download } from "lucide-react";
import { Table } from "../../../../components";
import { useRealtimeRefresh } from "../../../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";
import ExcelImportModal from "../ExcelImportModal/ExcelImportModal";
import BranchModal from "./BranchModal";
import BranchTypeModal from "./BranchTypeModal";

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [branchTypes, setBranchTypes] = useState([]);
  const [members, setMembers] = useState([]);

  // Modals visibility
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form states
  const [editingBranch, setEditingBranch] = useState(null);

  const loadData = () => {
    // Load branches
    apiService
      .get("/api/gioiThieu")
      .then((data) => {
        if (data.branches) {
          setBranches(data.branches);
        }
      })
      .catch((err) => console.error("Error fetching branches:", err));

    // Load branch types
    apiService
      .get("/api/loaiChiDoan")
      .then((data) => {
        if (Array.isArray(data)) {
          setBranchTypes(data);
        }
      })
      .catch((err) => console.error("Error fetching branch types:", err));

    // Load members to count dynamically
    apiService
      .get("/api/doanVien")
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
        }
      })
      .catch((err) => console.error("Error fetching union members:", err));
  };

  useRealtimeRefresh("chiDoan", () => {
    loadData();
  });

  useRealtimeRefresh("doanVien", () => {
    loadData();
  });

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Branch Types CRUD
  const handleAddType = (tenLoai) => {
    apiService
      .post(
        "/api/loaiChiDoan",
        { tenLoai },
        true,
        "Thêm phân loại chi đoàn thành công!",
      )
      .then(() => {
        loadData();
      })
      .catch((err) => console.error("Error adding branch type:", err));
  };

  const handleUpdateType = (id, tenLoai) => {
    apiService
      .put(
        `/api/loaiChiDoan/${id}`,
        { tenLoai },
        "Cập nhật phân loại chi đoàn thành công!",
      )
      .then(() => {
        loadData();
      })
      .catch((err) => console.error("Error updating branch type:", err));
  };

  const handleDeleteType = (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa phân loại này? Tất cả các chi đoàn thuộc phân loại này cũng sẽ bị ảnh hưởng!",
      )
    ) {
      apiService
        .delete(`/api/loaiChiDoan/${id}`, "Xóa phân loại chi đoàn thành công!")
        .then(() => {
          loadData();
        })
        .catch((err) => console.error("Error deleting branch type:", err));
    }
  };

  // Handlers for Branch CRUD
  const handleOpenBranchModal = (branch = null) => {
    setEditingBranch(branch);
    setShowBranchModal(true);
  };

  const handleBranchSubmit = (formData) => {
    if (!formData.loaiChiDoanId) {
      alert("Bạn vui lòng thiết lập phân loại cho chi đoàn này trước!");
      return;
    }

    if (editingBranch) {
      apiService
        .put(
          `/api/chiDoan/${editingBranch.id}`,
          formData,
          "Cập nhật chi đoàn thành công!",
        )
        .then(() => {
          setShowBranchModal(false);
          loadData();
        })
        .catch((err) => console.error("Branch save error:", err));
    } else {
      apiService
        .post("/api/chiDoan", formData, true, "Thêm chi đoàn mới thành công!")
        .then(() => {
          setShowBranchModal(false);
          loadData();
        })
        .catch((err) => console.error("Branch save error:", err));
    }
  };

  const handleDeleteBranch = (id) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa chi đoàn trực thuộc này không?")
    ) {
      apiService
        .delete(`/api/chiDoan/${id}`, "Đã xóa chi đoàn thành công!")
        .then(() => {
          loadData();
        })
        .catch((err) => console.error("Delete branch error:", err));
    }
  };

  // Columns for Branches table
  const columns = [
    {
      title: "Tên chi đoàn",
      dataIndex: "tenChiDoan",
      key: "tenChiDoan",
      width: "35%",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Phân loại Chi đoàn",
      dataIndex: "groupName",
      key: "groupName",
      width: "30%",
      render: (groupName) => (
        <span
          className="badge"
          style={{
            backgroundColor: "#e2e8f0",
            color: "#1a202c",
            fontSize: "0.8rem",
            padding: "3px 8px",
            borderRadius: "4px",
          }}
        >
          {groupName || "Chưa phân loại"}
        </span>
      ),
    },
    {
      title: "Số đoàn viên",
      key: "memberCount",
      width: "15%",
      align: "center",
      render: (_, record) => {
        const count = members.filter((m) => m.chiDoanId === record.id).length;
        return (
          <span style={{ fontWeight: 600, color: "var(--primary)" }}>
            {count}
          </span>
        );
      },
    },
    {
      title: "Nhật ký",
      key: "audit",
      width: "10%",
      render: (_, record) => {
        const createDate = record.createdAt
          ? new Date(record.createdAt).toLocaleDateString("vi-VN")
          : "";
        return (
          <span
            style={{ fontSize: "0.75rem", color: "#718096" }}
            title={`Người tạo: ${record.createdBy || "n/a"}\nLúc: ${record.createdAt || "n/a"}\nNgười sửa: ${record.updatedBy || "n/a"}\nLúc: ${record.updatedAt || "n/a"}`}
          >
            {record.createdBy || "admin"} ({createDate || "Mới"})
          </span>
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
            title="Sửa chi đoàn"
            onClick={() => handleOpenBranchModal(record)}
          >
            <Edit size={16} />
          </button>
          <button
            className="action-btn delete-btn"
            type="button"
            title="Xóa chi đoàn"
            onClick={() => handleDeleteBranch(record.id)}
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
        <h3>Hệ thống các Chi đoàn trực thuộc</h3>
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
            className="btn btn-outline"
            type="button"
            onClick={() => setShowTypeModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Settings size={16} />
            <span>Quản lý Phân loại</span>
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => handleOpenBranchModal()}
          >
            <Plus size={18} />
            <span>Thêm chi đoàn</span>
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={branches}
        height={"500px"}
        emptyMessage="Chưa có chi đoàn trực thuộc nào được thiết lập."
      />

      <BranchModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        branch={editingBranch}
        branchTypes={branchTypes}
        onSave={handleBranchSubmit}
      />

      <BranchTypeModal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        branchTypes={branchTypes}
        onAddType={handleAddType}
        onUpdateType={handleUpdateType}
        onDeleteType={handleDeleteType}
      />

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        type="branches"
        branchTypes={branchTypes}
        onSuccess={loadData}
      />
    </div>
  );
}
