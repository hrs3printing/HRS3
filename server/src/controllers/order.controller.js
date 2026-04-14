import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 📦 PLACE ORDER
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body || {};
  const allowedMethods = ["cod", "razorpay"];

  if (!allowedMethods.includes(paymentMethod)) {
    throw new AppError("Invalid payment method", 400);
  }

  if (
    !shippingAddress?.name?.trim?.() ||
    !shippingAddress?.phone?.trim?.() ||
    !shippingAddress?.address?.trim?.() ||
    !shippingAddress?.city?.trim?.() ||
    !shippingAddress?.pincode?.trim?.()
  ) {
    throw new AppError("Incomplete shipping details", 400);
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const total = cart.items.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.qty,
    0,
  );

  if (!Number.isFinite(total) || total <= 0) {
    throw new AppError("Invalid cart total", 400);
  }

  let razorpayOrder = null;

  if (paymentMethod === "razorpay") {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new AppError("Payment gateway is not configured", 500);
    }

    const options = {
      amount: Math.round(total * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (rzpError) {
      console.error("Razorpay API Error:", rzpError?.message || rzpError);
      throw new AppError("Razorpay order creation failed", 502);
    }
  }

  const order = await Order.create({
    user: req.user._id,
    items: cart.items.map((item) => ({
      product: item.product._id,
      qty: item.qty,
    })),
    shippingAddress,
    paymentMethod,
    total,
    razorpay_order_id: razorpayOrder ? razorpayOrder.id : undefined,
  });

  // 🔥 CLEAR CART AFTER ORDER (COD). Razorpay: clear after verification.
  if (paymentMethod === "cod") {
    cart.items = [];
    await cart.save();
  }

  return res.status(201).json({
    ...order._doc,
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
  });
});

// ✅ VERIFY PAYMENT
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_id,
  } = req.body || {};

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !order_id
  ) {
    throw new AppError("Missing payment verification fields", 400);
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new AppError("Payment gateway is not configured", 500);
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
  if (!isAuthentic) {
    throw new AppError("Invalid signature", 400);
  }

  const order = await Order.findById(order_id);
  if (!order) throw new AppError("Order not found", 404);

  // Prevent users from verifying someone else's order
  if (String(order.user) !== String(req.user._id)) {
    throw new AppError("Not authorized", 403);
  }

  order.isPaid = true;
  order.razorpay_payment_id = razorpay_payment_id;
  order.razorpay_signature = razorpay_signature;
  await order.save();

  // Clear cart
  await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

  res
    .status(200)
    .json({ success: true, message: "Payment verified successfully" });
});

// 📜 GET USER ORDERS
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.json(orders);
});

// 📄 GET SINGLE ORDER
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");

  if (!order) throw new AppError("Order not found", 404);

  if (String(order.user) !== String(req.user._id)) {
    throw new AppError("Not authorized", 403);
  }

  res.json(order);
});
