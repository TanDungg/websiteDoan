import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { FormItem } from "src/components";
import { useRealtimeRefresh } from "../../../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";

export default function Intro() {
  const [introSettings, setIntroSettings] = useState({
    lichSu: "",
    thongTinChiDoan: "",
  });
  const [congressTitle, setCongressTitle] = useState("");
  const [congressSlogan, setCongressSlogan] = useState("");

  const loadIntro = () => {
    apiService.get("/api/gioiThieu")
      .then((data) => {
        if (data.settings) {
          setIntroSettings({
            lichSu: data.settings.lichSu || "",
            thongTinChiDoan: data.settings.thongTinChiDoan || "",
          });
          const raw = data.settings.thongTinChiDoan || "";
          if (raw.includes("|")) {
            const parts = raw.split("|");
            setCongressTitle(parts[0]?.trim() || "");
            setCongressSlogan(parts[1]?.trim() || "");
          } else {
            setCongressTitle(raw || "");
            setCongressSlogan("");
          }
        }
      })
      .catch((err) =>
        console.error("Error fetching admin intro details:", err),
      );
  };

  useRealtimeRefresh("gioiThieu", () => {
    loadIntro();
  });

  useEffect(() => {
    loadIntro();
  }, []);

  const handleIntroSettingsSubmit = (e) => {
    e.preventDefault();
    const payload = {
      lichSu: introSettings.lichSu,
      thongTinChiDoan: `${congressTitle} | ${congressSlogan}`,
    };
    apiService.put(
      "/api/gioiThieu",
      payload,
      "Cập nhật thông tin giới thiệu thành công!"
    )
      .then(() => {
        loadIntro();
      })
      .catch((err) => {
        console.error("Intro settings save error:", err);
      });
  };

  return (
    <div className="panel-wrapper">
      <div className="panel-header">
        <h3>Giới thiệu & Cấu hình Trang chủ</h3>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <form onSubmit={handleIntroSettingsSubmit} className="admin-intro-form">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <FormItem
              label="Tiêu đề Banner Đại hội"
              required
              value={congressTitle}
              onChange={(e) => setCongressTitle(e.target.value)}
              placeholder="Ví dụ: HƯỚNG TỚI ĐẠI HỘI ĐẠI BIỂU TOÀN QUỐC ĐOÀN TNCS HỒ CHÍ MINH LẦN THỨ XIV, NHIỆM KỲ 2027 - 2032"
            />
            <FormItem
              label="Khẩu hiệu Đại hội (Slogan)"
              required
              value={congressSlogan}
              onChange={(e) => setCongressSlogan(e.target.value)}
              placeholder="Ví dụ: Tuổi trẻ Tam Anh: Tiên phong - Bản lĩnh - Đoàn kết - Sáng tạo - Phát triển"
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label className="form-label" style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
              Nội dung giới thiệu lịch sử Chi đoàn
            </label>
            <FormItem
              label=""
              type="editor"
              required
              value={introSettings.lichSu}
              onChange={(val) =>
                setIntroSettings({
                  ...introSettings,
                  lichSu: val,
                })
              }
              placeholder="Nhập giới thiệu..."
            />
          </div>

          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <button type="submit" className="btn btn-primary">
              <Check size={16} style={{ marginRight: "6px" }} />
              <span>Cập nhật cấu hình</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
