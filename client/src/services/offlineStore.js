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
    // Do not persist Authorization tokens in the offline queue to avoid replaying stale credentials.
    // Instead store a flag so the SW/client can detect that auth is required for this request.
    headers: (() => {
      const h = {};
      // Nếu là JSON thì thêm Content-Type, FormData để trình duyệt tự xử lý boundary
      if (!isFormData) h['Content-Type'] = 'application/json';
      // Mark as offline replay so server knows to ghi log
      h['X-Offline-Replay'] = 'true';
      return h;
    })(),
    authRequired: !!token,
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

// Replace occurrences of a temporary ID with the real ID across all queued requests.
export const replaceTempIdInQueue = async (tempId, realId) => {
  const db = await dbPromise;
  const all = await db.getAll(STORE_NAME);
  for (const r of all) {
    let changed = false;
    let newBody = r.body;
    try {
      if (typeof r.body === 'string') {
        if (r.body.includes(tempId)) {
          const replaced = r.body.split(tempId).join(realId);
          try { newBody = JSON.parse(replaced); } catch (e) { newBody = replaced; }
          changed = true;
        }
      } else if (r.body && typeof r.body === 'object') {
        const s = JSON.stringify(r.body);
        if (s.includes(tempId)) {
          newBody = JSON.parse(s.split(tempId).join(realId));
          changed = true;
        }
      }

      let newUrl = r.url;
      if (r.url && r.url.includes(tempId)) {
        newUrl = r.url.split(tempId).join(realId);
        changed = true;
      }

      if (changed) {
        const newRecord = { ...r, body: newBody, url: newUrl };
        // preserve same id by using put
        await db.put(STORE_NAME, newRecord);
      }
    } catch (e) {
      console.warn('[offlineStore] replaceTempIdInQueue failed for record', r.id, e);
    }
  }
};