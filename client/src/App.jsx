import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
//import BoardPage from './pages/BoardPage';
import ProtectedRoute from './router/ProtectedRoute';

function App() {
  return (
    <div className="w-screen h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /> 
      </Routes>
    </div>
  );
}

export default App;
