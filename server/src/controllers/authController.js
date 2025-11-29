import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer'; // Import để gửi mail

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    const user = await User.create({ fullName, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        // token: generateToken(user._id), // Tùy chọn: trả về token luôn nếu muốn tự động login
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không hợp lệ' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/auth/profile
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    // user.email = req.body.email || user.email; 

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Quên mật khẩu (Gửi mật khẩu mới qua Email)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    // Tạo mật khẩu ngẫu nhiên
    const tempPassword = Math.random().toString(36).slice(-8); 
    
    // Lưu mật khẩu mới vào DB (sẽ được hash tự động)
    user.password = tempPassword;
    await user.save();

    // Cấu hình gửi mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Task Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mật khẩu mới của bạn',
      html: `
        <h3>Xin chào ${user.fullName},</h3>
        <p>Chúng tôi đã nhận được yêu cầu khôi phục tài khoản.</p>
        <p>Đây là mật khẩu mới của bạn:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; font-size: 20px; font-weight: bold; color: #3B82F6; text-align: center; margin: 20px 0;">
          ${tempPassword}
        </div>
        <p>Vui lòng đăng nhập bằng mật khẩu này và đổi lại mật khẩu mới ngay lập tức để bảo mật.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Đã gửi mật khẩu mới về email. Vui lòng kiểm tra!' });

  } catch (error) {
    console.error('Lỗi gửi mail:', error);
    res.status(500).json({ message: 'Không thể gửi email. Vui lòng thử lại sau.' });
  }
};

// @desc    Xóa tài khoản
// @route   DELETE /api/auth/profile
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'Tài khoản đã được xóa thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};