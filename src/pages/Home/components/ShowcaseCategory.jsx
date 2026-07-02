import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";

export default function ShowcaseCategory({
  title,
  icon: Icon,
  iconClass,
  newsList,
  getCleanText,
  formatDate,
  newsCategories,
  moreLink = "/tin-tuc",
}) {
  const navigate = useNavigate();

  const featured = newsList[0];
  const subList = newsList.slice(1, 4);

  return (
    <div className="showcase-block-card card">
      <div className="showcase-section-header">
        <Icon size={20} className={iconClass} />
        <h3 className="showcase-section-title">{title}</h3>
        <Link to={moreLink} className="showcase-more-link">
          Xem tất cả <ArrowRight size={14} />
        </Link>
      </div>
      <div className="showcase-block-content">
        {featured ? (
          <div className="showcase-layout-grid">
            {/* Left featured large card */}
            <div
              className="showcase-featured-card"
              onClick={() => navigate(`/tin-tuc/${featured.id}`)}
            >
              <div className="featured-card-img-holder">
                {featured.anhDaiDien ? (
                  <img src={featured.anhDaiDien} alt={featured.tieuDe} />
                ) : null}
                <span className={`home-card-badge badge-${featured.danhMuc}`}>
                  {newsCategories.find((c) => c.id === featured.danhMuc)?.name ||
                    "Tin tức"}
                </span>
              </div>
              <div className="featured-card-info">
                <div className="featured-card-meta">
                  <span>
                    <Calendar size={12} /> {formatDate(featured.ngayDang)}
                  </span>
                </div>
                <h4 className="featured-card-title">{featured.tieuDe}</h4>
                <p className="featured-card-summary">
                  {getCleanText(featured.tomTat, 120)}
                </p>
              </div>
            </div>

            {/* Right vertical sub list */}
            <div className="showcase-sublist-wrapper">
              {subList.map((subNews) => (
                <div
                  key={subNews.id}
                  className="showcase-sublist-item"
                  onClick={() => navigate(`/tin-tuc/${subNews.id}`)}
                >
                  {subNews.anhDaiDien ? (
                    <img
                      src={subNews.anhDaiDien}
                      alt={subNews.tieuDe}
                      className="sublist-item-thumb"
                    />
                  ) : null}
                  <div className="sublist-item-info">
                    <h5 className="sublist-item-title">{subNews.tieuDe}</h5>
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
  );
}
