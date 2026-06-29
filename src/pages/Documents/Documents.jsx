import React, { useState, useEffect, useCallback } from "react";
import { Search, FileText, Download, Calendar } from "lucide-react";
import apiService from "src/services/apiService";
import { useApi } from "src/hooks/useApi";
import "./Documents.css";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data,
    loading,
    execute: loadDocs,
  } = useApi(
    useCallback(() => apiService.get("/api/documents"), [])
  );

  const docs = data || [];

  useEffect(() => {
    loadDocs().catch((err) => console.error("Error loading documents:", err));
  }, [loadDocs]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
  };

  const categories = ['all', 'Nghị quyết', 'Quyết định', 'Kế hoạch', 'Hướng dẫn'];

  // Filtered documents
  const filteredDocs = docs.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="docs-page container">
      <h1 className="section-title">Thư viện Văn bản - Tài liệu</h1>
      <p className="docs-intro">
        Nơi lưu trữ và tra cứu toàn bộ các văn bản, hướng dẫn, nghị quyết công tác Đoàn và phong trào thanh thiếu nhi của BCH Đoàn xã Tam Anh và cấp trên.
      </p>

      {/* Filter and search controls */}
      <div className="docs-controls card">
        <div className="docs-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`doc-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat === 'all' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>

        <div className="docs-search">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo tên hoặc số hiệu..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Search size={18} className="search-icon" />
        </div>
      </div>

      <div className="table-responsive card docs-table-card">
        {loading ? (
          <div className="global-loading-container">
            <div className="global-spinner"></div>
            <p>Đang tải danh sách văn bản...</p>
          </div>
        ) : filteredDocs.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Số hiệu</th>
                <th style={{ width: '45%' }}>Tên văn bản / Tài liệu</th>
                <th style={{ width: '15%' }}>Thể loại</th>
                <th style={{ width: '15%' }}>Ngày ban hành</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Tải về</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td className="doc-number-cell">{doc.docNo}</td>
                  <td>
                    <div className="doc-title-cell">
                      <FileText size={18} className="doc-file-icon" />
                      <span className="doc-title-text">{doc.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`doc-cat-tag cat-${doc.category}`}>
                      {doc.category}
                    </span>
                  </td>
                  <td className="doc-date-cell">
                    <Calendar size={14} style={{ marginRight: '6px', color: '#888' }} />
                    {formatDate(doc.date)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <a 
                      href={doc.fileUrl || '#'} 
                      className="doc-download-btn" 
                      title="Tải văn bản"
                      onClick={(e) => {
                        if (doc.fileUrl === '#') {
                          e.preventDefault();
                          alert('Văn bản này hiện chưa đính kèm file tải thực tế.');
                        }
                      }}
                    >
                      <Download size={18} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="docs-no-results">
            <p>Không tìm thấy văn bản hoặc tài liệu nào phù hợp với bộ lọc tìm kiếm.</p>
          </div>
        )}
      </div>
    </div>
  );
}
