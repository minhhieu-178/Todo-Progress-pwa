import User from '../models/User.js';

// @desc    Tìm kiếm người dùng theo tên hoặc email
// @route   GET /api/search/users?q=keyword
export const searchUsers = async (req, res) => {
  const keyword = req.query.q;
  
  if (!keyword) {
    return res.json([]);
  }

  try {
    const users = await User.find({
      $or: [
        { fullName: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ],
    })
    .find({ _id: { $ne: req.user._id } }) // Trừ bản thân người tìm
    .select('fullName email age phone address avatar')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tìm kiếm người dùng' });
  }
};