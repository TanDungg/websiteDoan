import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import RichTextEditor from "../../../components/RichTextEditor/RichTextEditor";

export default function Intro() {
  const [introSettings, setIntroSettings] = useState({
    historyContent: "",
    statMembers: "",
    statBranches: "",
    branchesContent: "",
  });

  const loadIntro = () => {
    fetch("/api/intro")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setIntroSettings(data.settings);
        }
      })
      .catch((err) => console.error("Error fetching admin intro details:", err));
  };

  useEffect(() => {
    loadIntro();
  }, []);

  const handleIntroSettingsSubmit = (e) => {
    e.preventDefault();
    fetch("/api/intro", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(introSettings),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Cập nhật thông tin giới thiệu thành công!");
        loadIntro();
      })
      .catch((err) => {
        console.error("Intro settings save error:", err);
        alert("Có lỗi xảy ra khi lưu thông tin giới thiệu!");
      });
  };

  return (
    <div className="panel-wrapper">
      <div className="panel-header">
        <h3>Cấu hình Trang Giới thiệu</h3>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <form onSubmit={handleIntroSettingsSubmit} className="admin-intro-form">
          <div className="form-group">
            <label className="form-label">
              Lịch sử & Sứ mệnh (Trình soạn thảo trực quan) *
            </label>
            <RichTextEditor
              value={introSettings.historyContent}
              onChange={(val) =>
                setIntroSettings({
                  ...introSettings,
                  historyContent: val,
                })
              }
              placeholder="Nhập lịch sử hình thành, hoạt động..."
            />
          </div>

          <div
            className="row"
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "15px",
            }}
          >
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Số lượng đoàn viên *</label>
              <input
                type="text"
                className="form-control"
                required
                value={introSettings.statMembers}
                onChange={(e) =>
                  setIntroSettings({
                    ...introSettings,
                    statMembers: e.target.value,
                  })
                }
                placeholder="Ví dụ: 120"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">
                Số lượng chi đoàn trực thuộc *
              </label>
              <input
                type="text"
                className="form-control"
                required
                value={introSettings.statBranches}
                onChange={(e) =>
                  setIntroSettings({
                    ...introSettings,
                    statBranches: e.target.value,
                  })
                }
                placeholder="Ví dụ: 12"
              />
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: "15px" }}>
            <button type="submit" className="btn btn-primary">
              <Check size={16} style={{ marginRight: "6px" }} />
              <span>Cập nhật cấu hình chung</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
