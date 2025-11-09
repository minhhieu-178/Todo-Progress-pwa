import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const protect = async (req, res, next) => {
  let token;

  // 1. Kiểm tra header 'Authorization'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Lấy token từ header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 3. Xác thực (verify) token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Lấy thông tin user từ token (trừ mật khẩu)
      // Gắn user vào đối tượng 'req' để các route phía sau có thể dùng
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Đi tiếp
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Không được phép, token thất bại' });
    }
  }

  // 6. Nếu không có token
  if (!token) {
    res.status(401).json({ message: 'Không được phép, không có token' });
  }
};

export { protect };