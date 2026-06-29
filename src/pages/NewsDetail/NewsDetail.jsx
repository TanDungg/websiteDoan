import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, Eye, ArrowLeft, Share2, Link2 } from "lucide-react";
import apiService from "src/services/apiService";
import { useApi } from "src/hooks/useApi";
import { newsCategories } from "../../data/mockData";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./NewsDetail.css";

export default function NewsDetail() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const {
    data: detailData = null,
    loading,
    execute: loadPostDetail,
  } = useApi(
    useCallback(async (postId) => {
      // 1. Fetch current post
      const post = await apiService.get(`/api/posts/${postId}`);
      // 2. Fetch related posts by category
      let related = [];
      try {
        const postsData = await apiService.get(`/api/posts?category=${post.category}`);
        related = postsData
          .filter((item) => item.id.toString() !== postId.toString())
          .slice(0, 3);
      } catch (e) {
        console.error("Error loading related posts:", e);
      }
      return { post, related };
    }, [])
  );

  useEffect(() => {
    loadPostDetail(id).catch((err) => console.error("Error loading post:", err));
    window.scrollTo(0, 0);
  }, [id, loadPostDetail]);

  const newsItem = detailData?.post;
  const relatedPosts = detailData?.related || [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="global-loading-container">
        <div className="global-spinner"></div>
        <p>Đang tải nội dung bài viết...</p>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="news-detail-error container card">
        <h2>Không tìm thấy bài viết</h2>
        <p>Đường dẫn bài viết không chính xác hoặc bài viết đã bị gỡ bỏ.</p>
        <Link to="/tin-tuc" className="btn btn-primary">
          <ArrowLeft size={16} /> Quay lại danh sách tin
        </Link>
      </div>
    );
  }

  // Find category display name
  const catName = newsCategories.find(c => c.id === newsItem.category)?.name || 'Tin tức';

  // Format date display (DD/MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="news-detail-page container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="separator">/</span>
        <Link to="/tin-tuc">Tin tức</Link>
        <span className="separator">/</span>
        <span className="current">{newsItem.title}</span>
      </nav>

      <div className="layout-grid">
        <main className="news-detail-main card">
          <div className="detail-header">
            <span className={`badge badge-${newsItem.category} detail-badge`}>{catName}</span>
            <h1 className="detail-title">{newsItem.title}</h1>
            
            <div className="detail-meta">
              <span className="meta-item">
                <Calendar size={16} />
                <span>{formatDate(newsItem.date)}</span>
              </span>
              <span className="meta-item">
                <User size={16} />
                <span>{newsItem.author}</span>
              </span>
              <span className="meta-item">
                <Eye size={16} />
                <span>{newsItem.views || 0} lượt xem</span>
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="detail-image-wrapper">
            <img src={newsItem.imageUrl} alt={newsItem.title} className="detail-image" />
          </div>

          {/* Article Content */}
          <div 
            className="detail-content"
            dangerouslySetInnerHTML={{ __html: newsItem.content }}
          />

          {/* Action / Share section */}
          <div className="detail-actions">
            <div className="share-box">
              <span>Chia sẻ bài viết:</span>
              <button className="share-btn fb-share" aria-label="Share on Facebook" onClick={() => window.open('https://facebook.com', '_blank')}>
                <Share2 size={16} />
                <span>Chia sẻ</span>
              </button>
              <button className="share-btn copy-link" onClick={handleCopyLink} aria-label="Copy Link">
                <Link2 size={16} />
                <span>{copied ? 'Đã sao chép!' : 'Sao chép liên kết'}</span>
              </button>
            </div>
            
            <Link to="/tin-tuc" className="back-link">
              <ArrowLeft size={16} />
              <span>Quay lại cổng tin tức</span>
            </Link>
          </div>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section className="related-section">
              <h3>Bài viết liên quan</h3>
              <div className="related-grid">
                {relatedPosts.map((post) => (
                  <div key={post.id} className="related-card card">
                    <img src={post.imageUrl} alt={post.title} className="related-img" />
                    <div className="related-info">
                      <span className="related-date">{formatDate(post.date)}</span>
                      <h4 className="related-title">
                        <Link to={`/tin-tuc/${post.id}`}>{post.title}</Link>
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
