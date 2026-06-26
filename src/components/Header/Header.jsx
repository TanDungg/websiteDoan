import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, ShieldAlert } from 'lucide-react';
import './Header.css';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="glass-nav header-container">
      <div className="container header-content">
        <Link to="/" className="logo-section" onClick={closeMenu}>
          <div className="logo-circle">
            {/* Youth union flag placeholder */}
            <span className="logo-symbol">🇻🇳</span>
          </div>
          <div className="logo-text">
            <span className="logo-sub">ĐOÀN TNCS HỒ CHÍ MINH</span>
            <span className="logo-main">ĐOÀN XÃ TAM ANH</span>
            <span className="logo-loc">TP. ĐÀ NẴNG</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="desktop-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Trang chủ
          </NavLink>
          <NavLink to="/gioi-thieu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Giới thiệu
          </NavLink>
          <NavLink to="/tin-tuc" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Tin tức
          </NavLink>
          <NavLink to="/van-ban" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Văn bản
          </NavLink>
          <NavLink to="/thu-vien" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Thư viện ảnh
          </NavLink>
          <NavLink to="/lien-he" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Liên hệ
          </NavLink>
          <Link to="/admin" className="admin-entry" title="Trang quản lý">
            <ShieldAlert size={18} />
          </Link>
        </nav>

        {/* Mobile menu trigger */}
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"} onClick={closeMenu}>
            Trang chủ
          </NavLink>
          <NavLink to="/gioi-thieu" className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"} onClick={closeMenu}>
            Giới thiệu
          </NavLink>
          <NavLink to="/tin-tuc" className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"} onClick={closeMenu}>
            Tin tức
          </NavLink>
          <NavLink to="/van-ban" className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"} onClick={closeMenu}>
            Văn bản
          </NavLink>
          <NavLink to="/thu-vien" className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"} onClick={closeMenu}>
            Thư viện ảnh
          </NavLink>
          <NavLink to="/lien-he" className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"} onClick={closeMenu}>
            Liên hệ
          </NavLink>
          <Link to="/admin" className="mobile-link admin-mobile-link" onClick={closeMenu}>
            Quản trị hệ thống
          </Link>
        </div>
      </div>
    </header>
  );
}
