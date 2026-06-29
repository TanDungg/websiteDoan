import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { FormItem } from "src/components";

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
      .catch((err) =>
        console.error("Error fetching admin intro details:", err),
      );
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
        <h3>Giới thiệu chi đoàn</h3>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <form onSubmit={handleIntroSettingsSubmit} className="admin-intro-form">
          <FormItem
            label=""
            type="editor"
            required
            value={introSettings.historyContent}
            onChange={(val) =>
              setIntroSettings({
                ...introSettings,
                historyContent: val,
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
