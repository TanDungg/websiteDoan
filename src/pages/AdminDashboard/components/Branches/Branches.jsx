import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check, Settings, Download } from "lucide-react";
import { Table, Modal, FormItem } from "../../../../components";
import { useRealtimeRefresh } from "../../../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";
import ExcelImportModal from "../ExcelImportModal/ExcelImportModal";

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
  const [branchForm, setBranchForm] = useState({
    tenChiDoan: "",
    loaiChiDoanId: "",
  });

  const [newTypeName, setNewTypeName] = useState("");
  const [editingType, setEditingType] = useState(null);
  const [editTypeName, setEditTypeName] = useState("");

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
  const handleAddType = (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    apiService
      .post(
        "/api/loaiChiDoan",
        { tenLoai: newTypeName.trim() },
        true,
        "Thêm phân loại chi đoàn thành công!",
      )
      .then(() => {
        setNewTypeName("");
        loadData();
      })
      .catch((err) => console.error("Error adding branch type:", err));
  };

  const handleUpdateType = (id) => {
    if (!editTypeName.trim()) return;

    apiService
      .put(
        `/api/loaiChiDoan/${id}`,
        { tenLoai: editTypeName.trim() },
        "Cập nhật phân loại chi đoàn thành công!",
      )
      .then(() => {
        setEditingType(null);
        setEditTypeName("");
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
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({
        tenChiDoan: branch.tenChiDoan,
        loaiChiDoanId: branch.loaiChiDoanId || "",
      });
    } else {
      setEditingBranch(null);
      setBranchForm({
        tenChiDoan: "",
        loaiChiDoanId: branchTypes[0]?.id || "",
      });
    }
    setShowBranchModal(true);
  };

  const handleBranchSubmit = (e) => {
    e.preventDefault();
    if (!branchForm.loaiChiDoanId) {
      alert("Bạn vui lòng thiết lập phân loại cho chi đoàn này trước!");
      return;
    }

    if (editingBranch) {
      apiService
        .put(
          `/api/chiDoan/${editingBranch.id}`,
          branchForm,
          "Cập nhật chi đoàn thành công!",
        )
        .then(() => {
          setShowBranchModal(false);
          loadData();
        })
        .catch((err) => console.error("Branch save error:", err));
    } else {
      apiService
        .post("/api/chiDoan", branchForm, true, "Thêm chi đoàn mới thành công!")
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

      {/* MODAL: ADD/EDIT BRANCH */}
      <Modal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        title={
          editingBranch ? "Sửa thông tin Chi đoàn" : "Thêm Chi đoàn trực thuộc"
        }
        maxWidth="500px"
        onSubmit={handleBranchSubmit}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowBranchModal(false)}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{editingBranch ? "Cập nhật" : "Thêm mới"}</span>
            </button>
          </>
        }
      >
        <FormItem
          label="Tên chi đoàn"
          type="text"
          required
          placeholder="Ví dụ: Chi đoàn Thôn Tam Anh 1"
          value={branchForm.tenChiDoan}
          onChange={(val) => setBranchForm({ ...branchForm, tenChiDoan: val })}
        />

        <FormItem
          label="Phân loại Chi đoàn"
          type="select"
          required
          value={branchForm.loaiChiDoanId}
          onChange={(val) =>
            setBranchForm({ ...branchForm, loaiChiDoanId: val })
          }
          options={[
            { value: "", label: "-- Chọn phân loại chi đoàn --" },
            ...branchTypes.map((type) => ({
              value: type.id,
              label: type.tenLoai,
            })),
          ]}
        />
      </Modal>

      {/* MODAL: MANAGE BRANCH TYPES */}
      <Modal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        title="Quản lý Phân loại Chi đoàn"
        maxWidth="600px"
        footer={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowTypeModal(false)}
          >
            Đóng hộp thoại
          </button>
        }
      >
        {/* Form to add a new type */}
        <form
          onSubmit={handleAddType}
          style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
        >
          <input
            type="text"
            className="form-control"
            style={{ flex: 1 }}
            required
            placeholder="Tên phân loại mới (Ví dụ: Chi đoàn Khối Hành chính)"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ whiteSpace: "nowrap" }}
          >
            <Plus size={16} /> Thêm mới
          </button>
        </form>

        {/* List of current types */}
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
          }}
        >
          {branchTypes.length === 0 ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#a0aec0" }}
            >
              Chưa có phân loại nào. Hãy tạo phân loại đầu tiên ở trên!
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f7fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px 15px",
                      fontSize: "0.85rem",
                      color: "#4a5568",
                    }}
                  >
                    Tên Phân loại
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "10px 15px",
                      fontSize: "0.85rem",
                      color: "#4a5568",
                      width: "120px",
                    }}
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {branchTypes.map((type) => (
                  <tr
                    key={type.id}
                    style={{ borderBottom: "1px solid #e2e8f0" }}
                  >
                    <td style={{ padding: "10px 15px" }}>
                      {editingType?.id === type.id ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            type="text"
                            className="form-control"
                            style={{ height: "30px", fontSize: "0.9rem" }}
                            value={editTypeName}
                            onChange={(e) => setEditTypeName(e.target.value)}
                          />
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            style={{ padding: "4px" }}
                            onClick={() => handleUpdateType(type.id)}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 500 }}>{type.tenLoai}</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 15px", textAlign: "center" }}>
                      <div
                        className="action-buttons-group"
                        style={{ justifyContent: "center" }}
                      >
                        {editingType?.id !== type.id && (
                          <button
                            className="action-btn edit-btn"
                            type="button"
                            onClick={() => {
                              setEditingType(type);
                              setEditTypeName(type.tenLoai);
                            }}
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        <button
                          className="action-btn delete-btn"
                          type="button"
                          onClick={() => handleDeleteType(type.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>

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
