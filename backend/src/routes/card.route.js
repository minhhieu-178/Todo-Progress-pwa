import express from "express";
import {
  createCard,
  updateCard,
  deleteCard,
  getCard,
} from "../controllers/card.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/lists/:listId", protectRoute, createCard);   // tạo Card mới

router.get("/:taskId", protectRoute, getCard);             // Xem card

router.patch("/:taskId", protectRoute, updateCard);        // Cập nhật card

router.delete("/:taskId", protectRoute, deleteCard);       // Xóa card

export default router;
