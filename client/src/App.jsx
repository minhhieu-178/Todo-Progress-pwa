import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Chúng ta sẽ tạo các trang này ở bước tiếp theo
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import DashboardPage from './pages/DashboardPage';
// import BoardPage from './pages/BoardPage';
// import ProtectedRoute from './router/ProtectedRoute';

function App() {
  return (
    <div className="w-screen h-screen bg-gray-100">
      <Routes>
        {/* Các Route công khai */}
        <Route path="/login" element={<div>Trang Login (sẽ làm)</div>} />
        <Route path="/register" element={<div>Trang Register (sẽ làm)</div>} />

        {/* Các Route được bảo vệ (sẽ làm) */}
        {/* <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /> */}
        {/* <Route path="/board/:id" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} /> */}
        
        {/* Route mặc định (tạm thời) */}
        <Route path="/" element={<div>Trang chủ (sẽ là Dashboard)</div>} />
      </Routes>
    </div>
  );
}

export default App;