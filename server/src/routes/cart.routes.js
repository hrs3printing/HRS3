import express from "express";
import {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartQty);
router.delete("/remove", protect, removeFromCart);

export default router;
