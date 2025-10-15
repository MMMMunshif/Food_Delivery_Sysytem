import Feedback from "../models/Feedback.js";

// Create Feedback
export const postFeedback = async (req, res) => {
  try {
    const feedback = new Feedback({
      user: req.user ? req.user._id : null,
      customerName: req.user ? req.user.name : "Anonymous",
      rating: req.body.rating || null,
      message: req.body.message,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all feedback
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("user", "name email");
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
