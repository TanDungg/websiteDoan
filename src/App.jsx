import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Introduction from './pages/Introduction/Introduction';
import News from './pages/News/News';
import NewsDetail from './pages/NewsDetail/NewsDetail';
import Documents from './pages/Documents/Documents';
import Gallery from './pages/Gallery/Gallery';
import Contact from './pages/Contact/Contact';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

// Layout wrapper for reader (client-side pages)
function ClientLayout({ children }) {
  return (
    <div className="app-client-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin Panel Routes - No client wrapper */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Client Facing News Portal Routes - with Header & Footer */}
      <Route path="/" element={<ClientLayout><Home /></ClientLayout>} />
      <Route path="/gioi-thieu" element={<ClientLayout><Introduction /></ClientLayout>} />
      <Route path="/tin-tuc" element={<ClientLayout><News /></ClientLayout>} />
      <Route path="/tin-tuc/:id" element={<ClientLayout><NewsDetail /></ClientLayout>} />
      <Route path="/van-ban" element={<ClientLayout><Documents /></ClientLayout>} />
      <Route path="/thu-vien" element={<ClientLayout><Gallery /></ClientLayout>} />
      <Route path="/lien-he" element={<ClientLayout><Contact /></ClientLayout>} />
    </Routes>
  );
}
