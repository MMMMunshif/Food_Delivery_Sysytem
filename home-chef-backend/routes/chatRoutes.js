import express from "express";
import ChatMessage from "../models/ChatMessage.js";

const router = express.Router();

// Get chat history by room
router.get("/:roomId", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ roomId: req.params.roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save new message
router.post("/", async (req, res) => {
  try {
    const { roomId, sender, message, senderRole } = req.body;
    const newMessage = new ChatMessage({ roomId, sender, message, senderRole });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
