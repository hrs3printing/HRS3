import Cart from "../models/Cart.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// GET USER CART
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json(cart);
});

// ADD TO CART
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body || {};

  // ✅ Validate ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid product ID", 400);
  }

  const numericQty = Number(qty);
  if (!Number.isFinite(numericQty) || numericQty < 1 || numericQty > 99) {
    throw new AppError("Invalid quantity", 400);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].qty += numericQty;
  } else {
    cart.items.push({ product: productId, qty: numericQty });
  }

  await cart.save();

  // ✅ RETURN POPULATED DATA
  const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  res.json(updatedCart);
});

// UPDATE QTY
export const updateCartQty = asyncHandler(async (req, res) => {
  const { productId, type } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid product ID", 400);
  }

  if (type !== "inc" && type !== "dec") {
    throw new AppError("Invalid update type", 400);
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) throw new AppError("Item not found in cart", 404);

  item.qty = type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1);

  await cart.save();

  const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  res.json(updatedCart);
});

// REMOVE ITEM
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid product ID", 400);
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  await cart.save();

  const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  res.json(updatedCart);
});
