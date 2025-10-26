import express from "express";
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  createList,
  updateList,
  deleteList,
} from "../controllers/board.controller.js"; // đổi tên file controller

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Board routes
router.get("/", protectRoute, getBoards);                 // Khi người dùng vào Homepage sẽ hiện toàn bộ Board

router.get("/:boardId", protectRoute, getBoard);          // Bấm vào 1 Board cụ thể thì sang trang Board đó có hết list và card

router.post("/", protectRoute, createBoard);              // Tạo Board

router.patch("/:boardId", protectRoute, updateBoard);     // Cập nhật Board

router.delete("/:boardId", protectRoute, deleteBoard);    // Xóa Board

// List routes (thuộc Board)
router.post("/:boardId/lists", protectRoute, createList);                   // Tạo 1 List mới

router.patch("/:boardId/lists/:listId", protectRoute, updateList);          // Cập nhật List

router.delete("/:boardId/lists/:listId", protectRoute, deleteList);         // Xóa List 

export default router;
