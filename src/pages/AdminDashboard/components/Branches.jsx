import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check } from "lucide-react";
import { Table, Modal } from "../../../components";

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    name: "",
    groupName: "",
    displayOrder: 1,
  });

  const loadBranches = () => {
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
    loadBranches();
  }, []);

  const handleOpenBranchModal = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({
        name: branch.name,
        groupName: branch.groupName,
        displayOrder: branch.displayOrder,
      });
    } else {
      setEditingBranch(null);
      setBranchForm({
        name: "",
        groupName: "",
        displayOrder: branches.length + 1,
      });
    }
    setShowBranchModal(true);
  };

  const handleBranchSubmit = (e) => {
    e.preventDefault();
    const url = editingBranch ? `/api/branches/${editingBranch.id}` : "/api/branches";
    const method = editingBranch ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(branchForm),
    })
      .then((res) => res.json())
      .then(() => {
        setShowBranchModal(false);
        loadBranches();
      })
      .catch((err) => {
        console.error("Branch save error:", err);
        alert("Có lỗi xảy ra khi lưu thông tin chi đoàn!");
      });
  };

  const handleDeleteBranch = (id) => {
    if (
      window.confirm(
        "Đồng chí có chắc chắn muốn xóa chi đoàn trực thuộc này không?",
      )
    ) {
      fetch(`/api/branches/${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          alert("Đã xóa chi đoàn thành công!");
          loadBranches();
        })
        .catch((err) => {
          console.error("Delete branch error:", err);
          alert("Có lỗi xảy ra khi xóa chi đoàn!");
        });
    }
  };

  const columns = [
    {
      title: "Tên chi đoàn",
      dataIndex: "name",
      key: "name",
      width: "45%",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Khối / Nhóm",
      dataIndex: "groupName",
      key: "groupName",
      width: "35%",
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
          {groupName}
        </span>
      ),
    },
    {
      title: "Thứ tự hiển thị",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: "10%",
      align: "center",
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
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => handleOpenBranchModal()}
        >
          <Plus size={18} />
          <span>Thêm chi đoàn</span>
        </button>
      </div>

      <Table
        columns={columns}
        data={branches}
        emptyMessage="Chưa có chi đoàn trực thuộc nào được thiết lập."
      />

      {/* MODAL: ADD/EDIT BRANCH */}
      <Modal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        title={editingBranch ? "Sửa thông tin Chi đoàn" : "Thêm Chi đoàn trực thuộc"}
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
        <div className="form-group">
          <label className="form-label">Tên chi đoàn *</label>
          <input
            type="text"
            className="form-control"
            required
            value={branchForm.name}
            onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
            placeholder="Ví dụ: Chi đoàn Thôn Tam Anh 1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Khối / Nhóm *</label>
          <input
            list="group-options"
            type="text"
            className="form-control"
            required
            value={branchForm.groupName}
            onChange={(e) =>
              setBranchForm({
                ...branchForm,
                groupName: e.target.value,
              })
            }
            placeholder="Nhập hoặc chọn khối/nhóm"
          />
          <datalist id="group-options">
            <option value="Chi đoàn Địa bàn Dân cư" />
            <option value="Chi đoàn Lực lượng vũ trang" />
            <option value="Chi đoàn Khối Trường học" />
            <option value="Chi đoàn Khối Cơ quan - Doanh nghiệp" />
          </datalist>
        </div>

        <div className="form-group">
          <label className="form-label">Thứ tự hiển thị *</label>
          <input
            type="number"
            className="form-control"
            required
            value={branchForm.displayOrder}
            onChange={(e) =>
              setBranchForm({
                ...branchForm,
                displayOrder: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
      </Modal>
    </div>
  );
}
