import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, Eye } from "lucide-react";

export default function HeroGrid({
  hotNews,
  latestPosts,
  popularPosts,
  getCleanText,
  formatDate,
}) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("new");

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

  const tabPosts = activeTab === "new" ? latestPosts : popularPosts;

  return (
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
                      backgroundImage: news.anhDaiDien
                        ? `linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.1) 100%), url(${news.anhDaiDien})`
                        : `linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.1) 100%)`,
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
                        className={`indicator-dot ${
                          index === currentSlide ? "active" : ""
                        }`}
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
              className={`tab-toggle-btn ${
                activeTab === "popular" ? "active" : ""
              }`}
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
                    {post.anhDaiDien ? (
                      <img
                        src={post.anhDaiDien}
                        alt={post.tieuDe}
                        className="entry-thumbnail"
                      />
                    ) : null}
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
  );
}
