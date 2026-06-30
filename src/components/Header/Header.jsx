import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X, ShieldAlert } from "lucide-react";
import "./Header.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="header-portal-container">
      {/* Top Banner Section */}
      <div className="header-banner">
        <div className="container banner-content">
          <Link to="/" className="banner-logo-link">
            <div className="banner-emblem">
              <img
                src="https://upload.wikimedia.org/wikipedia/vi/0/09/Huy_Hi%E1%BB%87u_%C4%90o%C3%A0n.png"
                alt="Huy hiệu Đoàn"
                className="emblem-img"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div className="banner-text">
              <h1 className="banner-title-top">TRANG THÔNG TIN ĐIỆN TỬ</h1>
              <h2 className="banner-title-bottom">
                ĐOÀN TNCS HỒ CHÍ MINH - XÃ TAM ANH
              </h2>
              <span className="banner-location">TP. ĐÀ NẴNG</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation Menu Bar Section */}
      <div className="header-nav-bar">
        <div className="container nav-bar-content">
          {/* Mobile Logo Brand (visible only when collapsed/scrolled on mobile) */}
          <Link to="/" className="mobile-brand-link" onClick={closeMenu}>
            <span className="mobile-brand-symbol">🇻🇳</span>
            <span className="mobile-brand-text">ĐOÀN XÃ TAM ANH</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="desktop-nav">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/gioi-thieu"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Giới thiệu
            </NavLink>
            <NavLink
              to="/tin-tuc"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Tin tức
            </NavLink>
            <NavLink
              to="/van-ban"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Văn bản
            </NavLink>
            <NavLink
              to="/thu-vien"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Thư viện ảnh
            </NavLink>
            <NavLink
              to="/lien-he"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Liên hệ
            </NavLink>
            <Link to="/admin" className="admin-entry" title="Trang quản lý">
              <ShieldAlert size={18} />
            </Link>
          </nav>

          {/* Mobile menu trigger */}
          <button
            className="mobile-menu-btn"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu - moved inside header-nav-bar for absolute positioning */}
        <div className={`mobile-nav ${isOpen ? "open" : ""}`}>
          <div className="mobile-nav-links">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "mobile-link active" : "mobile-link"
              }
              onClick={closeMenu}
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/gioi-thieu"
              className={({ isActive }) =>
                isActive ? "mobile-link active" : "mobile-link"
              }
              onClick={closeMenu}
            >
              Giới thiệu
            </NavLink>
            <NavLink
              to="/tin-tuc"
              className={({ isActive }) =>
                isActive ? "mobile-link active" : "mobile-link"
              }
              onClick={closeMenu}
            >
              Tin tức
            </NavLink>
            <NavLink
              to="/van-ban"
              className={({ isActive }) =>
                isActive ? "mobile-link active" : "mobile-link"
              }
              onClick={closeMenu}
            >
              Văn bản
            </NavLink>
            <NavLink
              to="/thu-vien"
              className={({ isActive }) =>
                isActive ? "mobile-link active" : "mobile-link"
              }
              onClick={closeMenu}
            >
              Thư viện ảnh
            </NavLink>
            <NavLink
              to="/lien-he"
              className={({ isActive }) =>
                isActive ? "mobile-link active" : "mobile-link"
              }
              onClick={closeMenu}
            >
              Liên hệ
            </NavLink>
            <Link
              to="/admin"
              className="mobile-link admin-mobile-link"
              onClick={closeMenu}
            >
              Quản trị hệ thống
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
