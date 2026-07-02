import React, { useState } from "react";

export default function Table({
  columns = [],
  data = [],
  emptyMessage = "Không có dữ liệu",
  height = null,
  pagination = false,
  pageSize = 10,
  rowStyle = null,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const isPaginated = pagination && data.length > 0;
  const size = pageSize || 10;
  const totalPages = Math.ceil(data.length / size);
  const activePage = Math.min(currentPage, totalPages || 1);

  const displayData = isPaginated
    ? data.slice((activePage - 1) * size, activePage * size)
    : data;

  const handlePrevPage = () => {
    if (activePage > 1) setCurrentPage(activePage - 1);
  };

  const handleNextPage = () => {
    if (activePage < totalPages) setCurrentPage(activePage + 1);
  };

  const handlePageClick = (p) => {
    setCurrentPage(p);
  };

  // Generate page numbers for navigation
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (activePage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (activePage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          activePage - 1,
          activePage,
          activePage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  const startRecord = (activePage - 1) * size + 1;
  const endRecord = Math.min(activePage * size, data.length);

  const hasScroll = !!height;

  const renderPagination = () => {
    if (!isPaginated) return null;
    return (
      <div
        className="table-pagination"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderTop: "1px solid #cbd5e1",
          fontSize: "0.85rem",
          color: "#475569",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          Hiển thị{" "}
          <strong>
            {startRecord}-{endRecord}
          </strong>{" "}
          trong tổng số <strong>{data.length}</strong> dòng
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <button
            onClick={handlePrevPage}
            disabled={activePage === 1}
            style={{
              padding: "4px 8px",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              backgroundColor: activePage === 1 ? "#f1f5f9" : "#fff",
              color: activePage === 1 ? "#94a3b8" : "#334155",
              cursor: activePage === 1 ? "not-allowed" : "pointer",
              fontSize: "0.8rem",
            }}
          >
            Trước
          </button>

          {getPageNumbers().map((p, idx) => {
            const isEllipsis = p === "...";
            const isCurrent = p === activePage;
            return (
              <button
                key={idx}
                onClick={() => !isEllipsis && handlePageClick(p)}
                disabled={isEllipsis || isCurrent}
                style={{
                  padding: "4px 8px",
                  minWidth: "28px",
                  border: "1px solid",
                  borderColor: isCurrent
                    ? "var(--primary, #0284c7)"
                    : "#cbd5e1",
                  borderRadius: "4px",
                  backgroundColor: isCurrent
                    ? "var(--primary, #0284c7)"
                    : isEllipsis
                      ? "transparent"
                      : "#fff",
                  color: isCurrent
                    ? "#fff"
                    : isEllipsis
                      ? "#64748b"
                      : "#334155",
                  cursor: isEllipsis
                    ? "default"
                    : isCurrent
                      ? "default"
                      : "pointer",
                  fontWeight: isCurrent ? 600 : "normal",
                  fontSize: "0.8rem",
                }}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={handleNextPage}
            disabled={activePage === totalPages}
            style={{
              padding: "4px 8px",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              backgroundColor: activePage === totalPages ? "#f1f5f9" : "#fff",
              color: activePage === totalPages ? "#94a3b8" : "#334155",
              cursor: activePage === totalPages ? "not-allowed" : "pointer",
              fontSize: "0.8rem",
            }}
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  if (hasScroll) {
    return (
      <div
        className="table-responsive card panel-table-card"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Header Table Wrapper (Fixed, No Scroll, with Scrollbar Gutter) */}
        <div
          style={{
            scrollbarGutter: "stable",
            overflowY: "hidden",
            width: "100%",
            backgroundColor: "#0469b9",
            backgroundClip: "padding-box",
            borderTopLeftRadius: "var(--radius-lg, 8px)",
            borderTopRightRadius: "var(--radius-lg, 8px)",
            borderBottom: "2px solid #e2e8f0",
            boxShadow: "inset 0 -2px 0 0 #e2e8f0",
          }}
        >
          <table
            className="table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              margin: 0,
            }}
          >
            <thead>
              <tr>
                {columns.map((col) => {
                  const thStyle = {};
                  if (col.width) thStyle.width = col.width;
                  if (col.align) thStyle.textAlign = col.align;
                  return (
                    <th key={col.key || col.dataIndex} style={thStyle}>
                      {col.title}
                    </th>
                  );
                })}
              </tr>
            </thead>
          </table>
        </div>

        {/* Scrollable Body Table Wrapper (with Scrollbar Gutter) */}
        <div
          className="table-scroll-container"
          style={{
            maxHeight: typeof height === "number" ? `${height}px` : height,
            overflowY: "auto",
            scrollbarGutter: "stable",
            width: "100%",
          }}
        >
          <table
            className="table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              margin: 0,
            }}
          >
            <tbody>
              {displayData.map((record, index) => {
                const trStyle = rowStyle ? rowStyle(record, index) : {};
                if (record.isValid === false) {
                  trStyle.borderBottom = "1px solid #cbd5e1";
                }
                return (
                  <tr key={record.id || record.index || index} style={trStyle}>
                    {columns.map((col) => {
                      const tdStyle = {};
                      if (col.width) tdStyle.width = col.width;
                      if (col.align) tdStyle.textAlign = col.align;

                      const cellValue = col.dataIndex
                        ? record[col.dataIndex]
                        : undefined;

                      const renderedContent = col.render
                        ? col.render(cellValue, record, index)
                        : cellValue;

                      return (
                        <td key={col.key || col.dataIndex} style={tdStyle}>
                          {renderedContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      padding: "20px",
                    }}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {renderPagination()}
      </div>
    );
  }

  // Normal Single-Table Layout (Backwards compatibility / No height limit)
  return (
    <div
      className="table-responsive card panel-table-card"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div className="table-scroll-container" style={{ width: "100%" }}>
        <table
          className="table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              {columns.map((col) => {
                const thStyle = {};
                if (col.width) thStyle.width = col.width;
                if (col.align) thStyle.textAlign = col.align;
                return (
                  <th key={col.key || col.dataIndex} style={thStyle}>
                    {col.title}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayData.map((record, index) => {
              const trStyle = rowStyle ? rowStyle(record, index) : {};
              if (record.isValid === false) {
                trStyle.borderBottom = "1px solid #cbd5e1";
              }
              return (
                <tr key={record.id || record.index || index} style={trStyle}>
                  {columns.map((col) => {
                    const tdStyle = {};
                    if (col.align) tdStyle.textAlign = col.align;

                    const cellValue = col.dataIndex
                      ? record[col.dataIndex]
                      : undefined;

                    const renderedContent = col.render
                      ? col.render(cellValue, record, index)
                      : cellValue;

                    return (
                      <td key={col.key || col.dataIndex} style={tdStyle}>
                        {renderedContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    padding: "20px",
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {renderPagination()}
    </div>
  );
}
