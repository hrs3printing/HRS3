import Product from "../models/Product.js";
import HeroSlide from "../models/HeroSlide.js";
import Settings from "../models/Settings.js";
import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendEmail } from "../utils/email.js";

// GET ALL PRODUCTS
export const getProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find();
  res.json(products);
});

// GET ALL CATEGORIES
export const getCategoriesPublic = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ order: 1 });
  res.json(categories);
});

// CONTACT FORM
export const contactUs = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw new AppError("Name, email, and message are required", 400);
  }

  if (String(message).length > 5000) {
    throw new AppError("Message is too long", 400);
  }

  const settings = await Settings.findOne();
  const contactRecipient =
    process.env.EMAIL_TO ||
    process.env.ADMIN_EMAIL ||
    process.env.EMAIL_USER ||
    process.env.EMAIL_FROM;

  if (process.env.RESEND_API_KEY) {
    await sendEmail({
      to: contactRecipient,
      replyTo: email.trim(),
      subject: `New Contact Form Message from ${name.trim()}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <br/>
               <p><strong>Message:</strong></p>
               <p>${message}</p>`,
    });
  }

  // Return WhatsApp number if available
  res.json({
    success: true,
    message: "Message received!",
    whatsapp: settings?.contact?.whatsapp || null,
  });
});

// GET SETTINGS
export const getSettingsPublic = asyncHandler(async (_req, res) => {
  const settings = await Settings.findOne();
  res.json(settings || {});
});

// GET HERO SLIDES
export const getHeroSlidesPublic = asyncHandler(async (_req, res) => {
  const slides = await HeroSlide.find().sort({ order: 1 });
  res.json(slides);
});

// GET NEW ARRIVALS (last 4)
export const getNewArrivals = asyncHandler(async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).limit(4);
  res.json(products);
});

// GET SINGLE PRODUCT
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) throw new AppError("Product not found", 404);

  res.json(product);
});
