import Order from "../models/Order.js";
import Dish from "../models/Dish.js";
import { io } from "../server.js";


// ✅ Create Order
export const createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, deliveryAddress, dishId, quantity } = req.body;

    if (!customerName || !customerEmail || !deliveryAddress || !dishId || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const dish = await Dish.findById(dishId);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    const totalPrice = dish.price * quantity;

    const order = new Order({
      customer: req.user._id, // logged-in user
      customerName,
      customerEmail,
      deliveryAddress,
      dish: dishId,
      quantity,
      totalPrice,
      status: "Pending",
    });

    await order.save();

    // Emit real-time update to all connected clients
    
    io.emit("orderCreated", { id: order._id });



    // ✅ Return the saved order
    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(400).json({ message: err.message });
  }
};



// ✅ Get all orders (Admin or Chef only)
export const getOrders = async (req, res) => {
  try {
    let query = {};

    // Customers → only their orders
    if (req.user.role === "customer") {
      query.customer = req.user._id;
    }

    // Delivery partners can see all pending orders
    if (req.user.role === "delivery") {
  query = {}; 
}
    const orders = await Order.find(query)
      .populate("dish")
      .populate("customer", "email role");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const updateOrderStatus = async (req, res) => {
  try {
    console.log("updateOrderStatus called:", {
      user: req.user?._id,
      role: req.user?.role,
      id: req.params.id,
      body: req.body,
    });

    const order = await Order.findById(req.params.id).populate("dish");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Update only the status field
    order.status = req.body.status;
    await order.save();

    // ✅ Real-time update for dashboards
    io.emit("orderUpdated", { orderId: order._id, status: order.status });

    console.log("✅ Order updated:", order.status);
    return res.json(order); // send only once
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return res.status(500).json({ message: err.message });
  }
};



// ✅ Get logged-in customer's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).populate("dish");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Only allow updating pending orders
export const updateOrderByCustomer = async (req, res) => {
  const { id } = req.params;
  const { quantity, deliveryAddress } = req.body;
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ _id: id, customer: userId });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Pending") 
      return res.status(400).json({ message: "Only pending orders can be updated" });

    if (quantity !== undefined) order.quantity = quantity;
    if (deliveryAddress) order.deliveryAddress = deliveryAddress;

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to update order", error: err.message });
  }
};


export const deleteOrderByCustomer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this order" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders/chef-stats
export const getChefStats = async (req, res) => {
  try {
    const chefId = req.user._id;

    // ✅ Find all dishes created by this chef
    const chefDishes = await Dish.find({ chef: chefId }).select("_id name");

    // ✅ Get all orders related to those dishes
    const orders = await Order.find({ dish: { $in: chefDishes.map((d) => d._id) } })
      .populate("dish", "name price createdAt");

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;

    // ✅ Monthly revenue
    const monthly = {};
    orders.forEach((o) => {
      const month = new Date(o.createdAt).toLocaleString("default", { month: "short" });
      monthly[month] = (monthly[month] || 0) + o.totalPrice;
    });
    const monthlySales = Object.keys(monthly).map((m) => ({ month: m, revenue: monthly[m] }));

    // ✅ Top dishes
    const dishMap = {};
    orders.forEach((o) => {
      const name = o.dish?.name || "Unknown";
      dishMap[name] = (dishMap[name] || 0) + 1;
    });
    const dishStats = Object.entries(dishMap).map(([name, orders]) => ({ name, orders }));
    const topDish = Object.keys(dishMap).sort((a, b) => dishMap[b] - dishMap[a])[0] || "-";

    res.json({
      revenue: totalRevenue,
      orders: totalOrders,
      topDish,
      monthlySales,
      dishStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching chef stats" });
  }
};


// ✅ Get Weekly Performance Data for Chef
export const getChefWeeklyStats = async (req, res) => {
  try {
    const chefId = req.user._id;

    // Get all dishes created by this chef
    const chefDishes = await Dish.find({ chef: chefId }).select("_id");

    // Get all orders related to those dishes
    const orders = await Order.find({ dish: { $in: chefDishes.map(d => d._id) } });

    // Group by week range (Sun–Sat)
    const weekly = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

      const key = `${startOfWeek.toLocaleString("default", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleString("default", { month: "short", day: "numeric" })}`;
      weekly[key] = (weekly[key] || 0) + 1;
    });

    const weeklyStats = Object.keys(weekly).map((range) => ({
      weekRange: range,
      orders: weekly[range],
    }));

    res.json(weeklyStats);
  } catch (err) {
    console.error("Error fetching weekly stats:", err);
    res.status(500).json({ message: "Error fetching weekly stats" });
  }
};

// ✅ Get Delivery Partner Earnings
export const getDeliveryEarnings = async (req, res) => {
  try {
    // Ensure only delivery partners can access
    if (req.user.role !== "delivery") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch all delivered orders
    const deliveredOrders = await Order.find({ status: "Delivered" })
      .populate("dish", "name price")
      .populate("customer", "name email");

    // Calculate earnings (10% per order)
    const totalEarnings = deliveredOrders.reduce(
      (sum, o) => sum + o.totalPrice * 0.1,
      0
    );

    // Today’s earnings
    const today = new Date();
    const todayEarnings = deliveredOrders
      .filter(
        (o) => new Date(o.updatedAt).toDateString() === today.toDateString()
      )
      .reduce((sum, o) => sum + o.totalPrice * 0.1, 0);

    // This week’s earnings
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyEarnings = deliveredOrders
      .filter((o) => new Date(o.updatedAt) >= weekAgo)
      .reduce((sum, o) => sum + o.totalPrice * 0.1, 0);

    // Weekly trend for last 7 days
    const trendMap = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const dayTotal = deliveredOrders
        .filter(
          (o) => new Date(o.updatedAt).toDateString() === date.toDateString()
        )
        .reduce((sum, o) => sum + o.totalPrice * 0.1, 0);
      trendMap[key] = dayTotal;
    }

    const weeklyTrend = Object.entries(trendMap).map(([day, earnings]) => ({
      day,
      earnings,
    }));

    res.json({
      totalEarnings,
      todayEarnings,
      weeklyEarnings,
      weeklyTrend,
      deliveredOrders,
    });
  } catch (err) {
    console.error("Error fetching delivery earnings:", err);
    res.status(500).json({ message: "Server error" });
  }
};
