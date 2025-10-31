import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <--- IMPORT
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>      {/* Bọc ngoài cùng */}
      <AuthProvider>     {/* Bọc bên trong Router */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);