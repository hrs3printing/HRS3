import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  verifyPayment,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, placeOrder);
router.post("/verify", protect, verifyPayment);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

export default router;
