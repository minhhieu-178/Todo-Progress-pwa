import express from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  getTask,
} from "../controllers/task.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Task CRUD
router.post("/lists/:listId", protectRoute, createTask);   // tạo Task mới

router.get("/:taskId", protectRoute, getTask);             // Xem task

router.patch("/:taskId", protectRoute, updateTask);        // Cập nhật task

router.delete("/:taskId", protectRoute, deleteTask);       // Xóa task

export default router;
