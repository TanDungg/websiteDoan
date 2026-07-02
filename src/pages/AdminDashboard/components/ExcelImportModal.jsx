import React, { useState, useRef } from "react";
import XLSX from "xlsx-js-style";
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
  Info,
} from "lucide-react";
import apiService from "src/services/apiService";
import Table from "src/components/Common/Table";

export default function ExcelImportModal({
  isOpen,
  onClose,
  type,
  onSuccess,
  branchTypes = [],
  branches = [],
}) {
  const [file, setFile] = useState(null);
  const [validatedData, setValidatedData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Title & description mapping
  const infoMap = {
    branches: {
      title: "Import Chi đoàn từ Excel",
      templateName: "Mau_Import_ChiDoan.xlsx",
      desc: "Nhập danh sách các Chi đoàn trực thuộc nhanh chóng. Cần lưu ý tên phân loại Chi đoàn điền vào phải khớp với phân loại đã thiết lập trong hệ thống.",
    },
    members: {
      title: "Import Đoàn viên từ Excel",
      templateName: "Mau_Import_DoanVien.xlsx",
      desc: "Nhập danh sách Đoàn viên sinh hoạt. Trường 'Chi đoàn sinh hoạt' trong file Excel phải trùng khớp với tên Chi đoàn đang hoạt động trên hệ thống.",
    },
    bch: {
      title: "Import Ban Chấp Hành từ Excel",
      templateName: "Mau_Import_BanChapHanh.xlsx",
      desc: "Nhập danh sách cán bộ Ban chấp hành đương nhiệm. Cột chức vụ cần điền một trong các giá trị: 'Bí thư Đoàn xã', 'Phó Bí thư Đoàn xã', 'Ủy viên Ban Thường vụ', 'Ủy viên Ban Chấp hành'.",
    },
  };

  const currentInfo = infoMap[type] || {
    title: "Import từ Excel",
    templateName: "Template.xlsx",
    desc: "",
  };

  // Generate and download template
  // Generate and download template
  const handleDownloadTemplate = () => {
    let title = "";
    let headers = [];
    let samples = [];
    let cols = [];

    if (type === "branches") {
      title = "DANH SÁCH CHI ĐOÀN";
      headers = ["Tên Chi Đoàn", "Phân loại Chi đoàn"];
      samples = [
        [
          "Chi đoàn Thôn Tam Anh 1",
          branchTypes[0]?.tenLoai || "Chi đoàn Khối nông thôn",
        ],
        [
          "Chi đoàn Trường Tiểu học Tam Anh",
          branchTypes[0]?.tenLoai || "Chi đoàn Khối Trường học/Cơ quan",
        ],
      ];
      cols = [{ wch: 35 }, { wch: 35 }];
    } else if (type === "members") {
      title = "DANH SÁCH ĐOÀN VIÊN";
      headers = [
        "Họ và tên",
        "Ngày sinh",
        "Số điện thoại",
        "Email",
        "Chi đoàn sinh hoạt",
        "Ngày vào Đoàn",
        "Chức vụ",
      ];
      samples = [
        [
          "Nguyễn Văn A",
          "15/05/2000",
          "0905123456",
          "nguyenvana@gmail.com",
          branches[0]?.tenChiDoan || "Chi đoàn Thôn Tam Anh 1",
          "19/05/2015",
          "Đoàn viên",
        ],
      ];
      cols = [
        { wch: 25 },
        { wch: 15 },
        { wch: 18 },
        { wch: 25 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
      ];
    } else if (type === "bch") {
      title = "DANH SÁCH BAN CHẤP HÀNH";
      headers = [
        "Họ và tên",
        "Chức vụ",
        "Số điện thoại",
        "Email",
        "Nhiệm vụ phân công",
        "Ảnh đại diện (URL)",
      ];
      samples = [
        [
          "Nguyễn Thị B",
          "Bí thư Đoàn xã",
          "0987654321",
          "nguyenthib@gmail.com",
          "Chỉ đạo toàn diện công tác Đoàn và phong trào thanh thiếu nhi xã",
          "",
        ],
        [
          "Nguyễn Văn C",
          "Phó Bí thư Đoàn xã",
          "0905111222",
          "nguyenvanc@gmail.com",
          "Phụ trách công tác xây dựng Đoàn, chủ trì kiểm tra, giám sát",
          "",
        ],
      ];
      cols = [
        { wch: 25 },
        { wch: 20 },
        { wch: 18 },
        { wch: 25 },
        { wch: 50 },
        { wch: 30 },
      ];
    }

    // Build array of arrays (AOA) starting from Row 1
    const aoa = [
      [title], // Row 1 (Title)
      [], // Row 2 (Spacer)
      headers, // Row 3 (Headers)
      ...samples, // Row 4+ (Samples)
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Merge Title across all columns
    const numCols = headers.length;
    worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } }];

    // Column widths
    worksheet["!cols"] = cols;

    // Row heights
    const rowHeights = [
      { hpt: 35 }, // Title row
      { hpt: 10 }, // Spacer row
      { hpt: 26 }, // Header row
    ];
    // Data rows heights (samples + additional empty styled rows up to index 12)
    const totalRowsToStyle = Math.max(aoa.length, 12);
    for (let i = 3; i < totalRowsToStyle; i++) {
      rowHeights.push({ hpt: 22 });
    }
    worksheet["!rows"] = rowHeights;

    // Styling A1 (Title)
    worksheet["A1"].s = {
      font: {
        name: "Times New Roman",
        sz: 18,
        bold: true,
        color: { rgb: "1F4E79" }, // Navy Blue
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };

    // Styling Header cells (Row 3, index 2)
    const headerStyle = {
      font: {
        name: "Times New Roman",
        sz: 11,
        bold: true,
        color: { rgb: "000000" },
      },
      fill: {
        fgColor: { rgb: "D9E1F2" }, // Light steel-blue background
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },
      border: {
        top: { style: "thin", color: { rgb: "808080" } },
        bottom: { style: "thin", color: { rgb: "808080" } },
        left: { style: "thin", color: { rgb: "808080" } },
        right: { style: "thin", color: { rgb: "808080" } },
      },
    };

    for (let c = 0; c < numCols; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 2, c });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = headerStyle;
      }
    }

    // Styling Data rows and creating empty placeholder rows with grids (Row 4 to 12)
    const dataStyle = {
      font: { name: "Times New Roman", sz: 11 },
      alignment: {
        vertical: "center",
        horizontal: "left",
      },
      border: {
        top: { style: "thin", color: { rgb: "C0C0C0" } },
        bottom: { style: "thin", color: { rgb: "C0C0C0" } },
        left: { style: "thin", color: { rgb: "C0C0C0" } },
        right: { style: "thin", color: { rgb: "C0C0C0" } },
      },
    };

    for (let r = 3; r < totalRowsToStyle; r++) {
      for (let c = 0; c < numCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { v: "" };
        }
        worksheet[cellRef].s = dataStyle;
      }
    }

    // Show grid lines explicitly
    worksheet["!views"] = [{ showGridLines: true }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, currentInfo.templateName);
  };

  // Helper: Parse date Excel number / DD/MM/YYYY / YYYY-MM-DD
  const parseExcelDate = (val) => {
    if (!val) return "";
    if (typeof val === "number") {
      // Excel date serial number format
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split("T")[0];
    }
    const str = String(val).trim();
    // DD/MM/YYYY match
    const dmyMatch = str.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const month = dmyMatch[2].padStart(2, "0");
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    // YYYY-MM-DD match
    const ymdMatch = str.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = ymdMatch[2].padStart(2, "0");
      const day = ymdMatch[3].padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
    return str;
  };

  // Process data after read
  const processParsedData = (jsonRows) => {
    if (jsonRows.length === 0) {
      setErrorMsg("File Excel trống hoặc cấu trúc không hợp lệ!");
      setValidatedData([]);
      return;
    }

    setErrorMsg("");
    const validated = jsonRows.map((row, idx) => {
      const errors = [];
      const warnings = [];
      let dbRecord = {};

      if (type === "branches") {
        const rawName =
          row["Tên Chi Đoàn"] || row["tenChiDoan"] || row["Tên Chi đoàn"];
        const rawType =
          row["Phân loại Chi đoàn"] || row["loaiChiDoan"] || row["Phân loại"];

        if (!rawName || !String(rawName).trim()) {
          errors.push("Thiếu tên Chi đoàn");
        }
        if (!rawType || !String(rawType).trim()) {
          errors.push("Thiếu phân loại Chi đoàn");
        }

        // Match type
        let loaiChiDoanId = "";
        if (rawType) {
          const matchedType = branchTypes.find(
            (t) =>
              t.tenLoai &&
              t.tenLoai.trim().toLowerCase() ===
                String(rawType).trim().toLowerCase(),
          );
          if (matchedType) {
            loaiChiDoanId = matchedType.id;
          } else {
            errors.push(`Phân loại '${rawType}' không tồn tại trên hệ thống`);
          }
        }

        dbRecord = {
          tenChiDoan: rawName ? String(rawName).trim() : "",
          loaiChiDoanId,
          // display info for preview
          _displayName: rawName,
          _displayGroup: rawType,
        };
      } else if (type === "members") {
        const name = row["Họ và tên"] || row["hoTen"] || row["Họ tên"];
        const dob = row["Ngày sinh"] || row["ngaySinh"];
        const phone =
          row["Số điện thoại"] ||
          row["soDienThoai"] ||
          row["Phone"] ||
          row["SĐT"];
        const email = row["Email"];
        const branchName =
          row["Chi đoàn sinh hoạt"] ||
          row["chiDoan"] ||
          row["Chi đoàn"] ||
          row["Chi đoàn sinh hoạt"];
        const joinDate = row["Ngày vào Đoàn"] || row["ngayVaoDoan"];
        const role = row["Chức vụ"] || row["trangThai"] || "Đoàn viên";

        if (!name || !String(name).trim()) {
          errors.push("Thiếu họ và tên");
        }
        if (!phone || !String(phone).trim()) {
          errors.push("Thiếu số điện thoại");
        }
        if (!branchName || !String(branchName).trim()) {
          errors.push("Thiếu chi đoàn sinh hoạt");
        }

        // Match branch
        let chiDoanId = "";
        if (branchName) {
          const matchedBranch = branches.find(
            (b) =>
              b.tenChiDoan &&
              b.tenChiDoan.trim().toLowerCase() ===
                String(branchName).trim().toLowerCase(),
          );
          if (matchedBranch) {
            chiDoanId = matchedBranch.id;
          } else {
            errors.push(
              `Chi đoàn '${branchName}' không tồn tại trong hệ thống`,
            );
          }
        }

        // Validate status role
        const validRoles = ["Đoàn viên", "Ủy viên", "Phó Bí thư", "Bí thư"];
        let finalRole = "Đoàn viên";
        if (role) {
          const matchedRole = validRoles.find(
            (r) => r.toLowerCase() === String(role).trim().toLowerCase(),
          );
          if (matchedRole) {
            finalRole = matchedRole;
          } else {
            warnings.push(
              `Chức vụ '${role}' không chuẩn, tự động chuyển về 'Đoàn viên'`,
            );
          }
        }

        dbRecord = {
          hoTen: name ? String(name).trim() : "",
          ngaySinh: parseExcelDate(dob),
          soDienThoai: phone ? String(phone).trim() : "",
          email: email ? String(email).trim() : "",
          chiDoanId,
          ngayVaoDoan: parseExcelDate(joinDate),
          trangThai: finalRole,
          _displayName: name,
          _displayGroup: branchName,
          _displayRole: finalRole,
        };
      } else if (type === "bch") {
        const name = row["Họ và tên"] || row["hoTen"] || row["Họ tên"];
        const role = row["Chức vụ"] || row["chucVu"];
        const phone = row["Số điện thoại"] || row["soDienThoai"] || row["SĐT"];
        const email = row["Email"];
        const task =
          row["Nhiệm vụ phân công"] || row["nhiemVu"] || row["Nhiệm vụ"];
        const avatar = row["Ảnh đại diện (URL)"] || row["anhDaiDien"];

        if (!name || !String(name).trim()) {
          errors.push("Thiếu họ và tên");
        }
        if (!role || !String(role).trim()) {
          errors.push("Thiếu chức vụ");
        }
        if (!phone || !String(phone).trim()) {
          errors.push("Thiếu số điện thoại");
        }
        if (!email || !String(email).trim()) {
          errors.push("Thiếu email");
        }

        // Map chucVu string to int
        let chucVuCode = 4;
        if (role) {
          const strRole = String(role).trim().toLowerCase();
          if (strRole.includes("phó bí thư")) {
            chucVuCode = 2;
          } else if (strRole.includes("bí thư")) {
            chucVuCode = 1;
          } else if (strRole.includes("thường vụ")) {
            chucVuCode = 3;
          } else if (
            strRole.includes("chấp hành") ||
            strRole.includes("ủy viên")
          ) {
            chucVuCode = 4;
          } else {
            warnings.push(
              `Chức vụ '${role}' lạ, tự động xếp vào 'Ủy viên Ban Chấp hành'`,
            );
          }
        }

        dbRecord = {
          hoTen: name ? String(name).trim() : "",
          chucVu: chucVuCode,
          soDienThoai: phone ? String(phone).trim() : "",
          email: email ? String(email).trim() : "",
          nhiemVu: task ? String(task).trim() : "",
          anhDaiDien: avatar ? String(avatar).trim() : "",
          // display info
          _displayName: name,
          _displayGroup: role,
        };
      }

      return {
        index: idx + 1,
        errors,
        warnings,
        isValid: errors.length === 0,
        dbRecord,
      };
    });

    setValidatedData(validated);
  };

  // Handle File upload change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Smart header index detection to support title/instruction rows
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        let headerIndex = 0;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i];
          if (!row) continue;
          let isHeader = false;
          if (type === "branches") {
            isHeader = row.some((cell) => {
              const val = String(cell || "")
                .trim()
                .toLowerCase();
              return (
                val.includes("tên chi đoàn") ||
                val.includes("phân loại chi đoàn")
              );
            });
          } else if (type === "members") {
            isHeader = row.some((cell) => {
              const val = String(cell || "")
                .trim()
                .toLowerCase();
              return (
                val.includes("họ và tên") ||
                val.includes("chi đoàn sinh hoạt") ||
                val.includes("ngày sinh")
              );
            });
          } else if (type === "bch") {
            isHeader = row.some((cell) => {
              const val = String(cell || "")
                .trim()
                .toLowerCase();
              return (
                val.includes("họ và tên") ||
                val.includes("chức vụ") ||
                val.includes("nhiệm vụ phân công")
              );
            });
          }
          if (isHeader) {
            headerIndex = i;
            break;
          }
        }

        const json = XLSX.utils.sheet_to_json(sheet, { range: headerIndex });
        processParsedData(json);
      } catch (err) {
        console.error("Error reading excel file:", err);
        setErrorMsg(
          "Không thể đọc file Excel này. Vui lòng đảm bảo file đúng định dạng.",
        );
        setValidatedData([]);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Simulate input event
      const container = new DataTransfer();
      container.items.add(droppedFile);
      if (fileInputRef.current) {
        fileInputRef.current.files = container.files;
        handleFileChange({ target: { files: container.files } });
      }
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Submit data
  const handleImportSubmit = () => {
    const validRecords = validatedData
      .filter((item) => item.isValid)
      .map((item) => item.dbRecord);

    if (validRecords.length === 0) {
      alert("Không có dữ liệu hợp lệ để import! Vui lòng kiểm tra lại file.");
      return;
    }

    const invalidCount = validatedData.length - validRecords.length;
    if (invalidCount > 0) {
      const confirmStr = `Có ${invalidCount} dòng dữ liệu bị lỗi và sẽ bị BỎ QUA. Hệ thống chỉ thực hiện import ${validRecords.length} dòng hợp lệ.\nBạn có đồng ý tiếp tục?`;
      if (!window.confirm(confirmStr)) {
        return;
      }
    }

    setIsImporting(true);
    let targetUrl = "";
    if (type === "branches") targetUrl = "/api/chiDoan/bulk";
    else if (type === "members") targetUrl = "/api/doanVien/bulk";
    else if (type === "bch") targetUrl = "/api/thanhVienBch/bulk";

    apiService
      .post(targetUrl, { list: validRecords }, false)
      .then((res) => {
        alert(res.message || "Import dữ liệu thành công!");
        setIsImporting(false);
        setFile(null);
        setValidatedData([]);
        onSuccess();
        onClose();
      })
      .catch((err) => {
        console.error("Import bulk error:", err);
        setIsImporting(false);
      });
  };

  const resetState = () => {
    setFile(null);
    setValidatedData([]);
    setErrorMsg("");
  };

  const validCount = validatedData.filter((i) => i.isValid).length;
  const invalidCount = validatedData.length - validCount;
  const totalCount = validatedData.length;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="modal-container card animate-fade-in"
        style={{ maxWidth: "750px", width: "95%" }}
      >
        <div
          className="modal-header"
          style={{ paddingBottom: "12px", borderBottom: "1px solid #e2e8f0" }}
        >
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: 0,
            }}
          >
            <span>{currentInfo.title}</span>
          </h3>
          <button
            className="modal-close"
            onClick={() => {
              resetState();
              onClose();
            }}
            style={{ fontSize: "1.5rem" }}
          >
            ×
          </button>
        </div>

        <div className="modal-body" style={{ padding: "20px 0" }}>
          {/* Instructions */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              backgroundColor: "#f7fafc",
              padding: "12px 15px",
              borderRadius: "6px",
              borderLeft: "4px solid var(--primary)",
              marginBottom: "20px",
              fontSize: "0.88rem",
              lineHeight: "1.4",
              color: "#4a5568",
            }}
          >
            <Info
              size={18}
              style={{
                color: "var(--primary)",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <div>
              <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>
                Hướng dẫn Import Excel:
              </p>
              <p style={{ margin: "0 0 10px 0" }}>{currentInfo.desc}</p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleDownloadTemplate}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                  backgroundColor: "#fff",
                }}
              >
                <Download size={14} />
                <span>Tải File Excel Mẫu (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleTriggerUpload}
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "8px",
                padding: "30px 20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: "#f8fafc",
                transition: "all 0.2s ease",
              }}
              className="dropzone-area"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Upload
                size={36}
                style={{ color: "#64748b", marginBottom: "10px" }}
              />
              <p
                style={{
                  fontWeight: 600,
                  margin: "0 0 5px 0",
                  color: "#334155",
                }}
              >
                Kéo thả file Excel vào đây hoặc click để chọn file
              </p>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                Hỗ trợ định dạng .xlsx, .xls tối đa 10MB
              </p>
            </div>
          ) : (
            <div>
              {/* File Info block */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 15px",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "6px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <CheckCircle size={18} style={{ color: "#22c55e" }} />
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "#1e293b",
                    }}
                  >
                    {file.name}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  <X size={14} /> Thay file khác
                </button>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#b91c1c",
                    padding: "10px 15px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    marginBottom: "15px",
                    fontWeight: 500,
                  }}
                >
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Status Counters */}
              {!errorMsg && totalCount > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "15px",
                    fontSize: "0.85rem",
                  }}
                >
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      backgroundColor: "#f1f5f9",
                      fontWeight: 600,
                    }}
                  >
                    Tổng cộng: {totalCount} dòng
                  </span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      fontWeight: 600,
                    }}
                  >
                    Hợp lệ: {validCount} dòng
                  </span>
                  {invalidCount > 0 && (
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "4px",
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        fontWeight: 600,
                      }}
                    >
                      Bị lỗi: {invalidCount} dòng
                    </span>
                  )}
                </div>
              )}

              {/* Preview Table */}
              {!errorMsg && validatedData.length > 0 && (
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Bản xem trước dữ liệu:
                  </p>
                  <Table
                    columns={[
                      {
                        title: "Dòng",
                        dataIndex: "index",
                        width: "60px",
                        align: "center",
                      },
                      {
                        title: "Tên / Họ tên",
                        render: (_, record) => record.dbRecord._displayName || "---",
                      },
                      {
                        title:
                          type === "branches"
                            ? "Phân loại"
                            : type === "members"
                              ? "Chi đoàn sinh hoạt"
                              : "Chức vụ",
                        render: (_, record) => record.dbRecord._displayGroup || "---",
                      },
                      ...(type === "members"
                        ? [
                            {
                              title: "Chức vụ",
                              render: (_, record) => record.dbRecord._displayRole || "---",
                            },
                          ]
                        : []),
                      {
                        title: "Trạng thái kiểm tra",
                        width: "200px",
                        render: (_, record) => (
                          <div>
                            {record.isValid ? (
                              <span
                                style={{
                                  color: "#166534",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontWeight: 600,
                                }}
                              >
                                <CheckCircle size={12} /> Hợp lệ
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "#991b1b",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontWeight: 600,
                                }}
                                title={record.errors.join("\n")}
                              >
                                <AlertTriangle size={12} /> {record.errors[0]}
                              </span>
                            )}
                            {record.warnings.length > 0 && (
                              <div
                                style={{
                                  color: "#9a3412",
                                  fontSize: "0.7rem",
                                  marginTop: "2px",
                                }}
                              >
                                ⚠️ {record.warnings.join(", ")}
                              </div>
                            )}
                          </div>
                        ),
                      },
                    ]}
                    data={validatedData}
                    height="320px"
                    pagination
                    pageSize={10}
                    rowStyle={(record) => ({
                      backgroundColor: record.isValid ? "#fff" : "#fff5f5",
                    })}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="modal-actions"
          style={{
            paddingTop: "15px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              resetState();
              onClose();
            }}
            disabled={isImporting}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleImportSubmit}
            disabled={
              isImporting ||
              !file ||
              validatedData.length === 0 ||
              validCount === 0
            }
          >
            {isImporting
              ? "Đang xử lý..."
              : `Xác nhận Import (${validCount} dòng)`}
          </button>
        </div>
      </div>
    </div>
  );
}
