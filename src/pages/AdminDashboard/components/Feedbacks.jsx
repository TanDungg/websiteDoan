import React from "react";
import { Trash2 } from "lucide-react";

export default function Feedbacks({ feedbacks, onDeleteFeedback }) {
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
                <h4>{fb.subject}</h4>
                <div className="feedback-item-meta">
                  <span>{fb.date}</span>
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
                <strong>Người gửi:</strong> {fb.fullName} ({fb.phone}){" "}
                {fb.email ? `| Email: ${fb.email}` : ""} |{" "}
                <strong>Chi đoàn:</strong> {fb.unit}
              </div>
              <p className="feedback-content-text">{fb.message}</p>
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
