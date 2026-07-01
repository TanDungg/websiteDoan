import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { FormItem } from "src/components";
import { useRealtimeRefresh } from "../../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";

export default function Intro() {
  const [introSettings, setIntroSettings] = useState({
    lichSu: "",
    thongTinChiDoan: "",
  });

  const loadIntro = () => {
    apiService.get("/api/gioiThieu")
      .then((data) => {
        if (data.settings) {
          setIntroSettings({
            lichSu: data.settings.lichSu || "",
            thongTinChiDoan: data.settings.thongTinChiDoan || "",
          });
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
    apiService.put(
      "/api/gioiThieu",
      introSettings,
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
        <h3>Giới thiệu chi đoàn</h3>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <form onSubmit={handleIntroSettingsSubmit} className="admin-intro-form">
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

          <div style={{ textAlign: "right", marginTop: "15px" }}>
            <button type="submit" className="btn btn-primary">
              <Check size={16} style={{ marginRight: "6px" }} />
              <span>Cập nhật giới thiệu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
