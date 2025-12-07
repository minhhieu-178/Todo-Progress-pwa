import express from 'express';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Chưa chọn file nào' });
  }
  // Trả về URL của ảnh đã upload
  res.json({ url: req.file.path });
});

export default router;