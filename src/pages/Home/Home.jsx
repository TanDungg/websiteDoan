import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Image,
  Calendar,
  Eye,
  Bell,
  ArrowRight,
  BookOpen,
  Flag,
  Award,
  Users,
  GraduationCap,
  Briefcase,
  Zap,
  Heart,
  Clock,
} from "lucide-react";
import apiService from "src/services/apiService";
import { useApi } from "src/hooks/useApi";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Home.css";

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
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("new");

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
    (n) => n.danhMuc === "hoat-dong" || n.danhMuc === "tin-dia-phuong"
  );
  const charityNews = posts.filter((n) => n.danhMuc === "tu-thien");
  const brightExamples = posts.filter((n) => n.danhMuc === "guong-sang");

  // Auto transition for slide banner
  useEffect(() => {
    if (hotNews.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % hotNews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [hotNews.length]);

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + hotNews.length) % hotNews.length);
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % hotNews.length);
  };

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

  // Get active tab list
  const tabPosts = activeTab === "new" ? latestPosts : popularPosts;

  // Split Category 1: Giáo Dục - Hoạt Động
  const cat1List = activityNews;
  const cat1Featured = cat1List[0];
  const cat1SubList = cat1List.slice(1, 4);

  // Split Category 2: Tình Nguyện - Từ Thiện
  const cat2List = charityNews;
  const cat2Featured = cat2List[0];
  const cat2SubList = cat2List.slice(1, 4);

  return (
    <div className="home-container">
      {/* Announcement Ticker */}
      <section className="announcement-ticker-section">
        <div className="container ticker-container-capsule">
          <div className="ticker-badge-lead">
            <Bell size={16} className="ticker-badge-bell" />
            <span>Thông báo</span>
          </div>
          <div className="ticker-marquee-holder">
            {/* eslint-disable react/no-unknown-property */}
            <marquee
              className="ticker-marquee-text"
              scrollamount="4"
              onMouseOver={(e) => e.currentTarget.stop()}
              onMouseOut={(e) => e.currentTarget.start()}
            >
              {posts.filter((p) => p.danhMuc === "thong-bao").length > 0 ? (
                posts
                  .filter((p) => p.danhMuc === "thong-bao")
                  .map((notice, idx) => (
                    <span key={notice.id} className="ticker-marquee-item">
                      <Link to={`/tin-tuc/${notice.id}`}>
                        🔔 {notice.tieuDe} ({formatDate(notice.ngayDang)})
                      </Link>
                      {idx <
                        posts.filter((p) => p.danhMuc === "thong-bao").length -
                          1 && <span className="ticker-dot-split">•</span>}
                    </span>
                  ))
              ) : (
                <span className="ticker-marquee-item">
                  Chào mừng các đồng chí đến với Trang thông tin điện tử Đoàn xã
                  Tam Anh. Kính chúc các đồng chí nhiều sức khỏe, công tác tốt!
                </span>
              )}
            </marquee>
            {/* eslint-enable react/no-unknown-property */}
          </div>
        </div>
      </section>

      {/* Top Hero Section: Slider & Tabbed news feed */}
      <section className="container hero-grid-section">
        <div className="hero-flex-layout">
          {/* Left: News Slider */}
          <div className="hero-main-slider">
            {hotNews.length > 0 ? (
              <div className="slider-container">
                <div
                  className="slider-track"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {hotNews.map((news) => (
                    <div
                      key={news.id}
                      className="slider-item"
                      style={{
                        backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.1) 100%), url(${news.anhDaiDien})`,
                      }}
                      onClick={() => navigate(`/tin-tuc/${news.id}`)}
                    >
                      <div className="slider-card-content">
                        <span className="slider-card-badge">Tin nổi bật</span>
                        <h2 className="slider-card-title">{news.tieuDe}</h2>
                        <p className="slider-card-summary">
                          {getCleanText(news.tomTat, 150)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {hotNews.length > 1 && (
                  <>
                    <button
                      className="slider-nav prev"
                      onClick={prevSlide}
                      aria-label="Slide trước"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      className="slider-nav next"
                      onClick={nextSlide}
                      aria-label="Slide tiếp"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="slider-indicators">
                      {hotNews.map((_, index) => (
                        <button
                          key={index}
                          className={`indicator-dot ${index === currentSlide ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSlide(index);
                          }}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="slider-fallback">
                <p>Chưa có bài viết nổi bật.</p>
              </div>
            )}
          </div>

          {/* Right: Tabbed Post Feeds */}
          <div className="hero-tabs-feed card">
            <div className="tabs-header-wrapper">
              <button
                className={`tab-toggle-btn ${activeTab === "new" ? "active" : ""}`}
                onClick={() => setActiveTab("new")}
              >
                Tin mới nhất
              </button>
              <button
                className={`tab-toggle-btn ${activeTab === "popular" ? "active" : ""}`}
                onClick={() => setActiveTab("popular")}
              >
                Đọc nhiều nhất
              </button>
            </div>
            <div className="tabs-content-body">
              {tabPosts.length > 0 ? (
                <div className="tabs-list-wrapper">
                  {tabPosts.map((post, idx) => (
                    <div
                      key={post.id}
                      className="tab-list-entry"
                      onClick={() => navigate(`/tin-tuc/${post.id}`)}
                    >
                      <div className="entry-index-badge">{idx + 1}</div>
                      <img
                        src={post.anhDaiDien}
                        alt={post.tieuDe}
                        className="entry-thumbnail"
                      />
                      <div className="entry-info-block">
                        <h4 className="entry-title-link">{post.tieuDe}</h4>
                        <div className="entry-metadata">
                          <span className="meta-text">
                            <Clock size={11} /> {formatDate(post.ngayDang)}
                          </span>
                          <span className="meta-text">
                            <Eye size={11} /> {post.luotXem || 0} lượt xem
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="tabs-fallback">Chưa có dữ liệu bài viết.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="container main-layout">
        <div className="layout-grid">
          {/* Main news column */}
          <main className="news-main-section">
            {/* Category Section 1: Giáo Dục & Hoạt Động */}
            <div className="showcase-block-card card">
              <div className="showcase-section-header">
                <BookOpen size={20} className="header-icon-blue" />
                <h3 className="showcase-section-title">
                  Công tác Tuyên truyền, Giáo dục
                </h3>
                <Link to="/tin-tuc" className="showcase-more-link">
                  Xem tất cả <ArrowRight size={14} />
                </Link>
              </div>
              <div className="showcase-block-content">
                {cat1Featured ? (
                  <div className="showcase-layout-grid">
                    {/* Left featured large card */}
                    <div
                      className="showcase-featured-card"
                      onClick={() => navigate(`/tin-tuc/${cat1Featured.id}`)}
                    >
                      <div className="featured-card-img-holder">
                        <img
                          src={cat1Featured.anhDaiDien}
                          alt={cat1Featured.tieuDe}
                        />
                      </div>
                      <div className="featured-card-info">
                        <div className="featured-card-meta">
                          <span>
                            <Calendar size={12} />{" "}
                            {formatDate(cat1Featured.ngayDang)}
                          </span>
                        </div>
                        <h4 className="featured-card-title">
                          {cat1Featured.tieuDe}
                        </h4>
                        <p className="featured-card-summary">
                          {getCleanText(cat1Featured.tomTat, 120)}
                        </p>
                      </div>
                    </div>

                    {/* Right vertical sub list */}
                    <div className="showcase-sublist-wrapper">
                      {cat1SubList.map((subNews) => (
                        <div
                          key={subNews.id}
                          className="showcase-sublist-item"
                          onClick={() => navigate(`/tin-tuc/${subNews.id}`)}
                        >
                          <img
                            src={subNews.anhDaiDien}
                            alt={subNews.tieuDe}
                            className="sublist-item-thumb"
                          />
                          <div className="sublist-item-info">
                            <h5 className="sublist-item-title">
                              {subNews.tieuDe}
                            </h5>
                            <span className="sublist-item-date">
                              {formatDate(subNews.ngayDang)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="no-category-posts">
                    Chưa có bài viết nào trong chuyên mục này.
                  </p>
                )}
              </div>
            </div>

            {/* Campaign Banner - Youth Union Congress style */}
            <div className="congress-campaign-banner card">
              <div className="congress-banner-backdrop">
                <Award size={48} className="congress-backdrop-award" />
              </div>
              <div className="congress-banner-body">
                <span className="congress-banner-pre">
                  Đoàn TNCS Hồ Chí Minh Xã Tam Anh
                </span>
                <h4 className="congress-banner-title">{congressTitle}</h4>
                <p className="congress-banner-slogan">
                  &quot;{congressSlogan}&quot;
                </p>
              </div>
            </div>

            {/* Category Section 2: Phong trào & Tình nguyện */}
            <div
              className="showcase-block-card card"
              style={{ marginTop: "30px" }}
            >
              <div className="showcase-section-header">
                <Flag size={20} className="header-icon-orange" />
                <h3 className="showcase-section-title">
                  Phong trào & Tình nguyện vì cộng đồng
                </h3>
                <Link to="/tin-tuc" className="showcase-more-link">
                  Xem tất cả <ArrowRight size={14} />
                </Link>
              </div>
              <div className="showcase-block-content">
                {cat2Featured ? (
                  <div className="showcase-layout-grid">
                    {/* Left featured large card */}
                    <div
                      className="showcase-featured-card"
                      onClick={() => navigate(`/tin-tuc/${cat2Featured.id}`)}
                    >
                      <div className="featured-card-img-holder">
                        <img
                          src={cat2Featured.anhDaiDien}
                          alt={cat2Featured.tieuDe}
                        />
                      </div>
                      <div className="featured-card-info">
                        <div className="featured-card-meta">
                          <span>
                            <Calendar size={12} />{" "}
                            {formatDate(cat2Featured.ngayDang)}
                          </span>
                        </div>
                        <h4 className="featured-card-title">
                          {cat2Featured.tieuDe}
                        </h4>
                        <p className="featured-card-summary">
                          {getCleanText(cat2Featured.tomTat, 120)}
                        </p>
                      </div>
                    </div>

                    {/* Right vertical sub list */}
                    <div className="showcase-sublist-wrapper">
                      {cat2SubList.map((subNews) => (
                        <div
                          key={subNews.id}
                          className="showcase-sublist-item"
                          onClick={() => navigate(`/tin-tuc/${subNews.id}`)}
                        >
                          <img
                            src={subNews.anhDaiDien}
                            alt={subNews.tieuDe}
                            className="sublist-item-thumb"
                          />
                          <div className="sublist-item-info">
                            <h5 className="sublist-item-title">
                              {subNews.tieuDe}
                            </h5>
                            <span className="sublist-item-date">
                              {formatDate(subNews.ngayDang)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="no-category-posts">
                    Chưa có bài viết nào trong chuyên mục này.
                  </p>
                )}
              </div>
            </div>

            {/* Category Section 3: Gương sáng trẻ */}
            <div
              className="showcase-block-card card"
              style={{ marginTop: "30px" }}
            >
              <div className="showcase-section-header">
                <Award size={20} className="header-icon-blue" />
                <h3 className="showcase-section-title">
                  Gương sáng trẻ - Điển hình tiên tiến
                </h3>
                <Link to="/tin-tuc?category=guong-sang" className="showcase-more-link">
                  Xem tất cả <ArrowRight size={14} />
                </Link>
              </div>
              <div className="showcase-block-content">
                {brightExamples.length > 0 ? (
                  <div className="bright-examples-grid">
                    {brightExamples.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="bright-example-card"
                        onClick={() => navigate(`/tin-tuc/${item.id}`)}
                      >
                        <div className="example-avatar-holder">
                          <img
                            src={item.anhDaiDien}
                            alt={item.tieuDe}
                            className="example-avatar-img"
                          />
                        </div>
                        <div className="example-info">
                          <h4 className="example-name">{item.tieuDe}</h4>
                          <p className="example-summary">
                            {getCleanText(item.tomTat, 90)}
                          </p>
                          <span className="example-readmore">
                            Xem câu chuyện <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-category-posts">
                    Chưa có bài viết nào trong chuyên mục này.
                  </p>
                )}
              </div>
            </div>

            {/* Gallery Section */}
            {galleryItems.length > 0 && (
              <section
                className="home-gallery-sec"
                style={{ marginTop: "30px" }}
              >
                <div
                  className="showcase-section-header"
                  style={{ marginBottom: "20px" }}
                >
                  <Image size={20} className="header-icon-blue" />
                  <h3 className="showcase-section-title">Thư viện hình ảnh</h3>
                  <Link to="/thu-vien" className="showcase-more-link">
                    Xem tất cả <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="home-gallery-grid">
                  {galleryItems.slice(0, 4).map((g) => (
                    <div
                      key={g.id}
                      className="home-gallery-item card"
                      onClick={() => navigate("/thu-vien")}
                    >
                      <img
                        src={g.imageUrl}
                        alt={g.title}
                        className="home-gallery-img"
                      />
                      <div className="home-gallery-overlay">
                        <Image size={24} className="gallery-overlay-icon" />
                        <p className="home-gallery-title">{g.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Movements & Programs Columns */}
            <div className="movements-programs-section">
              <div
                className="showcase-section-header"
                style={{ marginBottom: "24px" }}
              >
                <Users size={20} className="header-icon-blue" />
                <h3 className="showcase-section-title">
                  Phong trào hành động & Chương trình đồng hành
                </h3>
              </div>
              <div className="movements-columns-grid">
                {/* Column 1: 3 Phong trào */}
                <div className="movements-col-card card">
                  <div className="col-header-bar blue">
                    <Flag size={18} />
                    <h4>3 Phong trào hành động cách mạng</h4>
                  </div>
                  <div className="col-body-list">
                    <div className="movement-action-card">
                      <div className="action-icon-circle blue">
                        <Heart size={16} />
                      </div>
                      <div className="action-card-text">
                        <h5>Thanh niên tình nguyện</h5>
                        <p>
                          Các hoạt động tình nguyện vì an sinh xã hội, bảo vệ
                          môi trường, hiến máu nhân đạo.
                        </p>
                      </div>
                    </div>

                    <div className="movement-action-card">
                      <div className="action-icon-circle orange">
                        <Zap size={16} />
                      </div>
                      <div className="action-card-text">
                        <h5>Tuổi trẻ sáng tạo</h5>
                        <p>
                          Khuyến khích sáng kiến, nghiên cứu khoa học, cải tiến
                          kỹ thuật trong học tập và lao động.
                        </p>
                      </div>
                    </div>

                    <div className="movement-action-card">
                      <div className="action-icon-circle red">
                        <Award size={16} />
                      </div>
                      <div className="action-card-text">
                        <h5>Tuổi trẻ xung kích bảo vệ Tổ quốc</h5>
                        <p>
                          Tham gia bảo vệ an ninh trật tự, tuyên truyền luật
                          nghĩa vụ quân sự và hậu phương quân đội.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: 3 Chương trình */}
                <div className="movements-col-card card">
                  <div className="col-header-bar orange">
                    <Users size={18} />
                    <h4>3 Chương trình đồng hành với thanh niên</h4>
                  </div>
                  <div className="col-body-list">
                    <div className="movement-action-card">
                      <div className="action-icon-circle blue">
                        <GraduationCap size={16} />
                      </div>
                      <div className="action-card-text">
                        <h5>Đồng hành trong học tập</h5>
                        <p>
                          Quỹ khuyến học, các chuyên đề học thuật, tư vấn mùa
                          thi và nâng cao trình độ học vấn.
                        </p>
                      </div>
                    </div>

                    <div className="movement-action-card">
                      <div className="action-icon-circle orange">
                        <Briefcase size={16} />
                      </div>
                      <div className="action-card-text">
                        <h5>Đồng hành trong khởi nghiệp, lập nghiệp</h5>
                        <p>
                          Hỗ trợ vay vốn, tập huấn kỹ năng nông nghiệp công nghệ
                          cao và kết nối việc làm.
                        </p>
                      </div>
                    </div>

                    <div className="movement-action-card">
                      <div className="action-icon-circle red">
                        <Users size={16} />
                      </div>
                      <div className="action-card-text">
                        <h5>Đồng hành phát triển kỹ năng xã hội</h5>
                        <p>
                          Rèn luyện kỹ năng mềm, tổ chức hội thao, giao lưu văn
                          nghệ và chăm sóc sức khỏe thể chất.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar column */}
          <Sidebar />
        </div>
      </section>
    </div>
  );
}
