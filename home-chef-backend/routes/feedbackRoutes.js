import express from "express";
import { postFeedback, getAllFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Customer leaves feedback
router.post("/", protect, postFeedback);

// Admin / chefs can view all feedback
router.get("/", protect, getAllFeedback);

export default router;
