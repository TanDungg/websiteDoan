import React, { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { FormItem } from "src/components";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    unit: "Chi đoàn Thôn Tam Anh 1",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bchContacts, setBchContacts] = useState([]);

  useEffect(() => {
    fetch("/api/intro")
      .then((res) => res.json())
      .then((data) => {
        if (data.bchMembers) {
          const contacts = data.bchMembers.filter((m) => m.phone && m.phone.trim());
          setBchContacts(contacts);
        }
      })
      .catch((err) => console.error("Failed to load contacts for Contact page:", err));
  }, []);

  const unitsList = [
    "Chi đoàn Thôn Tam Anh 1",
    "Chi đoàn Thôn Tam Anh 2",
    "Chi đoàn Thôn Tam Anh 3",
    "Chi đoàn Thôn Tam Anh 4",
    "Chi đoàn Thôn Tam Anh 5",
    "Chi đoàn Công an xã",
    "Chi đoàn Quân sự xã",
    "Chi đoàn Trường Tiểu học",
    "Chi đoàn Trường THCS",
    "Chi đoàn Mầm non",
    "Khác / Không sinh hoạt",
  ];

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.fullName.trim())
      tempErrors.fullName = "Vui lòng nhập họ và tên";
    if (!formData.phone.trim()) {
      tempErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.trim())) {
      tempErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    }
    if (!formData.subject.trim())
      tempErrors.subject = "Vui lòng nhập tiêu đề góp ý";
    if (!formData.message.trim())
      tempErrors.message = "Vui lòng nhập nội dung góp ý";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      fetch("/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsSubmitted(true);
            setFormData({
              fullName: "",
              phone: "",
              email: "",
              unit: "Chi đoàn Thôn Tam Anh 1",
              subject: "",
              message: "",
            });
          } else {
            alert("Có lỗi xảy ra khi gửi góp ý, vui lòng thử lại!");
          }
        })
        .catch((err) => {
          console.error("Feedback submit error:", err);
          alert("Không thể kết nối đến máy chủ!");
        });
    }
  };

  return (
    <div className="contact-page container">
      <h1 className="section-title">Liên hệ & Ý kiến đóng góp</h1>

      <div className="contact-grid">
        {/* Contact info and Map */}
        <div className="contact-info-column">
          <div className="info-cards-grid">
            <div className="contact-card-info card address-card">
              <MapPin className="card-icon" />
              <div className="card-info-content">
                <h3>Địa chỉ trụ sở</h3>
                <div className="contact-card-lines">
                  <div className="contact-card-line">
                    <span className="val text-highlight">UBND xã Tam Anh</span>
                    <span className="divider">•</span>
                    <span className="val">Thành phố Đà Nẵng</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-card-info card phone-card">
              <Phone className="card-icon" />
              <div className="card-info-content">
                <h3>Điện thoại liên hệ</h3>
                <div className="contact-card-lines">
                  {bchContacts.length > 0 ? (
                    bchContacts.map((contact) => (
                      <div key={contact.id} className="contact-card-line">
                        <span className="label">{contact.position}:</span>
                        <a
                          href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                          className="val"
                        >
                          {contact.phone}
                        </a>
                        <span className="divider">•</span>
                        <span className="val">{contact.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="contact-card-line">
                      <span className="val" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                        (Thông tin liên hệ đang cập nhật)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="contact-card-info card email-card">
              <Mail className="card-icon" />
              <div className="card-info-content">
                <h3>Hộp thư điện tử</h3>
                <div className="contact-card-lines">
                  <div className="contact-card-line">
                    <a
                      href="mailto:doantn.tamanh@danang.gov.vn"
                      className="val email-val"
                    >
                      doantn.tamanh@danang.gov.vn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-card-info card worktime-card">
              <Clock className="card-icon" />
              <div className="card-info-content">
                <h3>Giờ làm việc</h3>
                <div className="contact-card-lines">
                  <div className="contact-card-line">
                    <span className="val text-highlight">Thứ 2 - Thứ 6</span>
                    <span className="divider">•</span>
                    <span className="label">Sáng:</span>
                    <span className="val">7h30 - 11h30</span>
                    <span className="divider">|</span>
                    <span className="label">Chiều:</span>
                    <span className="val">13h30 - 17h00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map (iframe) */}
          <div className="map-wrapper card">
            <iframe
              src="https://maps.google.com/maps?q=UBND%20x%C3%A3%20Tam%20Anh%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Bản đồ xã Tam Anh Đà Nẵng"
            ></iframe>
          </div>
        </div>

        {/* Feedback form */}
        <div className="contact-form-column card">
          {isSubmitted ? (
            <div className="submit-success-state">
              <CheckCircle2 size={64} className="success-icon" />
              <h2>Gửi đóng góp thành công!</h2>
              <p>
                Cảm ơn bạn đã gửi ý kiến đóng góp. Ban Chấp hành Đoàn xã Tam Anh
                sẽ tiếp thu, xử lý phản hồi và liên hệ lại trong thời gian sớm
                nhất.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setIsSubmitted(false)}
              >
                Gửi góp ý mới
              </button>
            </div>
          ) : (
            <>
              <h2>Gửi phản hồi / Góp ý trực tuyến</h2>
              <p className="form-subtitle">
                Chúng tôi luôn lắng nghe những ý kiến đóng góp xây dựng phong
                trào từ đoàn viên thanh niên và nhân dân.
              </p>

              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-row-double">
                  <FormItem
                    label="Họ và tên"
                    type="text"
                    required
                    placeholder="Nhập họ tên của bạn..."
                    className={errors.fullName ? "is-invalid" : ""}
                    value={formData.fullName}
                    onChange={(val) => {
                      setFormData({ ...formData, fullName: val });
                      if (errors.fullName)
                        setErrors({ ...errors, fullName: "" });
                    }}
                  />
                  {errors.fullName && (
                    <span className="error-text">{errors.fullName}</span>
                  )}

                  <FormItem
                    label="Số điện thoại"
                    type="text"
                    required
                    placeholder="Nhập số điện thoại..."
                    className={errors.phone ? "is-invalid" : ""}
                    value={formData.phone}
                    onChange={(val) => {
                      setFormData({ ...formData, phone: val });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                  />
                  {errors.phone && (
                    <span className="error-text">{errors.phone}</span>
                  )}
                </div>

                <div className="form-row-double">
                  <FormItem
                    label="Hộp thư điện tử (Email)"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(val) => setFormData({ ...formData, email: val })}
                  />

                  <FormItem
                    label="Chi đoàn sinh hoạt"
                    type="select"
                    value={formData.unit}
                    onChange={(val) => setFormData({ ...formData, unit: val })}
                    options={unitsList.map((unit) => ({
                      value: unit,
                      label: unit,
                    }))}
                  />
                </div>

                <FormItem
                  label="Tiêu đề góp ý"
                  type="text"
                  required
                  placeholder="Vấn đề bạn muốn góp ý..."
                  className={errors.subject ? "is-invalid" : ""}
                  value={formData.subject}
                  onChange={(val) => {
                    setFormData({ ...formData, subject: val });
                    if (errors.subject) setErrors({ ...errors, subject: "" });
                  }}
                />
                {errors.subject && (
                  <span className="error-text">{errors.subject}</span>
                )}

                <FormItem
                  label="Nội dung chi tiết"
                  type="textarea"
                  required
                  placeholder="Nhập nội dung chi tiết tại đây..."
                  className={errors.message ? "is-invalid" : ""}
                  value={formData.message}
                  onChange={(val) => {
                    setFormData({ ...formData, message: val });
                    if (errors.message) setErrors({ ...errors, message: "" });
                  }}
                />
                {errors.message && (
                  <span className="error-text">{errors.message}</span>
                )}

                <button
                  type="submit"
                  className="btn btn-primary submit-form-btn"
                >
                  <Send size={18} />
                  <span>Gửi góp ý của bạn</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
