import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Lấy thông tin cá nhân
// @route   GET /api/users/profile
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      age: user.age,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
    });
  } else {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
};

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/users/profile
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.avatar = req.body.avatar || user.avatar;
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
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Xóa tài khoản
// @route   DELETE /api/users/profile
export const deleteUser = async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    if (!password) return res.status(400).json({ message: 'Cần nhập mật khẩu để xác nhận' });

    if (await user.matchPassword(password)) {
        await user.deleteOne();
        res.json({ message: 'Tài khoản đã được xóa thành công' });
    } else {
        res.status(401).json({ message: 'Mật khẩu không chính xác' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

export const subscribePush = async (req, res) => {
  const subscription = req.body;
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { pushSubscriptions: subscription }
    });
    res.status(201).json({});
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const unsubscribePush = async (req, res) => {
  const subscription = req.body;

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { pushSubscriptions: { endpoint: subscription.endpoint } }
  });

  res.sendStatus(200);
};
