import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Image } from "lucide-react";
import apiService from "src/services/apiService";
import { useApi } from "src/hooks/useApi";
import NewsCard from "../../components/NewsCard/NewsCard";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Home.css";

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

  const posts = postsData || [];
  const gallery = galleryData || [];

  useEffect(() => {
    loadPosts().catch((err) => console.error("Failed to load posts:", err));
    loadGallery().catch((err) => console.error("Failed to load gallery:", err));
  }, [loadPosts, loadGallery]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const hotNews = posts.filter((n) => n.tinNoiBat);
  const recentNews = posts.slice(0, 4);

  // Auto transition for slide banner
  useEffect(() => {
    if (hotNews.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % hotNews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hotNews.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + hotNews.length) % hotNews.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % hotNews.length);
  };

  const loading = postsLoading || galleryLoading;

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

  return (
    <div className="home-container">
      {/* Slider Banner Section */}
      {hotNews.length > 0 && (
        <section className="hero-slider">
          <div
            className="slider-wrapper"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {hotNews.map((news) => (
              <div
                key={news.id}
                className="slide-item"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.75)), url(${news.anhDaiDien})`,
                }}
              >
                <div className="container">
                  <div className="slide-content-card">
                    <span className="slide-tag">Tin nổi bật</span>
                    <h2 className="slide-title">{news.tieuDe}</h2>
                    <p className="slide-summary">{news.tomTat}</p>
                    <Link
                      to={`/tin-tuc/${news.id}`}
                      className="btn btn-primary"
                    >
                      Xem bài viết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {hotNews.length > 1 && (
            <>
              <button
                className="slider-arrow arrow-left"
                onClick={prevSlide}
                aria-label="Previous Slide"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="slider-arrow arrow-right"
                onClick={nextSlide}
                aria-label="Next Slide"
              >
                <ChevronRight size={24} />
              </button>
              <div className="slider-dots">
                {hotNews.map((_, index) => (
                  <button
                    key={index}
                    className={`dot-item ${index === currentSlide ? "active" : ""}`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Main Layout Grid */}
      <div className="container main-layout">
        <div className="layout-grid">
          {/* Main news column */}
          <main className="news-main-section">
            <h2 className="section-title">Tin tức mới nhất</h2>
            <div className="news-grid">
              {recentNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
            <div className="see-all-wrapper">
              <Link to="/tin-tuc" className="btn btn-outline">
                Xem tất cả tin tức
              </Link>
            </div>

            {/* Sub-section: Quick Gallery display */}
            {galleryItems.length > 0 && (
              <section className="home-gallery-sec">
                <h2 className="section-title">Thư viện hình ảnh</h2>
                <div className="home-gallery-grid">
                  {galleryItems.slice(0, 4).map((g) => (
                    <div key={g.id} className="home-gallery-item card">
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
                <div className="see-all-wrapper">
                  <Link to="/thu-vien" className="btn btn-outline">
                    Xem thư viện ảnh
                  </Link>
                </div>
              </section>
            )}
          </main>

          {/* Sidebar column */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
