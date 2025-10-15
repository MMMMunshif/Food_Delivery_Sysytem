import express from "express";
import { getAllChefs } from "../controllers/chefController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

//  Only admin can see/manage chefs
router.get("/", protect, adminOnly, getAllChefs);

export default router;
