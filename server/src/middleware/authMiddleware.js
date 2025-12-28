import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập (Missing Access Token)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User không còn tồn tại' });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
       return res.status(401).json({ message: 'Token hết hạn', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

export { protect };