import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import './AdminLogin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('tamanh_admin_session');
    if (isLoggedIn === 'active') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username.trim(), password: password.trim() })
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        localStorage.setItem('tamanh_admin_session', 'active');
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Tài khoản hoặc mật khẩu quản trị viên không chính xác!');
      }
    })
    .catch((err) => {
      console.error("Login error:", err);
      setError('Không thể kết nối đến máy chủ API backend!');
    });
  };

  return (
    <div className="login-wrapper">
      <LinkToHome />
      <div className="login-card card">
        <div className="login-logo">
          <span>🇻🇳</span>
        </div>
        <h2>Quản trị hệ thống</h2>
        <p className="login-subtitle">Đoàn xã Tam Anh - TP. Đà Nẵng</p>

        {error && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Tài khoản quản trị</label>
            <div className="input-icon-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="form-control login-input"
                placeholder="Nhập tên đăng nhập..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-control login-input"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-submit-btn">
            Đăng nhập hệ thống
          </button>
        </form>
      </div>
    </div>
  );
}

function LinkToHome() {
  return (
    <a href="/" className="back-to-home-link">
      <ArrowLeft size={16} />
      <span>Về trang chủ</span>
    </a>
  );
}
