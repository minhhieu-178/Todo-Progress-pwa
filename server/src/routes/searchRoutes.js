import express from 'express';
import { searchUsers } from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Định nghĩa route: GET /api/search/users
router.get('/users', protect, searchUsers);

export default router;