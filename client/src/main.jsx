import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import { ThemeProvider } from './context/ThemeContext';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './index.css';
registerSW({ immediate: true });
// Auto re-register background sync when the app comes online
const tryRegisterSync = async () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register('sync-offline-requests');
      console.log('[Client] Registered background sync: sync-offline-requests');
    } catch (e) {
      console.warn('[Client] Failed to register background sync', e);
    }
  }
};

window.addEventListener('online', () => {
  console.log('[Client] network online — attempting to register background sync');
  tryRegisterSync();
});

// Listen to messages from the service worker (e.g., auth-required during sync)
if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('message', (evt) => {
    const data = evt.data;
    
    // Handle token request from Service Worker
    if (data && data.type === 'GET_TOKEN') {
      const token = localStorage.getItem('accessToken');
      if (evt.source) {
        evt.source.postMessage({
          type: 'TOKEN_RESPONSE',
          token: token
        });
      }
      return;
    }
    
    if (data && data.type === 'OFFLINE_SYNC_AUTH_REQUIRED') {
        // Try a silent token refresh (server should set refresh-cookie and return new access token)
        (async () => {
          try {
            const refreshUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`;
            const resp = await fetch(refreshUrl, { method: 'POST', credentials: 'include' });
            if (resp.ok) {
              const json = await resp.json();
              if (json?.accessToken) {
                localStorage.setItem('accessToken', json.accessToken);
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                  try {
                    const parsed = JSON.parse(userInfo);
                    parsed.accessToken = json.accessToken;
                    localStorage.setItem('userInfo', JSON.stringify(parsed));
                  } catch (e) { /* ignore */ }
                }
                // Re-register background sync to trigger SW to retry queued requests
                await tryRegisterSync();
                console.log('[Client] Silent refresh succeeded, re-registered sync.');
                return;
              }
            }
          } catch (e) {
            console.warn('[Client] Silent refresh failed', e);
          }

          // If refresh fails, fall back to prompting the user to re-login
          try {
            // eslint-disable-next-line no-alert
            alert('Phiên đăng nhập cần làm mới để đồng bộ các thay đổi offline. Vui lòng đăng nhập lại.');
          } catch (e) {
            console.warn('[Client] SW requested auth refresh');
          }
        })();
    }
  });
}
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