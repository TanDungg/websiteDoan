import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
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
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => setGallery(data))
      .catch((err) => console.error("Error fetching admin gallery:", err));
  };

  useEffect(() => {
    loadGallery();
    return () => {
      // Clean up object URLs to prevent leaks
      selectedFiles.forEach((fileObj) =>
        URL.revokeObjectURL(fileObj.previewUrl),
      );
    };
  }, []);

  const handleGalleryFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = files.map((file) => {
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        base64Promise: new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
        }),
      };
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveSelectedFile = (idx) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[idx].previewUrl);
      updated.splice(idx, 1);
      return updated;
    });
  };

  const handleGalleryUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setUploadingGallery(true);

    try {
      const filesPayload = await Promise.all(
        selectedFiles.map(async (fileObj) => {
          const base64Data = await fileObj.base64Promise;
          return {
            fileData: base64Data,
            fileName: fileObj.file.name,
          };
        })
      );

      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: galleryTitle.trim(),
          files: filesPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Lỗi lưu hình ảnh thư viện");
      }

      alert("Đã đăng tải thành công tất cả hình ảnh lên thư viện!");
      setSelectedFiles([]);
      setGalleryTitle("");
      setShowGalleryModal(false);
      loadGallery();
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert("Có lỗi xảy ra khi tải lên thư viện!");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryItem = (id) => {
    if (
      window.confirm(
        "Đồng chí có chắc chắn muốn xóa album này và toàn bộ ảnh bên trong khỏi thư viện?",
      )
    ) {
      fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          loadGallery();
        })
        .catch((err) => {
          console.error("Delete gallery album error:", err);
          alert("Có lỗi xảy ra khi xóa album!");
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
          onClick={() => {
            setGalleryTitle("");
            setSelectedFiles([]);
            setShowGalleryModal(true);
          }}
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
                <div key={item.id} className="gallery-item-admin-card" style={{ position: "relative" }}>
                  <div 
                    style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden", cursor: "pointer" }}
                    onClick={() => openLightbox(item, 0)}
                  >
                    <img
                      src={item.images[0]?.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80"}
                      alt={item.title}
                      className="gallery-item-admin-img"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span className="gallery-photo-count-badge" style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      backgroundColor: "rgba(0, 0, 0, 0.75)",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "0.7rem",
                      fontWeight: "500",
                      zIndex: 1
                    }}>
                      {item.images.length} ảnh
                    </span>
                  </div>
                  <div className="gallery-item-admin-info">
                    <p 
                      className="gallery-item-admin-title" 
                      title={item.title}
                      style={{ cursor: "pointer" }}
                      onClick={() => openLightbox(item, 0)}
                    >
                      {item.title}
                    </p>
                    <div className="gallery-item-admin-actions">
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {item.date}
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

      {/* MODAL: ADD NEW PHOTOS */}
      {showGalleryModal && (
        <div className="modal-overlay">
          <div
            className="modal-container card animate-fade-in"
            style={{ maxWidth: "600px" }}
          >
            <div className="modal-header">
              <h3>Đăng tải hình ảnh mới</h3>
              <button
                className="modal-close"
                onClick={() => setShowGalleryModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: "15px",
                }}
              >
                Chọn một hoặc nhiều hình ảnh từ thiết bị để tải lên thư viện ảnh
                hoạt động.
              </p>

              <div className="form-group">
                <label className="form-label">
                  Tiêu đề chung cho bộ ảnh (Tùy chọn)
                </label>
                <input
                  type="text"
                  className="form-control gallery-title-input"
                  placeholder="Ví dụ: Lễ ra quân chiến dịch Hè tình nguyện 2026"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                />
              </div>

              <div
                className="upload-zone-card"
                onClick={() =>
                  document.getElementById("gallery-multi-upload").click()
                }
              >
                <div className="upload-icon-wrapper">
                  <Image size={28} />
                </div>
                <p className="upload-zone-title">
                  Click vào đây để chọn nhiều hình ảnh từ thiết bị
                </p>
                <p className="upload-zone-desc">
                  Hỗ trợ các định dạng: JPG, PNG, WEBP
                </p>
                <input
                  id="gallery-multi-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="file-input-hidden"
                  onChange={handleGalleryFilesSelect}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h5>Ảnh đã chọn ({selectedFiles.length})</h5>
                    <button
                      className="btn btn-sm btn-danger"
                      type="button"
                      onClick={() => setSelectedFiles([])}
                    >
                      Xóa tất cả
                    </button>
                  </div>

                  <div className="upload-previews-grid">
                    {selectedFiles.map((fileObj, idx) => (
                      <div key={idx} className="upload-preview-item">
                        <img src={fileObj.previewUrl} alt="Preview" />
                        <button
                          type="button"
                          className="remove-preview-btn"
                          onClick={() => handleRemoveSelectedFile(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowGalleryModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                className="btn btn-primary"
                type="button"
                disabled={uploadingGallery || selectedFiles.length === 0}
                onClick={handleGalleryUploadSubmit}
              >
                {uploadingGallery ? "Đang tải lên..." : "Bắt đầu đăng tải"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeAlbum !== null && lightboxIndex !== null && activeAlbum.images.length > 0 && (
        <div style={{
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
          padding: "20px"
        }} onClick={closeLightbox}>
          {/* Close button */}
          <button style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "8px"
          }} onClick={closeLightbox} aria-label="Close Lightbox">
            <X size={32} />
          </button>
          
          {/* Navigation Buttons */}
          {activeAlbum.images.length > 1 && (
            <>
              <button style={{
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
                cursor: "pointer"
              }} onClick={showPrev} aria-label="Previous Image">
                <ChevronLeft size={28} />
              </button>
              <button style={{
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
                cursor: "pointer"
              }} onClick={showNext} aria-label="Next Image">
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Content */}
          <div style={{
            backgroundColor: "#0f172a",
            borderRadius: "12px",
            overflow: "hidden",
            maxWidth: "800px",
            width: "100%",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            position: "relative"
          }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={activeAlbum.images[lightboxIndex].imageUrl} 
              alt={activeAlbum.title} 
              style={{
                maxWidth: "100%",
                maxHeight: "65vh",
                objectFit: "contain",
                margin: "0 auto"
              }}
            />
            <div style={{
              backgroundColor: "rgba(30, 41, 59, 0.9)",
              padding: "15px 20px",
              borderTop: "1px solid #334155",
              color: "#fff"
            }}>
              <h4 style={{ fontSize: "1rem", marginBottom: "4px", color: "#fff" }}>{activeAlbum.title}</h4>
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
