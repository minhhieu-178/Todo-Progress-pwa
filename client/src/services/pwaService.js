import api from './api'; 

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker đã đăng ký thành công:', registration);
      return registration;
    } catch (error) {
      console.error('Lỗi đăng ký Service Worker:', error);
    }
  } else {
    console.log('Trình duyệt không hỗ trợ Service Worker');
  }
};

export const registerPushNotification = async () => {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Bạn cần cấp quyền thông báo để nhận tin tức!');
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    console.log('Đã tạo subscription:', subscription);
    await api.post('/users/subscribe', subscription);
    
    console.log('Push subscription saved to DB success!');
    return subscription;
    
  } catch (error) {
    console.error('Error registering push:', error);
  }
};

export const registerBackgroundSync = async (tag) => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
  }
};