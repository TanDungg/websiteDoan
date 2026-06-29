import React, { useState, useEffect } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight, Image } from "lucide-react";
import "./Gallery.css";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        setGallery(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading gallery:", err);
        setLoading(false);
      });
  }, []);

  const openLightbox = (album, index) => {
    setActiveAlbum(album);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setActiveAlbum(null);
    setLightboxIndex(null);
  };

  const showPrev = (e) => {
    e.stopPropagation();
    if (!activeAlbum || activeAlbum.images.length === 0) return;
    setLightboxIndex(
      (prev) =>
        (prev - 1 + activeAlbum.images.length) % activeAlbum.images.length,
    );
  };

  const showNext = (e) => {
    e.stopPropagation();
    if (!activeAlbum || activeAlbum.images.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % activeAlbum.images.length);
  };

  return (
    <div className="gallery-page container">
      <h1 className="section-title">Thư viện ảnh Hoạt động</h1>
      <p className="gallery-intro">
        Tổng hợp hình ảnh và khoảnh khắc đẹp từ các chương trình thanh niên tình
        nguyện, giải đấu thể thao, hoạt động văn nghệ xã hội và bảo vệ môi
        trường của Đoàn xã Tam Anh.
      </p>

      {loading ? (
        <div className="gallery-loading-container">
          <div className="gallery-spinner"></div>
          <p>Đang tải hình ảnh từ thư viện...</p>
        </div>
      ) : gallery.length > 0 ? (
        /* Gallery Grid */
        <div className="gallery-grid">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="gallery-card card interactive"
              onClick={() => openLightbox(item, 0)}
            >
              <div className="gallery-img-wrapper">
                <img
                  src={
                    item.images[0]?.imageUrl ||
                    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={item.title}
                  className="gallery-img"
                  loading="lazy"
                />
                <span className="gallery-photo-count-badge">
                  {item.images.length} ảnh
                </span>
                <div className="gallery-hover-overlay">
                  <ZoomIn size={28} className="zoom-icon" />
                  <span className="view-text">Xem album</span>
                </div>
              </div>
              <div className="gallery-title-box">
                <Image size={16} className="gallery-title-icon" />
                <h3 className="gallery-card-title">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            backgroundColor: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            color: "var(--text-muted)",
          }}
        >
          <p>Chưa có hình ảnh hoạt động nào được đăng tải trong thư viện.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeAlbum !== null &&
        lightboxIndex !== null &&
        activeAlbum.images.length > 0 && (
          <div className="lightbox-overlay" onClick={closeLightbox}>
            <button
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Close Lightbox"
            >
              <X size={32} />
            </button>

            {activeAlbum.images.length > 1 && (
              <>
                <button
                  className="lightbox-nav-btn nav-left"
                  onClick={showPrev}
                  aria-label="Previous Image"
                >
                  <ChevronLeft size={36} />
                </button>
                <button
                  className="lightbox-nav-btn nav-right"
                  onClick={showNext}
                  aria-label="Next Image"
                >
                  <ChevronRight size={36} />
                </button>
              </>
            )}

            <div
              className="lightbox-content-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeAlbum.images[lightboxIndex].imageUrl}
                alt={activeAlbum.title}
                className="lightbox-image animate-fade-in"
              />
              <div className="lightbox-caption">
                <h3>{activeAlbum.title}</h3>
                <p>
                  Ảnh {lightboxIndex + 1} / {activeAlbum.images.length}
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
