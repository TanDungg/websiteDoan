import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import GioiThieu from "./pages/GioiThieu/GioiThieu";
import BaiViet from "./pages/BaiViet/BaiViet";
import ChiTietBaiViet from "./pages/ChiTietBaiViet/ChiTietBaiViet";
import VanBan from "./pages/VanBan/VanBan";
import AlbumAnh from "./pages/AlbumAnh/AlbumAnh";
import LienHe from "./pages/LienHe/LienHe";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";

// Layout wrapper for reader (client-side pages)
function ClientLayout({ children }) {
  return (
    <div className="app-client-layout">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    let tabId = sessionStorage.getItem("realtimeTabId");
    if (!tabId) {
      tabId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("realtimeTabId", tabId);
    }

    const eventSource = new EventSource(`/api/realtime?tabId=${tabId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.target) {
          const refreshEvent = new CustomEvent("realtime-refresh", {
            detail: { target: data.target },
          });
          window.dispatchEvent(refreshEvent);
        }
      } catch (err) {
        // Silently ignore ping comments or malformed data
      }
    };

    eventSource.onerror = () => {
      console.warn("[Realtime] EventSource disconnected. Reconnecting automatically...");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <Routes>
      {/* Admin Panel Routes - No client wrapper */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Client Facing News Portal Routes - with Header & Footer */}
      <Route
        path="/"
        element={
          <ClientLayout>
            <Home />
          </ClientLayout>
        }
      />
      <Route
        path="/gioi-thieu"
        element={
          <ClientLayout>
            <GioiThieu />
          </ClientLayout>
        }
      />
      <Route
        path="/tin-tuc"
        element={
          <ClientLayout>
            <BaiViet />
          </ClientLayout>
        }
      />
      <Route
        path="/tin-tuc/:id"
        element={
          <ClientLayout>
            <ChiTietBaiViet />
          </ClientLayout>
        }
      />
      <Route
        path="/van-ban"
        element={
          <ClientLayout>
            <VanBan />
          </ClientLayout>
        }
      />
      <Route
        path="/thu-vien"
        element={
          <ClientLayout>
            <AlbumAnh />
          </ClientLayout>
        }
      />
      <Route
        path="/lien-he"
        element={
          <ClientLayout>
            <LienHe />
          </ClientLayout>
        }
      />
    </Routes>
  );
}
