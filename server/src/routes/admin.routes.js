import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
  getStats,
  getAllOrders,
  updateOrderAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  getSettings,
  updateSettings,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.post(
  "/upload",
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }

    const results = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.path)),
    );

    const images = results
      .filter((result) => result !== null)
      .map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
      }));

    if (images.length === 0) {
      throw new AppError("Upload failed", 502);
    }

    res.status(200).json({
      success: true,
      images,
      count: images.length,
    });
  }),
);

router.get("/stats", getStats);
router.get("/orders", getAllOrders);
router.patch("/orders/:id", updateOrderAdmin);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// 🎞️ HERO SLIDES
router.get("/hero", getHeroSlides);
router.post("/hero", createHeroSlide);
router.put("/hero/:id", updateHeroSlide);
router.delete("/hero/:id", deleteHeroSlide);

// 🏷️ CATEGORIES
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// ⚙️ SETTINGS
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;
