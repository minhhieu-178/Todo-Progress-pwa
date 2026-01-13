# Task Manager PWA

Ứng dụng quản lý công việc với PWA, hỗ trợ offline và realtime.

## Tính năng chính

- PWA: Offline mode, Push notifications, Installable app
- Quản lý: Boards, Lists, Cards, Drag & Drop
- Realtime: Socket.IO đồng bộ tức thì
- Bảo mật: JWT, bcrypt, helmet, rate limiting
- Dark mode và responsive

## Tech Stack

**Frontend:** React 19, Vite, TailwindCSS, Workbox, IndexedDB, Socket.IO Client

**Backend:** Node.js, Express, MongoDB, Socket.IO, JWT, Cloudinary, SendGrid

## Cài đặt

### 1. Clone và cài dependencies
```bash
git clone <repo-url>
cd task-manager-pwa

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Cấu hình .env

**server/.env**
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
SENDGRID_API_KEY=your_key
FROM_EMAIL=noreply@yourdomain.com
VAPID_PUBLIC_KEY=your_key
VAPID_PRIVATE_KEY=your_key
```

**client/.env**
```env
VITE_API_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_id
VITE_VAPID_PUBLIC_KEY=your_key
```

### 3. Chạy app

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Cấu trúc

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── sw.js    # Service Worker
│   └── public/
├── server/          # Node.js backend
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── server.js
└── README.md
```

## API chính

- `POST /api/auth/login` - Đăng nhập
- `GET /api/boards` - Lấy boards
- `POST /api/boards` - Tạo board
- `GET /api/boards/:id` - Chi tiết board
- `POST /api/boards/:boardId/lists/:listId/cards` - Tạo card
- `PUT /api/cards/:id` - Cập nhật card
- `GET /api/notifications` - Lấy thông báo

## PWA Features

- Service Worker cache assets và API
- IndexedDB lưu offline queue
- Background Sync tự động đồng bộ
- Push notifications với Firebase
- Cài đặt như native app

## Deploy

**Backend:** Render/Railway + MongoDB Atlas

**Frontend:** Vercel/Netlify

## License

MIT
