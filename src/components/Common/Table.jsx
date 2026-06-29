import React from "react";

export default function Table({ columns = [], data = [], emptyMessage = "Không có dữ liệu" }) {
  return (
    <div className="table-responsive card panel-table-card">
      <table className="table">
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
          {data.map((record, index) => (
            <tr key={record.id || index}>
              {columns.map((col) => {
                const tdStyle = {};
                if (col.align) tdStyle.textAlign = col.align;

                const cellValue = col.dataIndex ? record[col.dataIndex] : undefined;

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
          ))}
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
  );
}
