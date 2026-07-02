import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  Phone,
  MessageSquare,
  Award,
  FileText,
  Users,
  Image,
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [biThuContact, setBiThuContact] = useState(null);
  const [stats, setStats] = useState({ online: 12, homNay: 0, tongCong: 0 });
  const navigate = useNavigate();

  useEffect(() => {

    fetch("/api/thongKe")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load statistics:", err));

    fetch("/api/gioiThieu")
      .then((res) => res.json())
      .then((data) => {
        if (data.bchMembers) {
          const biThu = data.bchMembers.find(
            (m) => Number(m.chucVu) === 1
          );
          if (biThu && biThu.soDienThoai) {
            setBiThuContact({
              name: biThu.hoTen,
              phone: biThu.soDienThoai,
            });
          }
        }
      })
      .catch((err) =>
        console.error("Failed to load intro for sidebar:", err),
      );
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/tin-tuc?search=${encodeURIComponent(searchTerm.trim())}`);
    }
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



      {/* Quick Access links */}
      <div className="sidebar-widget quick-links-widget card">
        <h4>Liên kết nội bộ</h4>
        <ul className="quick-links-list">
          <li>
            <Link to="/van-ban" className="quick-link-item">
              <FileText size={18} className="link-icon" />
              <span>Thư viện văn bản Đoàn</span>
              <ChevronRight size={14} className="arrow-icon" />
            </Link>
          </li>
          <li>
            <Link to="/gioi-thieu" className="quick-link-item">
              <Users size={18} className="link-icon" />
              <span>Sơ đồ tổ chức BCH</span>
              <ChevronRight size={14} className="arrow-icon" />
            </Link>
          </li>
          <li>
            <Link to="/thu-vien" className="quick-link-item">
              <Image size={18} className="link-icon" />
              <span>Thư viện đa phương tiện</span>
              <ChevronRight size={14} className="arrow-icon" />
            </Link>
          </li>
          <li>
            <Link to="/lien-he" className="quick-link-item">
              <MessageSquare size={18} className="link-icon" />
              <span>Gửi ý kiến đóng góp</span>
              <ChevronRight size={14} className="arrow-icon" />
            </Link>
          </li>
        </ul>
      </div>

      {/* Banner Links Widget */}
      <div className="sidebar-widget banner-links-widget">
        <a 
          href="https://hochiminh.vn" 
          target="_blank" 
          rel="noopener noreferrer"
          className="banner-link-card hoc-tap-bac"
        >
          <span className="banner-link-title">HỌC TẬP & LÀM THEO</span>
          <span className="banner-link-subtitle">Tấm gương đạo đức Hồ Chí Minh</span>
        </a>
        <a 
          href="https://dichvucong.gov.vn" 
          target="_blank" 
          rel="noopener noreferrer"
          className="banner-link-card dich-vu-cong"
        >
          <span className="banner-link-title">CỔNG DỊCH VỤ CÔNG</span>
          <span className="banner-link-subtitle">Hệ thống thông tin Quốc gia</span>
        </a>
      </div>

      {/* Access Statistics Widget */}
      <div className="sidebar-widget statistics-widget card">
        <h4>Thống kê truy cập</h4>
        <div className="stats-list">
          <div className="stat-row">
            <span className="stat-title">Đang trực tuyến:</span>
            <span className="stat-value">{stats.online}</span>
          </div>
          <div className="stat-row">
            <span className="stat-title">Hôm nay:</span>
            <span className="stat-value">{stats.homNay}</span>
          </div>
          <div className="stat-row">
            <span className="stat-title">Tổng lượt truy cập:</span>
            <span className="stat-value">{stats.tongCong}</span>
          </div>
        </div>
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
        {biThuContact?.phone ? (
          <a href={`tel:${biThuContact.phone.replace(/[^0-9+]/g, "")}`} className="hotline-number">
            <Phone size={20} />
            <span>{biThuContact.phone} (Bí thư)</span>
          </a>
        ) : null}
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
