import express from "express";
import {
  createDish,
  getDishes,
  getDishById,
  updateDish,
  deleteDish,
} from "../controllers/dishController.js";
import { protect, chefOnly } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// 🌍 Public - anyone can see dishes
router.get("/", getDishes);
router.get("/:id", getDishById);

// 👨‍🍳 Only chefs can create/update/delete dishes
router.post("/", protect, chefOnly, upload.single("image"), createDish);
router.put("/:id", protect, chefOnly, upload.single("image"), updateDish);
router.delete("/:id", protect, chefOnly, deleteDish);

export default router;
