import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Modal, FormItem } from "../../../../components";

export default function ChiDoanModal({ isOpen, onClose, branch, branchTypes, onSave }) {
  const [branchForm, setBranchForm] = useState({
    tenChiDoan: "",
    loaiChiDoanId: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (branch) {
        setBranchForm({
          tenChiDoan: branch.tenChiDoan,
          loaiChiDoanId: branch.loaiChiDoanId || "",
        });
      } else {
        setBranchForm({
          tenChiDoan: "",
          loaiChiDoanId: "",
        });
      }
    }
  }, [isOpen, branch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(branchForm);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={branch ? "Sửa thông tin Chi đoàn" : "Thêm Chi đoàn trực thuộc"}
      maxWidth="500px"
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
            <span>{branch ? "Cập nhật" : "Thêm mới"}</span>
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
        onChange={(val) => setBranchForm({ ...branchForm, loaiChiDoanId: val })}
        options={[
          { value: "", label: "-- Chọn phân loại chi đoàn --" },
          ...branchTypes.map((type) => ({
            value: type.id,
            label: type.tenLoai,
          })),
        ]}
      />
    </Modal>
  );
}
