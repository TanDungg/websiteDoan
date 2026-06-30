import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col info-col">
          <div className="footer-logo">
            <span className="footer-logo-symbol">🇻🇳</span>
            <h3>ĐOÀN XÃ TAM ANH</h3>
          </div>
          <p className="footer-desc">
            Trang thông tin điện tử chính thức của Đoàn TNCS Hồ Chí Minh xã Tam
            Anh, Thành phố Đà Nẵng. Nơi cập nhật các hoạt động, phong trào thanh
            thiếu nhi và văn bản chỉ đạo của Đoàn cấp trên.
          </p>
          <div className="contact-details">
            <div className="contact-item">
              <MapPin size={18} className="contact-icon" />
              <span>UBND xã Tam Anh, TP. Đà Nẵng</span>
            </div>
            <div className="contact-item">
              <Phone size={18} className="contact-icon" />
              <span>0236.3845.xxx</span>
            </div>
            <div className="contact-item">
              <Mail size={18} className="contact-icon" />
              <span>doantn.tamanh@danang.gov.vn</span>
            </div>
          </div>
        </div>

        <div className="footer-col links-col">
          <h4>Liên kết nhanh</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Trang chủ</Link>
            </li>
            <li>
              <Link to="/gioi-thieu">Giới thiệu BCH</Link>
            </li>
            <li>
              <Link to="/tin-tuc">Tin tức & Sự kiện</Link>
            </li>
            <li>
              <Link to="/van-ban">Văn bản - Kế hoạch</Link>
            </li>
            <li>
              <Link to="/thu-vien">Thư viện ảnh hoạt động</Link>
            </li>
            <li>
              <Link to="/lien-he">Liên hệ - Góp ý</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col partners-col">
          <h4>Trang thông tin liên kết</h4>
          <ul className="footer-links">
            <li>
              <a
                href="https://doanthanhnien.vn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe size={14} className="inline-icon" /> Trung ương Đoàn TNCS
                HCM
              </a>
            </li>
            <li>
              <a
                href="https://thanhdoandanang.org.vn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe size={14} className="inline-icon" /> Thành Đoàn Đà Nẵng
              </a>
            </li>
            <li>
              <a
                href="https://danang.gov.vn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe size={14} className="inline-icon" /> Cổng TTĐT TP. Đà
                Nẵng
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>
            &copy; {new Date().getFullYear()} Bản quyền thuộc về Ban Chấp hành
            Đoàn xã Tam Anh, TP. Đà Nẵng.
          </p>
          <p>Thiết kế bởi Tuổi trẻ Đoàn xã Tam Anh</p>
        </div>
      </div>
    </footer>
  );
}
