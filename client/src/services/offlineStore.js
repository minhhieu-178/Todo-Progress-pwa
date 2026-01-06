import { openDB } from 'idb';

const DB_NAME = 'offline-requests-db';
const STORE_NAME = 'requests';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    // Tạo store với key tự động tăng
    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
  },
});

// Helper: Chuyển FormData sang Object đơn thuần để lưu vào IDB
const serializeFormData = (formData) => {
  const obj = {};
  for (const [key, value] of formData.entries()) {
    obj[key] = value; // IndexedDB hỗ trợ lưu File/Blob trực tiếp
  }
  return obj;
};

export const saveOfflineRequest = async (url, method, data, token) => {
  const db = await dbPromise;
  
  let body = data;
  let isFormData = false;

  // Nếu là FormData (upload ảnh), cần serialize
  if (data instanceof FormData) {
    body = serializeFormData(data);
    isFormData = true;
  }

  const requestRecord = {
    url,
    method,
    body,
    headers: {
        // Lưu token vào DB vì SW không đọc được localStorage
        'Authorization': `Bearer ${token}`, 
        // Nếu là JSON thì thêm Content-Type, FormData để trình duyệt tự xử lý boundary
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }) 
    },
    isFormData, 
    timestamp: Date.now(), // Tag thời gian như bạn yêu cầu
    retryCount: 0
  };

  return db.add(STORE_NAME, requestRecord);
};

// Hàm này để Service Worker dùng (Lấy tất cả request đang chờ)
export const getAllOfflineRequests = async () => {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

// Hàm xóa request sau khi gửi thành công
export const deleteOfflineRequest = async (id) => {
  const db = await dbPromise;
  return db.delete(STORE_NAME, id);
};