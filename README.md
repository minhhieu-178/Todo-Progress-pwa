# Task Manager PWA - Ứng dụng Quản lý Công việc

Ứng dụng web quản lý công việc theo phong cách Trello với đầy đủ tính năng Progressive Web App (PWA), hỗ trợ làm việc offline và đồng bộ dữ liệu tự động.

## Tính năng nổi bật

### Progressive Web App (PWA)
- **Service Worker**: Cache static assets và API responses để truy cập nhanh
- **Offline Mode**: Làm việc hoàn toàn offline, tự động đồng bộ khi có mạng
- **Installable**: Cài đặt như native app trên desktop và mobile
- **Push Notifications**: Nhận thông báo realtime ngay cả khi đóng app
- **IndexedDB**: Lưu trữ dữ liệu local với offline queue thông minh
- **Background Sync**: Đồng bộ dữ liệu tự động khi có kết nối

### Quản lý công việc
- **Boards & Lists**: Tạo và quản lý nhiều board với các list công việc
- **Drag & Drop**: Kéo thả cards giữa các lists
- **Cards**: Tạo, sửa, xóa cards với mô tả chi tiết
- **Labels & Due Dates**: Gắn nhãn màu và deadline cho cards
- **Comments**: Thảo luận trực tiếp trên cards
- **Members**: Mời thành viên và phân quyền (Owner, Member)
- **Attachments**: Upload và quản lý file đính kèm
- **Activity Logs**: Theo dõi lịch sử thay đổi

### Tính năng khác
- **Real-time Updates**: Socket.IO đồng bộ thay đổi tức thì
- **Search**: Tìm kiếm boards, cards, users
- **Analytics**: Thống kê và biểu đồ hiệu suất
- **Dark Mode**: Giao diện sáng/tối với chuyển đổi mượt mà
- **Responsive**: Hoạt động tốt trên mọi thiết bị
- **Security**: JWT authentication, bcrypt, helmet, rate limiting

## Công nghệ sử dụng

### Frontend
- **React 19** - UI library
- **Vite** - Build tool nhanh
- **TailwindCSS 4** - Utility-first CSS
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Workbox** - PWA service worker
- **IndexedDB (idb)** - Local database
- **Lucide React** - Icon library
- **@hello-pangea/dnd** - Drag and drop
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time engine
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **SendGrid** - Email service
- **Web Push** - Push notifications
- **Node Cron** - Scheduled tasks

### Security & Performance
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Express Mongo Sanitize** - NoSQL injection prevention
- **XSS Clean** - XSS protection
- **HPP** - HTTP parameter pollution prevention
- **CORS** - Cross-origin resource sharing

## Cài đặt và Chạy

### Yêu cầu
- Node.js >= 18.x
- MongoDB >= 6.x
- npm hoặc yarn

### 1. Clone repository
```bash
git clone <repository-url>
cd task-manager-pwa
```

### 2. Cài đặt dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 3. Cấu hình môi trường

#### Backend (.env trong thư mục server)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Cloudinary (upload images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid (email)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com

# Web Push (notifications)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your@email.com
```

#### Frontend (.env trong thư mục client)
```env
VITE_API_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 4. Chạy ứng dụng

#### Development mode

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

Truy cập: http://localhost:5173

#### Production build

Backend:
```bash
cd server
npm start
```

Frontend:
```bash
cd client
npm run build
npm run preview
```

## Cấu trúc thư mục

```
task-manager-pwa/
├── client/                    # Frontend React app
│   ├── public/
│   │   ├── icons/            # PWA icons
│   │   └── images/           # Static images
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── board/       # Board-related components
│   │   │   ├── layout/      # Layout components
│   │   │   └── user/        # User components
│   │   ├── context/         # React context (Auth, Theme)
│   │   ├── pages/           # Page components
│   │   ├── router/          # Route configuration
│   │   ├── services/        # API services
│   │   ├── sw.js            # Service Worker
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── vite.config.js       # Vite configuration
│   └── package.json
│
├── server/                   # Backend Node.js app
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── schemas/         # Validation schemas
│   │   ├── services/        # Business logic
│   │   └── server.js        # Entry point
│   └── package.json
│
├── CHUONG_2_KHAO_SAT_PHAN_TICH.md    # Documentation
├── CHUONG_4_KIEN_TRUC_HE_THONG.md
├── CHUONG_4_XAY_DUNG_UNG_DUNG.md
├── CHUONG_5_KET_LUAN.md
├── usecase-diagram.puml              # PlantUML diagrams
├── sequence-pwa-*.puml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `POST /api/auth/verify-email` - Xác thực email

### Users
- `GET /api/users/profile` - Lấy thông tin user
- `PUT /api/users/profile` - Cập nhật profile
- `POST /api/users/subscribe` - Đăng ký push notification

### Boards
- `GET /api/boards` - Lấy danh sách boards
- `POST /api/boards` - Tạo board mới
- `GET /api/boards/:id` - Lấy chi tiết board
- `PUT /api/boards/:id` - Cập nhật board
- `DELETE /api/boards/:id` - Xóa board
- `POST /api/boards/:id/members` - Thêm thành viên
- `DELETE /api/boards/:id/members/:userId` - Xóa thành viên

### Cards
- `POST /api/boards/:boardId/lists/:listId/cards` - Tạo card
- `PUT /api/cards/:id` - Cập nhật card
- `DELETE /api/cards/:id` - Xóa card
- `POST /api/cards/:id/move` - Di chuyển card

### Comments
- `GET /api/comments/card/:cardId` - Lấy comments
- `POST /api/comments` - Tạo comment
- `DELETE /api/comments/:id` - Xóa comment

### Notifications
- `GET /api/notifications` - Lấy thông báo
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc

### Upload
- `POST /api/upload` - Upload file

### Search
- `GET /api/search?q=keyword` - Tìm kiếm

### Analytics
- `GET /api/analytics/boards/:boardId` - Thống kê board

## PWA Features

### Service Worker
Service Worker cache các static assets và API responses, cho phép app hoạt động offline. Sử dụng Workbox với các strategies:
- **NetworkFirst**: API boards (ưu tiên mạng, fallback cache)
- **StaleWhileRevalidate**: API users, background images
- **Precache**: Static assets (HTML, CSS, JS)

### Offline Queue
Khi offline, tất cả mutations (POST, PUT, DELETE) được lưu vào IndexedDB queue. Khi có mạng, Background Sync API tự động replay các requests theo thứ tự.

### Push Notifications
Sử dụng Web Push API và Firebase Cloud Messaging để gửi thông báo:
- Deadline sắp đến hạn
- Được assign vào card
- Comment mới
- Thay đổi board

### Install Prompt
App có thể được cài đặt trên:
- Desktop (Chrome, Edge, Safari)
- Android (Chrome, Samsung Internet)
- iOS (Safari - Add to Home Screen)

## Deployment

### Backend (Render/Railway/Heroku)
1. Push code lên Git repository
2. Tạo web service mới
3. Set environment variables
4. Deploy từ Git branch

### Frontend (Vercel/Netlify)
1. Connect Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variables
5. Deploy

### Database (MongoDB Atlas)
1. Tạo cluster trên MongoDB Atlas
2. Whitelist IP addresses
3. Tạo database user
4. Copy connection string vào MONGO_URI

## Bảo mật

- JWT tokens với expiration
- Password hashing với bcrypt (10 rounds)
- HTTPS only trong production
- Rate limiting (1000 requests/15 phút)
- Helmet security headers
- NoSQL injection prevention
- XSS protection
- CORS configuration
- Input validation và sanitization

## Performance

- Lazy loading components
- Image optimization với Cloudinary
- API response caching
- Database indexing
- Gzip compression
- Code splitting
- Service Worker caching
- Optimistic UI updates

## Browser Support

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14
- Mobile browsers (iOS Safari, Chrome Android)

## Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## License

MIT License - xem file LICENSE để biết thêm chi tiết

## Liên hệ

- Email: your@email.com
- GitHub: https://github.com/yourusername

## Acknowledgments

- React team cho React 19
- Vite team cho build tool tuyệt vời
- Workbox cho PWA utilities
- TailwindCSS cho styling framework
- MongoDB team cho database
- Tất cả contributors và open sourc
