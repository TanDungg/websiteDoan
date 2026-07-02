import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Image, ArrowRight } from "lucide-react";

export default function ThuVienAnh({ galleryItems }) {
  const navigate = useNavigate();

  if (galleryItems.length === 0) return null;

  return (
    <section className="home-gallery-sec" style={{ marginTop: "30px" }}>
      <div
        className="showcase-section-header"
        style={{ marginBottom: "20px" }}
      >
        <Image size={20} className="header-icon-blue" />
        <h3 className="showcase-section-title">Thư viện hình ảnh</h3>
        <Link to="/thu-vien" className="showcase-more-link">
          Xem tất cả <ArrowRight size={14} />
        </Link>
      </div>
      <div className="home-gallery-grid">
        {galleryItems.slice(0, 4).map((g) => (
          <div
            key={g.id}
            className="home-gallery-item card"
            onClick={() => navigate("/thu-vien")}
          >
            <img
              src={g.imageUrl}
              alt={g.title}
              className="home-gallery-img"
            />
            <div className="home-gallery-overlay">
              <Image size={24} className="gallery-overlay-icon" />
              <p className="home-gallery-title">{g.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
