import React, { useState } from "react";
import { Plus, Check, Edit, Trash2 } from "lucide-react";
import { Modal } from "../../../../components";

export default function BranchTypeModal({
  isOpen,
  onClose,
  branchTypes,
  onAddType,
  onUpdateType,
  onDeleteType,
}) {
  const [newTypeName, setNewTypeName] = useState("");
  const [editingType, setEditingType] = useState(null);
  const [editTypeName, setEditTypeName] = useState("");

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newTypeName.trim()) {
      onAddType(newTypeName.trim());
      setNewTypeName("");
    }
  };

  const handleUpdateClick = (id) => {
    if (editTypeName.trim()) {
      onUpdateType(id, editTypeName.trim());
      setEditingType(null);
      setEditTypeName("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý Phân loại Chi đoàn"
      maxWidth="600px"
      footer={
        <button
          type="button"
          className="btn btn-primary"
          onClick={onClose}
        >
          Đóng hộp thoại
        </button>
      }
    >
      {/* Form to add a new type */}
      <form
        onSubmit={handleAddSubmit}
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
                          onClick={() => handleUpdateClick(type.id)}
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
                        onClick={() => onDeleteType(type.id)}
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
  );
}
