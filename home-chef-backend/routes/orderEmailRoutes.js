import express from "express";
import { sendOrderReceipt } from "../controllers/orderEmailController.js";

const router = express.Router();
router.post("/send", sendOrderReceipt);

export default router;
