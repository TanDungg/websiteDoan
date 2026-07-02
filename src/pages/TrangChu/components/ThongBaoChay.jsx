import React from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

export default function ThongBaoChay({ posts, formatDate }) {
  const notices = posts.filter((p) => p.danhMuc === "thong-bao");

  return (
    <section className="announcement-ticker-section">
      <div className="container ticker-container-capsule">
        <div className="ticker-badge-lead">
          <Bell size={16} className="ticker-badge-bell" />
          <span>Thông báo</span>
        </div>
        <div className="ticker-marquee-holder">
          {/* eslint-disable react/no-unknown-property */}
          <marquee
            className="ticker-marquee-text"
            scrollamount="4"
            onMouseOver={(e) => e.currentTarget.stop()}
            onMouseOut={(e) => e.currentTarget.start()}
          >
            {notices.length > 0 ? (
              notices.map((notice, idx) => (
                <span key={notice.id} className="ticker-marquee-item">
                  <Link to={`/tin-tuc/${notice.id}`}>
                    🔔 {notice.tieuDe} ({formatDate(notice.ngayDang)})
                  </Link>
                  {idx < notices.length - 1 && (
                    <span className="ticker-dot-split">•</span>
                  )}
                </span>
              ))
            ) : (
              <span className="ticker-marquee-item">
                Chào mừng các đồng chí đến với Trang thông tin điện tử Đoàn xã
                Tam Anh. Kính chúc các đồng chí nhiều sức khỏe, công tác tốt!
              </span>
            )}
          </marquee>
          {/* eslint-enable react/no-unknown-property */}
        </div>
      </div>
    </section>
  );
}
