import Chef from "../models/Chef.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";

const signToken = (chef) => {
  return jwt.sign({ id: chef._id, email: chef.email, role: chef.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

export const registerChef = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing required fields" });

    const existing = await Chef.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const chef = await Chef.create({ name, email, password: hashed, phone, address });
    const token = signToken(chef);
    res.status(201).json({ chef: { id: chef._id, name: chef.name, email: chef.email, verified: chef.verified }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllChefs = async (req, res) => {
  try {
    const chefs = await Chef.find().select("-password"); // exclude password
    res.json(chefs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chefs", error: err.message });
  }
};

export const loginChef = async (req, res) => {
  try {
    const { email, password } = req.body;
    const chef = await Chef.findOne({ email });
    if (!chef) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, chef.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(chef);
    res.json({ token, chef: { id: chef._id, name: chef.name, email: chef.email, verified: chef.verified } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  res.json(req.chef);
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    const chef = await Chef.findByIdAndUpdate(req.chef._id, updates, { new: true }).select("-password");
    res.json(chef);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

export const verifyChef = async (req, res) => {
  try {
    const { chefId } = req.params;
    const chef = await Chef.findByIdAndUpdate(chefId, { verified: true }, { new: true }).select("-password");
    if (!chef) return res.status(404).json({ message: "Chef not found" });
    res.json(chef);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};

export const getEarnings = async (req, res) => {
  try {
    const chefId = req.chef._id;
    const earningsAgg = await Order.aggregate([
      { $match: { chef: chefId, status: "delivered" } },
      { $group: { _id: null, totalEarnings: { $sum: "$total" } } }
    ]);
    const totalEarnings = (earningsAgg[0] && earningsAgg[0].totalEarnings) || 0;
    const totalOrders = await Order.countDocuments({ chef: chefId });
    const delivered = await Order.countDocuments({ chef: chefId, status: "delivered" });
    res.json({ totalEarnings, totalOrders, delivered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute earnings" });
  }
};
