import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Modal, FormItem } from "../../../../components";

export default function DocModal({ isOpen, onClose, onSave }) {
  const [docForm, setDocForm] = useState({
    soHieu: "",
    tenVanBan: "",
    loaiVanBan: "Kế hoạch",
  });

  useEffect(() => {
    if (isOpen) {
      setDocForm({
        soHieu: "",
        tenVanBan: "",
        loaiVanBan: "Kế hoạch",
      });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(docForm);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm văn bản - Tài liệu"
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
            <span>Thêm văn bản</span>
          </button>
        </>
      }
    >
      <FormItem
        label="Số hiệu văn bản"
        type="text"
        required
        placeholder="Ví dụ: 15-KH/ĐTN-TA"
        value={docForm.soHieu}
        onChange={(val) => setDocForm({ ...docForm, soHieu: val })}
      />

      <FormItem
        label="Tên văn bản / Tài liệu"
        type="text"
        required
        value={docForm.tenVanBan}
        onChange={(val) => setDocForm({ ...docForm, tenVanBan: val })}
      />

      <FormItem
        label="Thể loại"
        type="select"
        required
        value={docForm.loaiVanBan}
        onChange={(val) => setDocForm({ ...docForm, loaiVanBan: val })}
        options={[
          { value: "Kế hoạch", label: "Kế hoạch" },
          { value: "Nghị quyết", label: "Nghị quyết" },
          { value: "Quyết định", label: "Quyết định" },
          { value: "Hướng dẫn", label: "Hướng dẫn" },
        ]}
      />
    </Modal>
  );
}
