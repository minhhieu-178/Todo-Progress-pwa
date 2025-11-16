import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
      <Route path="/board/:id" element={<MainLayout><BoardPage /></MainLayout>} />
      <Route path="/analytics" element={<MainLayout><div>Analytics Page</div></MainLayout>} />
      <Route path="/settings" element={<MainLayout><div>Settings Page</div></MainLayout>} />
    </Routes>
  );
}

export default App;