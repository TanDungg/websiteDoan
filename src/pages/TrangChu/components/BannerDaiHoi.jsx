import React from "react";
import { Award } from "lucide-react";

export default function BannerDaiHoi({ congressTitle, congressSlogan }) {
  return (
    <div className="congress-campaign-banner card">
      <div className="congress-banner-backdrop">
        <Award size={48} className="congress-backdrop-award" />
      </div>
      <div className="congress-banner-body">
        <span className="congress-banner-pre">
          Đoàn TNCS Hồ Chí Minh Xã Tam Anh
        </span>
        <h4 className="congress-banner-title">{congressTitle}</h4>
        <p className="congress-banner-slogan">
          &quot;{congressSlogan}&quot;
        </p>
      </div>
    </div>
  );
}
