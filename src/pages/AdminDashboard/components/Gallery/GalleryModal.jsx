import React, { useState, useEffect, useRef } from "react";
import { Image } from "lucide-react";
import { Modal, FormItem } from "../../../../components";
import apiService from "src/services/apiService";

export default function GalleryModal({ isOpen, onClose, onSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");

  const selectedFilesRef = useRef(selectedFiles);

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  useEffect(() => {
    if (isOpen) {
      setGalleryTitle("");
      setSelectedFiles([]);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      // Clean up object URLs to prevent leaks
      selectedFilesRef.current.forEach((fileObj) =>
        URL.revokeObjectURL(fileObj.previewUrl)
      );
    };
  }, []);

  const compressImage = (file, maxWidth, maxHeight, quality, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        callback(compressedBase64);
      };
    };
  };

  const handleGalleryFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = files.map((file) => {
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        base64Promise: new Promise((resolve) => {
          compressImage(file, 1000, 1000, 0.7, (compressedBase64) => {
            resolve(compressedBase64);
          });
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

  const handleGalleryUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (selectedFiles.length === 0) return;
    setUploadingGallery(true);

    try {
      const filesPayload = await Promise.all(
        selectedFiles.map(async (fileObj) => {
          const base64Data = await fileObj.base64Promise;
          return {
            duongDanAnh: base64Data,
            tenFile: fileObj.file.name,
          };
        })
      );

      await apiService.post(
        "/api/albumAnh",
        {
          tieuDe: galleryTitle.trim(),
          files: filesPayload,
        },
        true,
        "Đã đăng tải thành công tất cả hình ảnh lên thư viện!"
      );

      setSelectedFiles([]);
      setGalleryTitle("");
      onSuccess();
    } catch (err) {
      console.error("Gallery upload error:", err);
    } finally {
      setUploadingGallery(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đăng tải hình ảnh mới"
      maxWidth="600px"
      onSubmit={handleGalleryUploadSubmit}
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={uploadingGallery || selectedFiles.length === 0}
          >
            {uploadingGallery ? "Đang tải lên..." : "Bắt đầu đăng tải"}
          </button>
        </>
      }
    >
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          marginBottom: "15px",
        }}
      >
        Chọn một hoặc nhiều hình ảnh từ thiết bị để tải lên thư viện ảnh hoạt động.
      </p>

      <FormItem
        label="Tiêu đề chung cho bộ ảnh (Tùy chọn)"
        type="text"
        className="gallery-title-input"
        placeholder="Ví dụ: Lễ ra quân chiến dịch Hè tình nguyện 2026"
        value={galleryTitle}
        onChange={(val) => setGalleryTitle(val)}
      />

      <div
        className="upload-zone-card"
        onClick={() => document.getElementById("gallery-multi-upload").click()}
      >
        <div className="upload-icon-wrapper">
          <Image size={28} />
        </div>
        <p className="upload-zone-title">
          Click vào đây để chọn nhiều hình ảnh từ thiết bị
        </p>
        <p className="upload-zone-desc">Hỗ trợ các định dạng: JPG, PNG, WEBP</p>
        <input
          id="gallery-multi-upload"
          type="file"
          multiple
          accept="image/*"
          className="file-input-hidden"
          onChange={handleGalleryFilesSelect}
          style={{ display: "none" }}
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
    </Modal>
  );
}
