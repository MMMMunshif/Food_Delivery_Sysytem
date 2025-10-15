// routes/userRoutes.js
import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Create new user (Admin only)
router.post("/", protect, adminOnly, createUser);

// Get all users (Admin only)
router.get("/", protect, adminOnly, getUsers);

// Update user by ID (Admin only)
router.put("/:id", protect, adminOnly, updateUser);

// Delete user by ID (Admin only)
router.delete("/:id", protect, adminOnly, deleteUser);


export default router;
