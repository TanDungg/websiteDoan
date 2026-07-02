import React from "react";
import { Trash2 } from "lucide-react";

export default function GopY({ feedbacks, onDeleteFeedback }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr;
      return dateObj.toLocaleString("vi-VN");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="panel-wrapper">
      <div className="panel-header">
        <h3>Hộp thư Ý kiến đóng góp</h3>
      </div>

      {feedbacks.length > 0 ? (
        <div className="feedback-list">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="feedback-item card">
              <div className="feedback-item-header">
                <h4>{fb.tieuDe}</h4>
                <div className="feedback-item-meta">
                  <span>{formatDate(fb.ngayGui)}</span>
                  <button
                    className="feedback-delete-btn"
                    title="Xóa ý kiến"
                    onClick={() => onDeleteFeedback(fb.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="feedback-sender-info">
                <strong>Người gửi:</strong> {fb.hoTen} ({fb.soDienThoai}){" "}
                {fb.email ? `| Email: ${fb.email}` : ""} |{" "}
                <strong>Chi đoàn:</strong> {fb.donVi}
              </div>
              <p className="feedback-content-text">{fb.noiDung}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card no-feedbacks-card">
          <p>Hộp thư phản hồi hiện đang trống.</p>
        </div>
      )}
    </div>
  );
}
