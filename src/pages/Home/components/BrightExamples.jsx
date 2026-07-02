import React from "react";
import { useNavigate } from "react-router-dom";
import { Award, ArrowRight } from "lucide-react";

export default function BrightExamples({ brightExamples, getCleanText }) {
  const navigate = useNavigate();

  return (
    <div className="showcase-block-card card" style={{ marginTop: "30px" }}>
      <div className="showcase-section-header">
        <Award size={20} className="header-icon-blue" />
        <h3 className="showcase-section-title">
          Gương sáng trẻ - Điển hình tiên tiến
        </h3>
        <button
          onClick={() => navigate("/tin-tuc?category=guong-sang")}
          className="showcase-more-link"
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
        >
          Xem tất cả <ArrowRight size={14} />
        </button>
      </div>
      <div className="showcase-block-content">
        {brightExamples.length > 0 ? (
          <div className="bright-examples-grid">
            {brightExamples.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="bright-example-card"
                onClick={() => navigate(`/tin-tuc/${item.id}`)}
              >
                <div className="example-avatar-holder">
                  {item.anhDaiDien ? (
                    <img
                      src={item.anhDaiDien}
                      alt={item.tieuDe}
                      className="example-avatar-img"
                    />
                  ) : null}
                </div>
                <div className="example-info">
                  <h4 className="example-name">{item.tieuDe}</h4>
                  <p className="example-summary">
                    {getCleanText(item.tomTat, 90)}
                  </p>
                  <span className="example-readmore">
                    Xem câu chuyện <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-category-posts">
            Chưa có bài viết nào trong chuyên mục này.
          </p>
        )}
      </div>
    </div>
  );
}
