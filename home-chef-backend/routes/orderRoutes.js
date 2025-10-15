
import express from "express";
import { createOrder, getOrders, updateOrderStatus, getMyOrders,getChefStats } from "../controllers/orderController.js";
import { protect, roleCheck } from "../middleware/auth.js";
import { deleteOrderByCustomer, updateOrderByCustomer } from "../controllers/orderController.js";
import { getChefWeeklyStats } from "../controllers/orderController.js";
import { getDeliveryEarnings } from "../controllers/orderController.js";





const router = express.Router();

router.post("/", protect, roleCheck(["customer"]), createOrder);
router.get("/myorders", protect, roleCheck(["customer"]), getMyOrders);

// allow delivery, chef, admin to view orders
router.get("/", protect, roleCheck(["delivery","chef","admin"]), getOrders);

// update status (delivery partners or admin)
router.put("/:id/status", protect, roleCheck(["delivery","admin","chef"]), updateOrderStatus);
router.put("/:id", protect, roleCheck(["customer"]), updateOrderByCustomer);

router.delete("/:id", protect, roleCheck(["customer"]), deleteOrderByCustomer);
router.get("/chef-stats", protect, getChefStats);
router.get("/chef-weekly-stats", protect, getChefWeeklyStats);

// ✅ Delivery Partner Earnings Route
router.get("/delivery/earnings", protect, getDeliveryEarnings);





export default router;
