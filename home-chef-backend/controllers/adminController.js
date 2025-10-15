import User from "../models/user.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // don’t send password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
