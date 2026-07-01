import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import apiService from "src/services/apiService";
import { useApi } from "src/hooks/useApi";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { newsCategories } from "../../data/mockData";
import NewsCard from "../../components/NewsCard/NewsCard";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./News.css";

export default function News() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

  const {
    data,
    loading,
    execute: loadPosts,
  } = useApi(
    useCallback((cat, search) => {
      let url = "/api/baiViet";
      const params = [];
      if (cat && cat !== "all") {
        params.push(`category=${cat}`);
      }
      if (search) {
        params.push(`search=${encodeURIComponent(search)}`);
      }
      if (params.length > 0) {
        url += "?" + params.join("&");
      }
      return apiService.get(url);
    }, [])
  );

  const posts = data || [];

  // Sync state with URL search param
  const urlSearch = searchParams.get("search") || "";

  useRealtimeRefresh("baiViet", () => {
    loadPosts(selectedCategory, urlSearch, { silent: true }).catch((err) => console.error("Error loading posts:", err));
  });

  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    loadPosts(selectedCategory, urlSearch).catch((err) => console.error("Error loading posts:", err));
  }, [loadPosts, selectedCategory, urlSearch]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    if (!e.target.value.trim()) {
      // Clear URL parameter if search is cleared
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      setSearchParams({ search: searchText.trim() });
    } else {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  const filteredNews = posts;

  return (
    <div className="news-page container">
      <h1 className="section-title">Cổng thông tin tin tức</h1>
      
      <div className="layout-grid">
        <main className="news-listing-main">
          {/* Filters and search section */}
          <div className="news-filter-panel card">
            <div className="category-filters">
              <button
                className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategorySelect('all')}
              >
                Tất cả
              </button>
              {newsCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="inline-search-form">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm bài viết..."
                value={searchText}
                onChange={handleSearchChange}
              />
              <button type="submit" className="inline-search-btn" aria-label="Search">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Results count display */}
          <div className="results-info">
            {searchText && (
              <p>
                Kết quả tìm kiếm cho từ khóa: <strong>&ldquo;{searchText}&rdquo;</strong> 
                {selectedCategory !== 'all' && ` trong danh mục "${newsCategories.find(c=>c.id===selectedCategory)?.name}"`}
              </p>
            )}
            <p className="results-count">Tìm thấy {filteredNews.length} bài viết</p>
          </div>

          {/* News articles Grid */}
          {loading ? (
            <div className="global-loading-container">
              <div className="global-spinner"></div>
              <p>Đang tải danh sách bài viết...</p>
            </div>
          ) : filteredNews.length > 0 ? (
            <div className="news-listing-grid">
              {filteredNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          ) : (
            <div className="no-results card">
              <p>Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.</p>
              <button 
                className="btn btn-primary"
                onClick={() => { setSelectedCategory('all'); setSearchText(''); setSearchParams({}); }}
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </main>
        
        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
