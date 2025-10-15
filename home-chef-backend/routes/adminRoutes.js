import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { getAllUsers } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Only admin can fetch users
router.get("/users", protect, adminOnly, getAllUsers);

export default router;
