import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
  getUserBoards, // đổi tên function cho phù hợp
  getUserNotifications,
  markNotificationRead,
  deleteUserProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Auth
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

// Profile
router.put("/update-profile", protectRoute, updateProfile);

router.delete("/delete-profile", protectRoute, deleteUserProfile);

// Auth check
router.get("/check", protectRoute, checkAuth);

// User data
router.get("/boards", protectRoute, getUserBoards); // đổi endpoint từ /workspaces → /boards

router.get("/notifications", protectRoute, getUserNotifications);

router.patch("/notifications/:id/read", protectRoute, markNotificationRead);

export default router;
