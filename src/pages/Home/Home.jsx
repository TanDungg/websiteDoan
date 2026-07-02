import React, { useEffect, useCallback } from "react";
import { BookOpen, Flag } from "lucide-react";
import apiService from "src/services/apiService";
import { useApi } from "src/hooks/useApi";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import Sidebar from "../../components/Sidebar/Sidebar";
import { newsCategories } from "../../data/mockData";
import "./Home.css";

// Subcomponents
import AnnouncementTicker from "./components/AnnouncementTicker";
import HeroGrid from "./components/HeroGrid";
import ShowcaseCategory from "./components/ShowcaseCategory";
import CongressBanner from "./components/CongressBanner";
import BrightExamples from "./components/BrightExamples";
import HomeGallery from "./components/HomeGallery";
import MovementsPrograms from "./components/MovementsPrograms";

const getCleanText = (text, maxLength = 120) => {
  if (!text) return "";
  let cleaned = text.trim();

  // Detect JSON
  if (cleaned.startsWith("{") || cleaned.startsWith("[")) {
    try {
      const parsed = JSON.parse(cleaned);
      const textParts = [];
      const extractText = (val) => {
        if (typeof val === "string") {
          if (val.length > 5 && !val.match(/^[a-f0-9-]{36}$/i)) {
            textParts.push(val);
          }
        } else if (Array.isArray(val)) {
          val.forEach(extractText);
        } else if (val && typeof val === "object") {
          Object.values(val).forEach(extractText);
        }
      };
      extractText(parsed);
      if (textParts.length > 0) {
        cleaned = textParts.join(" ");
      }
    } catch (e) {
      // ignore
    }
  }

  cleaned = cleaned.replace(/<[^>]*>/g, "");
  cleaned = cleaned.replace(/[{}"[\]]/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  if (cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength) + "...";
  }
  return cleaned;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export default function Home() {
  const {
    data: postsData,
    loading: postsLoading,
    execute: loadPosts,
  } = useApi(useCallback(() => apiService.get("/api/baiViet"), []));

  const {
    data: galleryData,
    loading: galleryLoading,
    execute: loadGallery,
  } = useApi(useCallback(() => apiService.get("/api/albumAnh"), []));

  const {
    data: introData,
    loading: introLoading,
    execute: loadIntro,
  } = useApi(useCallback(() => apiService.get("/api/gioiThieu"), []));

  const posts = postsData || [];
  const gallery = galleryData || [];

  useRealtimeRefresh("baiViet", () => {
    loadPosts({ silent: true }).catch((err) =>
      console.error("Failed to load posts:", err),
    );
  });

  useRealtimeRefresh("albumAnh", () => {
    loadGallery({ silent: true }).catch((err) =>
      console.error("Failed to load gallery:", err),
    );
  });

  useRealtimeRefresh("gioiThieu", () => {
    loadIntro({ silent: true }).catch((err) =>
      console.error("Failed to load intro:", err),
    );
  });

  useEffect(() => {
    loadPosts().catch((err) => console.error("Failed to load posts:", err));
    loadGallery().catch((err) => console.error("Failed to load gallery:", err));
    loadIntro().catch((err) => console.error("Failed to load intro:", err));
  }, [loadPosts, loadGallery, loadIntro]);

  const hotNews = posts.filter((n) => n.tinNoiBat);

  // Sort posts for Tabs
  const latestPosts = [...posts]
    .sort((a, b) => new Date(b.ngayDang) - new Date(a.ngayDang))
    .slice(0, 5);
  const popularPosts = [...posts]
    .sort((a, b) => (b.luotXem || 0) - (a.luotXem || 0))
    .slice(0, 5);

  // Categories News
  const activityNews = posts.filter(
    (n) => n.danhMuc === "hoat-dong" || n.danhMuc === "tin-dia-phuong",
  );
  const charityNews = posts.filter((n) => n.danhMuc === "tu-thien");
  const brightExamples = posts.filter((n) => n.danhMuc === "guong-sang");

  const loading = postsLoading || galleryLoading || introLoading;

  const galleryItems = gallery
    .map((album) => ({
      id: album.id,
      imageUrl: album.images[0]?.duongDanAnh,
      title: album.tieuDe,
    }))
    .filter((g) => g.imageUrl);

  if (loading) {
    return (
      <div className="global-loading-container">
        <div className="global-spinner"></div>
        <p>Đang tải trang chủ...</p>
      </div>
    );
  }

  // Parse Congress settings from thongTinChiDoan
  const introSettings = introData?.settings || {};
  const congressRaw = introSettings.thongTinChiDoan || "";
  let congressTitle =
    "HƯỚNG TỚI ĐẠI HỘI ĐẠI BIỂU TOÀN QUỐC ĐOÀN TNCS HỒ CHÍ MINH LẦN THỨ XIV, NHIỆM KỲ 2027 - 2032";
  let congressSlogan =
    "Tuổi trẻ Tam Anh: Tiên phong - Bản lĩnh - Đoàn kết - Sáng tạo - Phát triển";

  if (congressRaw && congressRaw.includes("|")) {
    const parts = congressRaw.split("|");
    if (parts[0] && parts[0].trim()) {
      congressTitle = parts[0].trim();
    }
    if (parts[1] && parts[1].trim()) {
      congressSlogan = parts[1].trim();
    }
  }

  return (
    <div className="home-container">
      {/* Announcement Ticker */}
      <AnnouncementTicker posts={posts} formatDate={formatDate} />

      {/* Top Hero Section: Slider & Tabbed news feed */}
      <HeroGrid
        hotNews={hotNews}
        latestPosts={latestPosts}
        popularPosts={popularPosts}
        getCleanText={getCleanText}
        formatDate={formatDate}
      />

      {/* Main Content Grid */}
      <section className="container main-layout">
        <div className="layout-grid">
          {/* Main news column */}
          <main className="news-main-section">
            {/* Category Section 1: Giáo Dục & Hoạt Động */}
            <ShowcaseCategory
              title="Công tác Tuyên truyền, Giáo dục"
              icon={BookOpen}
              iconClass="header-icon-blue"
              newsList={activityNews}
              getCleanText={getCleanText}
              formatDate={formatDate}
              newsCategories={newsCategories}
            />

            {/* Campaign Banner - Youth Union Congress style */}
            <CongressBanner
              congressTitle={congressTitle}
              congressSlogan={congressSlogan}
            />

            {/* Category Section 2: Phong trào & Tình nguyện */}
            <ShowcaseCategory
              title="Phong trào & Tình nguyện vì cộng đồng"
              icon={Flag}
              iconClass="header-icon-orange"
              newsList={charityNews}
              getCleanText={getCleanText}
              formatDate={formatDate}
              newsCategories={newsCategories}
            />

            {/* Category Section 3: Gương sáng trẻ */}
            <BrightExamples
              brightExamples={brightExamples}
              getCleanText={getCleanText}
            />

            {/* Gallery Section */}
            <HomeGallery galleryItems={galleryItems} />

            {/* Movements & Programs Columns */}
            <MovementsPrograms />
          </main>

          {/* Sidebar column */}
          <Sidebar />
        </div>
      </section>
    </div>
  );
}
