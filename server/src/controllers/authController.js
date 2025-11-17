import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Hàm trợ giúp để tạo JWT token (sẽ dùng cho login sau)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token hết hạn sau 30 ngày
  });
};

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // 1. Kiểm tra thông tin đầu vào
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // 2. Kiểm tra email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // 3. Tạo user mới (mật khẩu sẽ tự động được hash bởi middleware trong User.js)
    const user = await User.create({
      fullName,
      email,
      password,
    });

    // 4. Trả về thông tin user (nhưng không trả về token, chỉ trả khi login)
    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        // (Chúng ta sẽ trả về token khi làm chức năng login)
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
//@desc Đăng nhập và lấy token
//@route POST/api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Kiểm tra email
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    // 2. Tìm user trong DB
    const user = await User.findOne({ email });

    // 3. Kiểm tra user tồn tại VÀ mật khẩu khớp
    // (Chúng ta dùng phương thức matchPassword vừa tạo trong Model)
    if (user && (await user.matchPassword(password))) {
      // 4. Đăng nhập thành công, trả về thông tin và token
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id), // Tạo JWT Token
      });
    } else {
      // 4. Sai email hoặc mật khẩu
      res.status(401).json({ message: 'Email hoặc mật khẩu không hợp lệ' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};