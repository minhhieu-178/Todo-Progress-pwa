import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import UserProfilePage from './pages/UserProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
      <Route path="/board/:id" element={<MainLayout><BoardPage /></MainLayout>} />
      <Route path="/analytics" element={<MainLayout><div>Analytics Page</div></MainLayout>} />

      <Route path="/settings" element={<MainLayout><div>Settings Page</div></MainLayout>} />
      <Route path="/profile" element={<MainLayout><UserProfilePage /></MainLayout>} />
    </Routes>
  );
}

export default App;