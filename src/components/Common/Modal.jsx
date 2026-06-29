import React, { useEffect } from "react";

export default function Modal({
  isOpen = true,
  onClose,
  title,
  size = "md", // Các kích cỡ: sm, md, lg, xl
  maxWidth, // Chiều rộng tối đa tùy biến (ví dụ: '750px')
  children,
  footer,
  onSubmit, // Nếu được truyền vào, modal sẽ tự động bọc nội dung trong thẻ form
  className = "",
}) {
  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = size ? `modal-${size}` : "";
  const containerStyle = maxWidth ? { maxWidth } : {};

  // Đóng modal khi click vào vùng overlay bên ngoài (không click vào thân modal)
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay") && onClose) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className={`modal-container card animate-fade-in ${sizeClass} ${className}`}
      style={containerStyle}
    >
      <div className="modal-header">
        <h3>{title}</h3>
        {onClose && (
          <button className="modal-close" onClick={onClose} type="button">
            ×
          </button>
        )}
      </div>

      {onSubmit ? (
        <form onSubmit={onSubmit} className="modal-form">
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-actions">{footer}</div>}
        </form>
      ) : (
        <>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-actions">{footer}</div>}
        </>
      )}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      {modalContent}
    </div>
  );
}
