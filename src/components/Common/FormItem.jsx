import React from "react";
import RichTextEditor from "./RichTextEditor";

export default function FormItem({
  label,
  type = "text", // Kiểu nhập liệu: văn bản, mật khẩu, email, số, vùng văn bản, lựa chọn, trình soạn thảo, ngày
  required = false,
  value,
  onChange,
  placeholder,
  options = [], // Dành cho kiểu select: [{ value, label }]
  rows = 3, // Dành cho kiểu textarea
  style = {}, // Định dạng kiểu CSS tùy biến cho container bao ngoài
  className = "", // Class CSS bổ sung cho thẻ input
  requiredMark = false, // Nếu true, hiển thị dấu sao màu đỏ. (Thông thường CSS của label đã xử lý, thuộc tính này để điều khiển thủ công khi cần)
  ...restProps // Các thuộc tính thẻ input khác (disabled, min, max, v.v.)
}) {
  const renderContent = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            className={`form-control ${className}`}
            placeholder={placeholder}
            required={required}
            value={value !== undefined && value !== null ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            {...restProps}
          />
        );
      case "select":
        return (
          <select
            className={`form-control ${className}`}
            required={required}
            value={value !== undefined && value !== null ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            {...restProps}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "editor":
        return (
          <RichTextEditor
            value={value !== undefined && value !== null ? value : ""}
            onChange={onChange}
            placeholder={placeholder}
            {...restProps}
          />
        );
      default:
        // Mặc định cho kiểu: văn bản, số, mật khẩu, email, ngày, v.v.
        return (
          <input
            type={type}
            className={`form-control ${className}`}
            placeholder={placeholder}
            required={required}
            value={value !== undefined && value !== null ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            {...restProps}
          />
        );
    }
  };

  return (
    <div className="form-group" style={style}>
      {label && (
        <label className="form-label">
          {label}
          {required && requiredMark && (
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          )}
        </label>
      )}
      {renderContent()}
    </div>
  );
}
