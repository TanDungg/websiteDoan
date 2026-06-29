import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    unit: 'Chi đoàn Thôn Tam Anh 1',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const unitsList = [
    'Chi đoàn Thôn Tam Anh 1',
    'Chi đoàn Thôn Tam Anh 2',
    'Chi đoàn Thôn Tam Anh 3',
    'Chi đoàn Thôn Tam Anh 4',
    'Chi đoàn Thôn Tam Anh 5',
    'Chi đoàn Công an xã',
    'Chi đoàn Quân sự xã',
    'Chi đoàn Trường Tiểu học',
    'Chi đoàn Trường THCS',
    'Chi đoàn Mầm non',
    'Khác / Không sinh hoạt'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.trim())) {
      tempErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
    }
    if (!formData.subject.trim()) tempErrors.subject = 'Vui lòng nhập tiêu đề góp ý';
    if (!formData.message.trim()) tempErrors.message = 'Vui lòng nhập nội dung góp ý';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      fetch('/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsSubmitted(true);
          setFormData({
            fullName: '',
            phone: '',
            email: '',
            unit: 'Chi đoàn Thôn Tam Anh 1',
            subject: '',
            message: ''
          });
        } else {
          alert('Có lỗi xảy ra khi gửi góp ý, vui lòng thử lại!');
        }
      })
      .catch((err) => {
        console.error("Feedback submit error:", err);
        alert('Không thể kết nối đến máy chủ!');
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
            <div className="contact-card-info card">
              <MapPin className="card-icon" />
              <div>
                <h3>Địa chỉ trụ sở</h3>
                <p>UBND xã Tam Anh, Huyện Hòa Vang, Thành phố Đà Nẵng</p>
              </div>
            </div>

            <div className="contact-card-info card">
              <Phone className="card-icon" />
              <div>
                <h3>Điện thoại liên hệ</h3>
                <p>0236.3845.xxx (Văn phòng Đoàn)</p>
                <p>0905.123.xxx (Bí thư Đoàn xã)</p>
              </div>
            </div>

            <div className="contact-card-info card">
              <Mail className="card-icon" />
              <div>
                <h3>Hộp thư điện tử</h3>
                <p>doantn.tamanh@danang.gov.vn</p>
              </div>
            </div>

            <div className="contact-card-info card">
              <Clock className="card-icon" />
              <div>
                <h3>Giờ làm việc văn phòng</h3>
                <p>Thứ 2 - Thứ 6 (Sáng: 7h30 - 11h30 | Chiều: 13h30 - 17h00)</p>
              </div>
            </div>
          </div>

          {/* Interactive Map (iframe) */}
          <div className="map-wrapper card">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.733298495079!2d108.18820461433604!3d15.975306346176501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142023d8c1c5e6d%3A0x6b4457db2d37c86a!2zVUIgTmjDom4gRMOibiBYw6MgSG_DoCBQaGْEsIEjDsmEgVmFuZywgxJDDoCBO4bq5bmc!5e0!3m2!1svi!2s!4v1655000000000!5m2!1svi!2s" 
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
              <p>Cảm ơn bạn đã gửi ý kiến đóng góp. Ban Chấp hành Đoàn xã Tam Anh sẽ tiếp thu, xử lý phản hồi và liên hệ lại trong thời gian sớm nhất.</p>
              <button className="btn btn-primary" onClick={() => setIsSubmitted(false)}>
                Gửi góp ý mới
              </button>
            </div>
          ) : (
            <>
              <h2>Gửi phản hồi / Góp ý trực tuyến</h2>
              <p className="form-subtitle">Chúng tôi luôn lắng nghe những ý kiến đóng góp xây dựng phong trào từ đoàn viên thanh niên và nhân dân.</p>
              
              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input
                      type="text"
                      name="fullName"
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                      placeholder="Nhập họ tên của bạn..."
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                    {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số điện thoại *</label>
                    <input
                      type="text"
                      name="phone"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="Nhập số điện thoại..."
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label">Hộp thư điện tử (Email)</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chi đoàn sinh hoạt</label>
                    <select
                      name="unit"
                      className="form-control"
                      value={formData.unit}
                      onChange={handleInputChange}
                    >
                      {unitsList.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tiêu đề góp ý *</label>
                  <input
                    type="text"
                    name="subject"
                    className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                    placeholder="Vấn đề bạn muốn góp ý..."
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                  {errors.subject && <span className="error-text">{errors.subject}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung chi tiết *</label>
                  <textarea
                    name="message"
                    className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                    placeholder="Nhập nội dung chi tiết tại đây..."
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                <button type="submit" className="btn btn-primary submit-form-btn">
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
