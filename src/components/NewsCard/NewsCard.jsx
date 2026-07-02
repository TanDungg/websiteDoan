import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { newsCategories } from '../../data/mockData';
import './NewsCard.css';

const getCleanSummary = (text) => {
  if (!text) return "";
  
  let cleaned = text.trim();
  
  // Detect JSON
  if (cleaned.startsWith("{") || cleaned.startsWith("[")) {
    try {
      const parsed = JSON.parse(cleaned);
      const textParts = [];
      const extractText = (val) => {
        if (typeof val === "string") {
          // Skip UUIDs and database keys
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
      // ignore parse error
    }
  }

  // Strip HTML
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  
  // Clean JSON characters
  if (cleaned.includes("{") || cleaned.includes("[")) {
    cleaned = cleaned.replace(/[{}"[\]]/g, " ");
    cleaned = cleaned.replace(/\b[a-zA-Z0-9_]+:/g, " ");
    cleaned = cleaned.replace(/\s+/g, " ").trim();
  }

  if (cleaned.length > 160) {
    return cleaned.slice(0, 160) + "...";
  }
  return cleaned;
};

export default function NewsCard({ news }) {
  const { id, tieuDe, tomTat, anhDaiDien, ngayDang, tacGia, danhMuc } = news;
  const navigate = useNavigate();
  
  // Find category display name
  const catName = newsCategories.find(c => c.id === danhMuc)?.name || 'Tin tức';

  // Format date display (DD/MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <article className="card news-card" onClick={() => navigate(`/tin-tuc/${id}`)}>
      {anhDaiDien ? (
        <div className="card-image-wrapper">
          <img src={anhDaiDien} alt={tieuDe} className="card-image" loading="lazy" />
          <span className={`badge badge-${danhMuc} card-badge`}>{catName}</span>
        </div>
      ) : (
        <div className="card-no-image-badge-wrapper" style={{ padding: "16px 16px 0 16px" }}>
          <span className={`badge badge-${danhMuc}`}>{catName}</span>
        </div>
      )}
      
      <div className="card-info">
        <div className="card-meta">
          <span className="meta-item">
            <Calendar size={14} />
            <span>{formatDate(ngayDang)}</span>
          </span>
          <span className="meta-item">
            <User size={14} />
            <span>{tacGia}</span>
          </span>
        </div>
        
        <h3 className="card-title">
          <Link to={`/tin-tuc/${id}`}>{tieuDe}</Link>
        </h3>
        
        <p className="card-summary">{getCleanSummary(tomTat)}</p>
        
        <Link to={`/tin-tuc/${id}`} className="card-link">
          <span>Xem chi tiết</span>
          <ArrowRight size={16} className="link-arrow" />
        </Link>
      </div>
    </article>
  );
}
