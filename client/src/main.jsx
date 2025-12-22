import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import { ThemeProvider } from './context/ThemeContext';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './index.css';
registerSW({ immediate: true });
import { SocketProvider } from './context/SocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);