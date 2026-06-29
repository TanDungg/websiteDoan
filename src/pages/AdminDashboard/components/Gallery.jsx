import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image } from "lucide-react";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [showGalleryModal, setShowGalleryModal] = useState(false);

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
      const uploadPromises = selectedFiles.map(async (fileObj) => {
        const base64Data = await fileObj.base64Promise;
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: fileObj.file.name,
          }),
        });
        const uploadData = await uploadRes.json();

        if (uploadData.success) {
          const saveRes = await fetch("/api/gallery", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title:
                galleryTitle.trim() ||
                fileObj.file.name.replace(/\.[^/.]+$/, ""),
              imageUrl: uploadData.filePath || uploadData.url,
            }),
          });
          const saveData = await saveRes.json();
          if (!saveRes.ok) {
            throw new Error(saveData.error || "Lỗi lưu thư viện");
          }
        } else {
          throw new Error(uploadData.error || "Lỗi tải tệp lên máy chủ");
        }
      });

      await Promise.all(uploadPromises);

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
        "Đồng chí có chắc chắn muốn xóa hình ảnh này khỏi thư viện?",
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
          console.error("Delete gallery image error:", err);
          alert("Có lỗi xảy ra khi xóa hình ảnh!");
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
          <span>Đăng ảnh mới</span>
        </button>
      </div>

      <div className="gallery-manager-wrapper">
        <div className="card" style={{ padding: "24px" }}>
          <h4 style={{ marginBottom: "20px" }}>
            Danh sách ảnh hiện có ({gallery.length})
          </h4>
          {gallery.length > 0 ? (
            <div className="gallery-grid-admin">
              {gallery.map((item) => (
                <div key={item.id} className="gallery-item-admin-card">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="gallery-item-admin-img"
                  />
                  <div className="gallery-item-admin-info">
                    <p className="gallery-item-admin-title" title={item.title}>
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
                        title="Xóa ảnh này"
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
    </div>
  );
}
