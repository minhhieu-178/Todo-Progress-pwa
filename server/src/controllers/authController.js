import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Determine environment
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // Production (Render): Secure=true + SameSite=None (Cross-site)
    // Development (Local): Secure=false + SameSite=Lax (Same-site/Localhost)
    secure: isProduction, 
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  };

  res.status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      accessToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        age: user.age,
        phone: user.phone,
        address: user.address,
      }
    });
};

export const registerUser = async (req, res) => {
  const { fullName, email, password, age, phone, address } = req.body;
  try {
    if (!fullName || !email || !password) return res.status(400).json({ message: 'Thiếu thông tin' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email đã tồn tại' });

    // Generate a short OTP for email verification instead of a link
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({ 
      fullName, email, password, age, phone, address, 
      isVerified: false,
      emailOtp: otp,
      emailOtpExpires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER, // Must be verified in SendGrid
      subject: 'Mã OTP xác thực email của bạn',
      html: `<h3>Chào ${fullName},</h3>
             <p>Mã xác thực của bạn là: <b style="font-size:20px">${otp}</b></p>
             <p>Mã có hiệu lực trong 10 phút.</p>`
    };

    await sgMail.send(msg);

    res.status(201).json({ 
      message: 'Đăng ký thành công! Mã OTP đã được gửi tới email của bạn.' 
    });
  } catch (error) {
    console.error('Register User Error (Email send failed?):', error);
    res.status(500).json({ message: error.message });
  }
};





export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ 
          message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn.' 
        });
      }

      sendTokenResponse(user, 200, res);
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu sai' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });
  res.status(200).json({ message: 'Đăng xuất thành công' });
};

export const refreshAccessToken = async (req, res) => {
  const cookieRefreshToken = req.cookies.refreshToken;

  if (!cookieRefreshToken) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(cookieRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User không tồn tại' });

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: 'Refresh Token hết hạn hoặc không hợp lệ', code: 'REFRESH_EXPIRED' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();

    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: 'Mật khẩu mới của bạn',
      html: `<h3>Xin chào ${user.fullName},</h3><p>Mật khẩu mới của bạn là: <b>${tempPassword}</b></p>`,
    };

    await sgMail.send(msg);

    res.json({ message: 'Đã gửi mật khẩu mới về email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Không thể gửi email.' });
  }
};

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

    const msg = {
      to: user.email,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: 'Mã OTP đổi mật khẩu',
      html: `<h3>Mã OTP của bạn là: <b style="color:blue">${otp}</b></h3>`,
    };

    await sgMail.send(msg);

    res.json({ message: 'OTP đã gửi về email.' });
  } catch (error) {
    console.error('Request Change Password Error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

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

export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Thiếu email hoặc OTP' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    if (user.isVerified) return res.status(400).json({ message: 'Tài khoản đã được xác thực' });

    if (!user.emailOtp || user.emailOtp !== otp || (user.emailOtpExpires && user.emailOtpExpires < Date.now())) {
      return res.status(400).json({ message: 'OTP sai hoặc đã hết hạn' });
    }

    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Xác thực email thành công! Bạn có thể đăng nhập.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Thiếu email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
    if (user.isVerified) return res.status(400).json({ message: 'Tài khoản đã được xác thực' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOtp = otp;
    user.emailOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: 'Mã OTP xác thực email của bạn (Gửi lại)',
      html: `<h3>Chào ${user.fullName},</h3>
             <p>Mã xác thực mới của bạn là: <b style="font-size:20px">${otp}</b></p>
             <p>Mã có hiệu lực trong 10 phút.</p>`
    };

    await sgMail.send(msg);
    res.status(200).json({ message: 'Đã gửi lại mã OTP vào email của bạn!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
