import React, { useEffect } from 'react'; // 1. Import useEffect
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // 2. Import useAuth
import { registerPushNotification } from './services/pwaService'; // 3. Import service

import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import UserProfilePage from './pages/UserProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SettingPage from './pages/SettingPage';
import BoardListPage from './pages/BoardListPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const { user } = useAuth(); 
  useEffect(() => {
    if (user) {
      registerPushNotification().catch(console.error);
    }
  }, [user]); 

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
      <Route path="/board/:id" element={<MainLayout><BoardPage /></MainLayout>} />
      <Route path="/analytics" element={<MainLayout><AnalyticsPage /></MainLayout>} />

      <Route path="/settings" element={<MainLayout><SettingPage /></MainLayout>} />
      <Route path="/profile" element={<MainLayout><UserProfilePage /></MainLayout>} />
      <Route path="/boards" element={<MainLayout><BoardListPage /></MainLayout>}  />
    </Routes>
  );
}

export default App;