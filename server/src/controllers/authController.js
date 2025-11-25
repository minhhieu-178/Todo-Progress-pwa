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

//1.Đăng kí
export const registerUser = async (req, res) => {
  const { fullName, email, password, age, phone, address } = req.body;
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
        age: user.age,
        phone: user.phone,
        address: user.address,
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

//2.Đăng nhập
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
        age: user.age,
        phone: user.phone,
        address: user.address,
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

//3.Quên mật khẩu
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    const tempPassword = Math.random().toString(36).slice(-8); 
    
    user.password = tempPassword;
    await user.save();

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

//4.Cập nhật thông tin cá nhân
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.age = req.body.age || user.age;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      age: updatedUser.age,
      phone: updatedUser.phone,
      address: updatedUser.address,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

//5.Xóa tài khoản
export const deleteUser = async (req, res) => {
  const { password } = req.body; // Nhận mật khẩu xác nhận từ Client

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra xem user có gửi mật khẩu không
    if (!password) {
        return res.status(400).json({ message: 'Vui lòng nhập mật khẩu để xác nhận xóa.' });
    }

    // So sánh mật khẩu
    if (await user.matchPassword(password)) {
        await user.deleteOne();
        res.json({ message: 'Tài khoản đã được xóa thành công' });
    } else {
        res.status(401).json({ message: 'Mật khẩu không chính xác.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

//6.Yêu cầu đổi mật khẩu
export const requestChangePassword = async (req, res) => {
  const { currentPassword } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    // 1. Kiểm tra mật khẩu hiện tại
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // 2. Tạo OTP (6 số ngẫu nhiên)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Lưu OTP vào DB (Hết hạn sau 10 phút)
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();

    // 4. Gửi Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Task Management" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Mã xác nhận đổi mật khẩu',
      html: `
        <h3>Yêu cầu đổi mật khẩu</h3>
        <p>Mã xác nhận (OTP) của bạn là:</p>
        <h2 style="color: #3B82F6;">${otp}</h2>
        <p>Mã này sẽ hết hạn sau 10 phút. Tuyệt đối không chia sẻ mã này cho ai.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Đã gửi mã xác nhận về email của bạn.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ hoặc lỗi gửi email' });
  }
};

//7.Xác nhận OTP và Đổi mật khẩu mới
export const confirmChangePassword = async (req, res) => {
  const { otp, newPassword } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    // 1. Kiểm tra OTP
    if (user.otpCode !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn' });
    }

    // 2. Cập nhật mật khẩu mới
    user.password = newPassword; // Pre-save hook sẽ tự động hash
    
    // 3. Xóa OTP đã dùng
    user.otpCode = undefined;
    user.otpExpires = undefined;
    
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};