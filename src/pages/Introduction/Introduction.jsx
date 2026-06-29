import React, { useEffect, useCallback } from "react";
import {
  Mail,
  Phone,
  ShieldCheck,
  Users,
  CalendarDays,
  Award,
} from "lucide-react";
import apiService from "src/services/apiService";
import { useApi } from "src/hooks/useApi";
import "./Introduction.css";

export default function Introduction() {
  const {
    data,
    loading,
    execute: loadIntro,
  } = useApi(useCallback(() => apiService.get("/api/intro"), []));

  useEffect(() => {
    loadIntro().catch((err) =>
      console.error("Failed to load introduction:", err),
    );
  }, [loadIntro]);

  if (loading) {
    return (
      <div className="global-loading-container">
        <div className="global-spinner"></div>
        <p>Đang tải thông tin giới thiệu...</p>
      </div>
    );
  }

  const settings = data?.settings || {
    historyContent: "",
    statMembers: "0",
    statBranches: "0",
    branchesContent: "",
  };

  const bchMembers = data?.bchMembers || [];
  const branches = data?.branches || [];

  // Group branches by groupName
  const groupedBranches = branches.reduce((acc, branch) => {
    const group = branch.groupName || "Chi đoàn khác";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(branch);
    return acc;
  }, {});

  return (
    <div className="intro-container container">
      <h1 className="section-title">Giới thiệu Đoàn xã Tam Anh</h1>

      {/* Stats Banner Row */}
      <div className="intro-stats-banner">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Users size={28} />
          </div>
          <span className="stat-num">{settings.statMembers}</span>
          <span className="stat-label">Đoàn viên sinh hoạt</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <CalendarDays size={28} />
          </div>
          <span className="stat-num">{settings.statBranches}</span>
          <span className="stat-label">Chi đoàn trực thuộc</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Award size={28} />
          </div>
          <span className="stat-num">2022 - 2027</span>
          <span className="stat-label">Nhiệm kỳ Ban Chấp hành</span>
        </div>
      </div>

      {/* Overview Intro */}
      <section className="intro-overview card">
        <div className="intro-text-content">
          <h2>Lịch sử & Sứ mệnh</h2>
          <div
            className="intro-history-content"
            dangerouslySetInnerHTML={{ __html: settings.historyContent }}
          />
          <div className="achievements-badges">
            <div className="achievement-item">
              <Award className="achieve-icon" />
              <span>
                Bằng khen Đơn vị Xuất sắc phong trào thi đua cấp Thành phố
              </span>
            </div>
            <div className="achievement-item">
              <ShieldCheck className="achieve-icon" />
              <span>
                Lực lượng nòng cốt trong công tác an sinh xã hội địa phương
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Organizational Structure */}
      {bchMembers.length > 0 && (
        <section className="bch-section">
          <h2 className="section-title">
            Ban Chấp hành đương nhiệm (Nhiệm kỳ 2022 - 2027)
          </h2>
          <p className="bch-intro-text">
            Ban Chấp hành Đoàn xã Tam Anh gồm các bạn cán bộ đoàn nhiệt
            huyết, có trình độ năng lực chuyên môn, luôn nỗ lực vì sự phát triển
            của công tác Đoàn và phong trào thanh thiếu nhi địa bàn.
          </p>
          <div className="bch-grid">
            {bchMembers.map((member) => (
              <div key={member.id} className="member-card card">
                <div className="member-avatar-wrapper">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="member-avatar"
                  />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <span className="member-position">{member.position}</span>
                  <p className="member-resp">{member.responsibility}</p>
                  <div className="member-contact">
                    <div className="contact-line">
                      <Phone size={14} />
                      <span>{member.phone}</span>
                    </div>
                    <div className="contact-line">
                      <Mail size={14} />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chi doan list */}
      {branches.length > 0 && (
        <section className="sub-units-section card">
          <h2>Hệ thống các Chi đoàn trực thuộc</h2>
          <div className="sub-units-grid">
            {Object.entries(groupedBranches).map(([groupName, groupList]) => (
              <div key={groupName} className="unit-category">
                <h3>{groupName}</h3>
                <ul>
                  {groupList.map((branch) => (
                    <li key={branch.id}>{branch.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
