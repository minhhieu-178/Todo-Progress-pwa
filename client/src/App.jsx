import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 1. Import trang Login
import LoginPage from './pages/LoginPage';

// (Các import khác sẽ thêm sau)
import RegisterPage from './pages/RegisterPage';
// import DashboardPage from './pages/DashboardPage';
// import BoardPage from './pages/BoardPage';
// import ProtectedRoute from './router/ProtectedRoute';

function App() {
  return (
    <div className="w-screen h-screen bg-gray-100">
      <Routes>
        {/* 2. Cập nhật route /login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 3. Cập nhật router /register */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<div>Trang chủ (sẽ là Dashboard)</div>} />
      </Routes>
    </div>
  );
}

export default App;
