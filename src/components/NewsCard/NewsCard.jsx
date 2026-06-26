import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { newsCategories } from '../../data/mockData';
import './NewsCard.css';

export default function NewsCard({ news }) {
  const { id, title, summary, imageUrl, date, author, category } = news;
  
  // Find category display name
  const catName = newsCategories.find(c => c.id === category)?.name || 'Tin tức';

  // Format date display (DD/MM/YYYY)
  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <article className="card news-card">
      <div className="card-image-wrapper">
        <img src={imageUrl} alt={title} className="card-image" loading="lazy" />
        <span className={`badge badge-${category} card-badge`}>{catName}</span>
      </div>
      
      <div className="card-info">
        <div className="card-meta">
          <span className="meta-item">
            <Calendar size={14} />
            <span>{formatDate(date)}</span>
          </span>
          <span className="meta-item">
            <User size={14} />
            <span>{author}</span>
          </span>
        </div>
        
        <h3 className="card-title">
          <Link to={`/tin-tuc/${id}`}>{title}</Link>
        </h3>
        
        <p className="card-summary">{summary}</p>
        
        <Link to={`/tin-tuc/${id}`} className="card-link">
          <span>Xem chi tiết</span>
          <ArrowRight size={16} className="link-arrow" />
        </Link>
      </div>
    </article>
  );
}
