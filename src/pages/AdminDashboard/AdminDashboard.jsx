import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  FileText,
  MessageSquare,
  Users,
  Image,
  Building,
  Shield,
} from "lucide-react";
import Posts from "./components/Posts/Posts";
import Docs from "./components/Docs/Docs";
import Feedbacks from "./components/Feedbacks/Feedbacks";
import Intro from "./components/Intro/Intro";
import Branches from "./components/Branches/Branches";
import Bch from "./components/Bch/Bch";
import Gallery from "./components/Gallery/Gallery";
import Members from "./components/Members/Members";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import apiService from "src/services/apiService";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("tamanh_admin_active_tab") || "feedbacks",
  );

  // Parent state for feedbacks to sync badge count on sidebar
  const [feedbacks, setFeedbacks] = useState([]);

  // Setup realtime sync for feedbacks
  useRealtimeRefresh("gopY", () => {
    loadFeedbacks();
  });

  // Authenticate session
  useEffect(() => {
    const session = localStorage.getItem("tamanh_admin_session");
    if (session !== "active") {
      navigate("/admin");
    } else {
      loadFeedbacks();
    }
  }, [navigate]);

  // Persist active tab across page reloads
  useEffect(() => {
    localStorage.setItem("tamanh_admin_active_tab", activeTab);
  }, [activeTab]);

  const loadFeedbacks = () => {
    apiService.get("/api/gopY")
      .then((data) => setFeedbacks(data))
      .catch((err) => console.error("Error fetching feedbacks:", err));
  };

  const handleLogout = () => {
    localStorage.removeItem("tamanh_admin_session");
    navigate("/admin");
  };

  const handleDeleteFeedback = (id) => {
    if (window.confirm("Xóa ý kiến phản hồi này?")) {
      apiService.delete(`/api/gopY/${id}`, "Xóa ý kiến phản hồi thành công!")
        .then(() => {
          loadFeedbacks();
        })
        .catch((err) => {
          console.error("Delete feedback error:", err);
        });
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Dashboard Topbar */}
      <header className="admin-topbar">
        <div className="topbar-left">
          <h2>Trang Quản trị Đoàn xã Tam Anh</h2>
        </div>
        <div className="topbar-right">
          <span className="admin-badge">Admin</span>
          <button
            className="btn btn-danger btn-sm logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="admin-body">
        {/* Sidebar Nav */}
        <aside className="admin-sidebar">
          <nav className="admin-nav-menu">
            <button
              className={`admin-nav-item ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              <FileText size={18} />
              <span>Quản lý Bài viết</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === "docs" ? "active" : ""}`}
              onClick={() => setActiveTab("docs")}
            >
              <FileText size={18} />
              <span>Quản lý Văn bản</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === "feedbacks" ? "active" : ""}`}
              onClick={() => setActiveTab("feedbacks")}
            >
              <MessageSquare size={18} />
              <span>Hộp thư Phản hồi</span>
              {feedbacks.length > 0 && (
                <span className="feedback-count">{feedbacks.length}</span>
              )}
            </button>
            <button
              className={`admin-nav-item ${activeTab === "intro" ? "active" : ""}`}
              onClick={() => setActiveTab("intro")}
            >
              <Users size={18} />
              <span>Quản lý Giới thiệu</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === "branches" ? "active" : ""}`}
              onClick={() => setActiveTab("branches")}
            >
              <Building size={18} />
              <span>Quản lý Chi đoàn</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === "members" ? "active" : ""}`}
              onClick={() => setActiveTab("members")}
            >
              <Users size={18} />
              <span>Quản lý Đoàn viên</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === "bch" ? "active" : ""}`}
              onClick={() => setActiveTab("bch")}
            >
              <Shield size={18} />
              <span>Quản lý Ban Chấp hành</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === "gallery" ? "active" : ""}`}
              onClick={() => setActiveTab("gallery")}
            >
              <Image size={18} />
              <span>Quản lý Thư viện</span>
            </button>
          </nav>
        </aside>

        {/* Dynamic Panels */}
        <main className="admin-panel-content">
          {activeTab === "posts" && <Posts />}
          {activeTab === "docs" && <Docs />}
          {activeTab === "feedbacks" && (
            <Feedbacks
              feedbacks={feedbacks}
              onDeleteFeedback={handleDeleteFeedback}
            />
          )}
          {activeTab === "intro" && <Intro />}
          {activeTab === "branches" && <Branches />}
          {activeTab === "members" && <Members />}
          {activeTab === "bch" && <Bch />}
          {activeTab === "gallery" && <Gallery />}
        </main>
      </div>
    </div>
  );
}
