import express from "express";
import multer from "multer";
import {
  createPost,
  getPosts,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ✅ Routes
router.post("/", upload.single("image"), createPost);
router.get("/", getPosts);
router.put("/:id", upload.single("image"), updatePost);
router.delete("/:id", deletePost);

export default router;
