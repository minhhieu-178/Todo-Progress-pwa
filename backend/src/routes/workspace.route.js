import express from "express";
import {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  createList,
  updateList,
  deleteList,
} from "../controllers/workspace.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Workspace routes
router.get("/", protectRoute, getWorkspaces);                 // khi người dùng vào Homepage sẽ hiện toàn bộ Workspace

router.get("/:workspaceId", protectRoute, getWorkspace);      // Bấm vào 1 workspace cụ thể thì sang trang workspace riêng đó có hết list và task

router.post("/", protectRoute, createWorkspace);              // Tạo workspace

router.patch("/:workspaceId", protectRoute, updateWorkspace); // Cập nhật workspace

router.delete("/:workspaceId", protectRoute, deleteWorkspace);// Xóa

// List routes (thuộc workspace)
router.post("/:workspaceId/lists", protectRoute, createList);                   // Tạo 1 list mới

router.patch("/:workspaceId/lists/:listId", protectRoute, updateList);          // Cập nhật List

router.delete("/:workspaceId/lists/:listId", protectRoute, deleteList);         // Xóa list 

export default router;
