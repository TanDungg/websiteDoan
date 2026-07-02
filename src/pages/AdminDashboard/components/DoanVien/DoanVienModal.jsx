import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Modal, FormItem } from "../../../../components";

export default function DoanVienModal({ isOpen, onClose, member, branches, onSave }) {
  const [memberForm, setMemberForm] = useState({
    id: "",
    hoTen: "",
    ngaySinh: "",
    ngayVaoDoan: "",
    soDienThoai: "",
    email: "",
    chiDoanId: "",
    trangThai: "Đoàn viên",
  });

  useEffect(() => {
    if (isOpen) {
      if (member) {
        setMemberForm({
          id: member.id,
          hoTen: member.hoTen,
          ngaySinh: member.ngaySinh || "",
          ngayVaoDoan: member.ngayVaoDoan || "",
          soDienThoai: member.soDienThoai || "",
          email: member.email || "",
          chiDoanId: member.chiDoanId,
          trangThai: member.trangThai || "Đoàn viên",
        });
      } else {
        setMemberForm({
          id: "",
          hoTen: "",
          ngaySinh: "",
          ngayVaoDoan: "",
          soDienThoai: "",
          email: "",
          chiDoanId: "",
          trangThai: "Đoàn viên",
        });
      }
    }
  }, [isOpen, member]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(memberForm);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member ? "Cập nhật Hồ sơ Đoàn viên" : "Tiếp nhận Đoàn viên Mới"}
      maxWidth="600px"
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
            <span>{member ? "Cập nhật" : "Tiếp nhận"}</span>
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
          placeholder="Ví dụ: nguyenvana@gmail.com"
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
  );
}
