import express from "express";
import Order from "../models/Order.js";
import Dish from "../models/Dish.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get live stats for a chef
router.get("/", protect, async (req, res) => {
  try {
    const chefId = req.user._id;

    // Find all dishes created by this chef
    const dishes = await Dish.find({ chef: chefId });
    const dishIds = dishes.map((d) => d._id);

    // Find all orders for those dishes
    const orders = await Order.find({ dishId: { $in: dishIds } });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Count dish frequencies
    const dishCount = {};
    orders.forEach((o) => {
      dishCount[o.dishId] = (dishCount[o.dishId] || 0) + 1;
    });
    let topDishId = Object.keys(dishCount).sort((a, b) => dishCount[b] - dishCount[a])[0];
    let topDish = await Dish.findById(topDishId);
    const topDishName = topDish ? topDish.name : "N/A";

    res.json({ totalOrders, totalRevenue, topDish: topDishName });
  } catch (err) {
    console.error("Error fetching chef stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
