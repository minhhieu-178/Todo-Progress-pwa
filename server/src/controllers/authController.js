import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. Đăng kí
export const registerUser = async (req, res) => {
  const { fullName, email, password, age, phone, address } = req.body;
  try {
    if (!fullName || !email || !password) return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email đã được sử dụng' });
    
    const user = await User.create({ fullName, email, password, age, phone, address });
    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// 2. Đăng nhập
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// 3. Quên mật khẩu
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Task Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mật khẩu mới của bạn',
      html: `<h3>Xin chào ${user.fullName},</h3><p>Mật khẩu mới của bạn là: <b>${tempPassword}</b></p>`,
    });

    res.json({ message: 'Đã gửi mật khẩu mới về email.' });
  } catch (error) {
    res.status(500).json({ message: 'Không thể gửi email.' });
  }
};

// 4. Yêu cầu đổi mật khẩu
export const requestChangePassword = async (req, res) => {
  const { currentPassword } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user.matchPassword(currentPassword)) return res.status(400).json({ message: 'Mật khẩu hiện tại sai' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Task Management" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Mã OTP đổi mật khẩu',
      html: `<h3>Mã OTP của bạn là: <b style="color:blue">${otp}</b></h3>`,
    });

    res.json({ message: 'OTP đã gửi về email.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// 5. Xác nhận đổi mật khẩu
export const confirmChangePassword = async (req, res) => {
  const { otp, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user.otpCode !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP sai hoặc hết hạn' });
    }
    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};