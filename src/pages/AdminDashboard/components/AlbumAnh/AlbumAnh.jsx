import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRealtimeRefresh } from "../../../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";
import AlbumAnhModal from "./AlbumAnhModal";

export default function AlbumAnh() {
  const [gallery, setGallery] = useState([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  const [activeAlbum, setActiveAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

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

  const loadGallery = () => {
    apiService
      .get("/api/albumAnh")
      .then((data) => setGallery(data))
      .catch((err) => console.error("Error fetching admin gallery:", err));
  };

  useRealtimeRefresh("albumAnh", () => {
    loadGallery();
  });

  useEffect(() => {
    loadGallery();
  }, []);

  const handleDeleteGalleryItem = (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa album này và toàn bộ ảnh bên trong khỏi thư viện?",
      )
    ) {
      apiService
        .delete(`/api/albumAnh/${id}`, "Xóa album thành công!")
        .then(() => {
          loadGallery();
        })
        .catch((err) => {
          console.error("Delete gallery album error:", err);
        });
    }
  };

  return (
    <div className="panel-wrapper">
      <div className="panel-header">
        <h3>Quản lý Thư viện ảnh</h3>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setShowGalleryModal(true)}
        >
          <Plus size={18} />
          <span>Đăng album mới</span>
        </button>
      </div>

      <div className="gallery-manager-wrapper">
        <div className="card" style={{ padding: "24px" }}>
          <h4 style={{ marginBottom: "20px" }}>
            Danh sách album hiện có ({gallery.length})
          </h4>
          {gallery.length > 0 ? (
            <div className="gallery-grid-admin">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="gallery-item-admin-card"
                  style={{ position: "relative" }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "4/3",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                    onClick={() => openLightbox(item, 0)}
                  >
                    <img
                      src={
                        item.images[0]?.duongDanAnh ||
                        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={item.tieuDe}
                      className="gallery-item-admin-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <span
                      className="gallery-photo-count-badge"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.7rem",
                        fontWeight: "500",
                        zIndex: 1,
                      }}
                    >
                      {item.images.length} ảnh
                    </span>
                  </div>
                  <div className="gallery-item-admin-info">
                    <p
                      className="gallery-item-admin-title"
                      title={item.tieuDe}
                      style={{ cursor: "pointer" }}
                      onClick={() => openLightbox(item, 0)}
                    >
                      {item.tieuDe}
                    </p>
                    <div className="gallery-item-admin-actions">
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {item.ngayTao}
                      </span>
                      <button
                        className="action-btn delete-btn"
                        type="button"
                        style={{ width: "28px", height: "28px" }}
                        title="Xóa album này"
                        onClick={() => handleDeleteGalleryItem(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                padding: "20px",
              }}
            >
              Thư viện ảnh hiện tại đang trống.
            </p>
          )}
        </div>
      </div>

      <AlbumAnhModal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        onSuccess={() => {
          setShowGalleryModal(false);
          loadGallery();
        }}
      />

      {/* Lightbox Modal */}
      {activeAlbum !== null &&
        lightboxIndex !== null &&
        activeAlbum.images.length > 0 && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: "8px",
              }}
              onClick={closeLightbox}
              aria-label="Close Lightbox"
            >
              <X size={32} />
            </button>

            {/* Navigation Buttons */}
            {activeAlbum.images.length > 1 && (
              <>
                <button
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    borderRadius: "50%",
                    width: "48px",
                    height: "48px",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={showPrev}
                  aria-label="Previous Image"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  style={{
                    position: "absolute",
                    right: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    borderRadius: "50%",
                    width: "48px",
                    height: "48px",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={showNext}
                  aria-label="Next Image"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* Content */}
            <div
              style={{
                backgroundColor: "#0f172a",
                borderRadius: "12px",
                overflow: "hidden",
                maxWidth: "800px",
                width: "100%",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeAlbum.images[lightboxIndex].duongDanAnh}
                alt={activeAlbum.tieuDe}
                style={{
                  maxWidth: "100%",
                  maxHeight: "65vh",
                  objectFit: "contain",
                  margin: "0 auto",
                }}
              />
              <div
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  padding: "15px 20px",
                  borderTop: "1px solid #334155",
                  color: "#fff",
                }}
              >
                <h4
                  style={{
                    fontSize: "1rem",
                    marginBottom: "4px",
                    color: "#fff",
                  }}
                >
                  {activeAlbum.tieuDe}
                </h4>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
                  Ảnh {lightboxIndex + 1} / {activeAlbum.images.length}
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
