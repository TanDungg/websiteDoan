import React from "react";
import {
  Users,
  Flag,
  Heart,
  Zap,
  Award,
  GraduationCap,
  Briefcase,
} from "lucide-react";

export default function PhongTraoChuongTrinh() {
  return (
    <div className="movements-programs-section">
      <div
        className="showcase-section-header"
        style={{ marginBottom: "24px" }}
      >
        <Users size={20} className="header-icon-blue" />
        <h3 className="showcase-section-title">
          Phong trào hành động & Chương trình đồng hành
        </h3>
      </div>
      <div className="movements-columns-grid">
        {/* Column 1: 3 Phong trào */}
        <div className="movements-col-card card">
          <div className="col-header-bar blue">
            <Flag size={18} />
            <h4>3 Phong trào hành động cách mạng</h4>
          </div>
          <div className="col-body-list">
            <div className="movement-action-card">
              <div className="action-icon-circle blue">
                <Heart size={16} />
              </div>
              <div className="action-card-text">
                <h5>Thanh niên tình nguyện</h5>
                <p>
                  Các hoạt động tình nguyện vì an sinh xã hội, bảo vệ môi
                  trường, hiến máu nhân đạo.
                </p>
              </div>
            </div>

            <div className="movement-action-card">
              <div className="action-icon-circle orange">
                <Zap size={16} />
              </div>
              <div className="action-card-text">
                <h5>Tuổi trẻ sáng tạo</h5>
                <p>
                  Khuyến khích sáng kiến, nghiên cứu khoa học, cải tiến kỹ thuật
                  trong học tập và lao động.
                </p>
              </div>
            </div>

            <div className="movement-action-card">
              <div className="action-icon-circle red">
                <Award size={16} />
              </div>
              <div className="action-card-text">
                <h5>Tuổi trẻ xung kích bảo vệ Tổ quốc</h5>
                <p>
                  Tham gia bảo vệ an ninh trật tự, tuyên truyền luật nghĩa vụ
                  quân sự và hậu phương quân đội.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: 3 Chương trình */}
        <div className="movements-col-card card">
          <div className="col-header-bar orange">
            <Users size={18} />
            <h4>3 Chương trình đồng hành với thanh niên</h4>
          </div>
          <div className="col-body-list">
            <div className="movement-action-card">
              <div className="action-icon-circle blue">
                <GraduationCap size={16} />
              </div>
              <div className="action-card-text">
                <h5>Đồng hành trong học tập</h5>
                <p>
                  Quỹ khuyến học, các chuyên đề học thuật, tư vấn mùa thi và
                  nâng cao trình độ học văn.
                </p>
              </div>
            </div>

            <div className="movement-action-card">
              <div className="action-icon-circle orange">
                <Briefcase size={16} />
              </div>
              <div className="action-card-text">
                <h5>Đồng hành trong khởi nghiệp, lập nghiệp</h5>
                <p>
                  Hỗ trợ vay vốn, tập huấn kỹ năng nông nghiệp công nghệ cao và
                  kết nối việc làm.
                </p>
              </div>
            </div>

            <div className="movement-action-card">
              <div className="action-icon-circle red">
                <Users size={16} />
              </div>
              <div className="action-card-text">
                <h5>Đồng hành phát triển kỹ năng xã hội</h5>
                <p>
                  Rèn luyện kỹ năng mềm, tổ chức hội thao, giao lưu văn nghệ và
                  chăm sóc sức khỏe thể chất.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
