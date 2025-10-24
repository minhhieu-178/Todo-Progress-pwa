import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
  getUserWorkspaces,
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
router.get("/workspaces", protectRoute, getUserWorkspaces);

router.get("/notifications", protectRoute, getUserNotifications);

router.patch("/notifications/:id/read", protectRoute, markNotificationRead);

export default router;
