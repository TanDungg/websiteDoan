import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  Phone,
  MessageSquare,
  Award,
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [recentPosts, setRecentPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setRecentPosts(data.slice(0, 3));
      })
      .catch((err) =>
        console.error("Failed to load recent posts for sidebar:", err),
      );
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/tin-tuc?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <aside className="sidebar-container">
      {/* Search Widget */}
      <div className="sidebar-widget search-widget card">
        <h4>Tìm kiếm tin tức</h4>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Nhập từ khóa tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="search-submit-btn"
            aria-label="Tìm kiếm"
          >
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Hot news list */}
      <div className="sidebar-widget recent-widget card">
        <h4>Tin mới cập nhật</h4>
        <div className="recent-posts-list">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <div
                key={post.id}
                className="recent-post-item"
                onClick={() => navigate(`/tin-tuc/${post.id}`)}
              >
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="recent-post-thumb"
                />
                <div className="recent-post-info">
                  <span className="recent-post-date">
                    {formatDate(post.date)}
                  </span>
                  <h5 className="recent-post-title">
                    <Link to={`/tin-tuc/${post.id}`}>{post.title}</Link>
                  </h5>
                </div>
              </div>
            ))
          ) : (
            <p
              className="no-recent-posts"
              style={{
                fontSize: "14px",
                color: "#666",
                textAlign: "center",
                margin: "20px 0",
              }}
            >
              Chưa có bài viết mới.
            </p>
          )}
        </div>
      </div>

      {/* Quick Access links */}
      <div className="sidebar-widget quick-links-widget card">
        <h4>Liên kết nội bộ</h4>
        <ul className="quick-links-list">
          <li>
            <Link to="/van-ban">
              <ChevronRight size={16} />
              <span>Thư viện văn bản Đoàn</span>
            </Link>
          </li>
          <li>
            <Link to="/gioi-thieu">
              <ChevronRight size={16} />
              <span>Sơ đồ tổ chức BCH</span>
            </Link>
          </li>
          <li>
            <Link to="/thu-vien">
              <ChevronRight size={16} />
              <span>Thư viện đa phương tiện</span>
            </Link>
          </li>
          <li>
            <Link to="/lien-he">
              <ChevronRight size={16} />
              <span>Gửi ý kiến đóng góp</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Contact Hotline box */}
      <div className="sidebar-widget support-widget card">
        <div className="support-header">
          <Award size={24} className="support-badge-icon" />
          <h5>ĐƯỜNG DÂY NÓNG</h5>
        </div>
        <p className="support-text">
          Mọi phản ánh, đề xuất hoạt động của đoàn viên thanh niên và nhân dân
          vui lòng liên hệ trực tiếp:
        </p>
        <div className="hotline-number">
          <Phone size={20} />
          <span>0905.123.xxx (Bí thư)</span>
        </div>
        <div className="support-action">
          <Link to="/lien-he" className="btn btn-primary btn-sm support-btn">
            <MessageSquare size={16} />
            <span>Gửi góp ý trực tuyến</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
