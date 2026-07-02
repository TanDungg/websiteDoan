import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Modal, FormItem } from "../../../../components";

export default function ThanhVienBchModal({ isOpen, onClose, member, positionOptions, onSave }) {
  const [memberForm, setMemberForm] = useState({
    id: "",
    hoTen: "",
    chucVu: 1,
    soDienThoai: "",
    email: "",
    anhDaiDien: "",
    nhiemVu: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (member) {
        setMemberForm({
          id: member.id,
          hoTen: member.hoTen,
          chucVu: Number(member.chucVu) || 1,
          soDienThoai: member.soDienThoai || "",
          email: member.email || "",
          anhDaiDien: member.anhDaiDien || "",
          nhiemVu: member.nhiemVu || "",
        });
      } else {
        setMemberForm({
          id: "",
          hoTen: "",
          chucVu: 3, // Default to member or secretary depending on typical default
          soDienThoai: "",
          email: "",
          anhDaiDien: "",
          nhiemVu: "",
        });
      }
    }
  }, [isOpen, member]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước tệp tối đa 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setMemberForm((prev) => ({
        ...prev,
        anhDaiDien: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(memberForm);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member ? "Sửa thành viên BCH" : "Thêm thành viên BCH"}
      maxWidth="550px"
      onSubmit={handleSubmit}
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button type="submit" className="btn btn-primary">
            <Check size={16} />
            <span>{member ? "Cập nhật" : "Thêm mới"}</span>
          </button>
        </>
      }
    >
      <FormItem
        label="Họ và tên"
        type="text"
        required
        value={memberForm.hoTen}
        onChange={(val) => setMemberForm({ ...memberForm, hoTen: val })}
      />

      <FormItem
        label="Chức danh / Chức vụ"
        type="select"
        required
        value={memberForm.chucVu}
        onChange={(val) => setMemberForm({ ...memberForm, chucVu: Number(val) })}
        options={positionOptions}
      />

      <div className="row" style={{ display: "flex", gap: "15px" }}>
        <FormItem
          label="Số điện thoại"
          type="text"
          required
          value={memberForm.soDienThoai}
          onChange={(val) => setMemberForm({ ...memberForm, soDienThoai: val })}
          style={{ flex: 1 }}
        />
        <FormItem
          label="Email"
          type="email"
          required
          value={memberForm.email}
          onChange={(val) => setMemberForm({ ...memberForm, email: val })}
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
              {memberForm.anhDaiDien && memberForm.anhDaiDien.startsWith("data:") && (
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
                  onClick={() => setMemberForm({ ...memberForm, anhDaiDien: "" })}
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
                memberForm.anhDaiDien && memberForm.anhDaiDien.startsWith("data:")
                  ? "[Ảnh đã tải từ máy tính]"
                  : memberForm.anhDaiDien
              }
              disabled={memberForm.anhDaiDien && memberForm.anhDaiDien.startsWith("data:")}
              onChange={(e) => setMemberForm({ ...memberForm, anhDaiDien: e.target.value })}
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
        onChange={(val) => setMemberForm({ ...memberForm, nhiemVu: val })}
      />
    </Modal>
  );
}
