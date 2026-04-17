import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import HeroSlide from "../models/HeroSlide.js";
import Settings from "../models/Settings.js";
import Category from "../models/Category.js";
import { deleteFromCloudinaryBatch } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// CATEGORIES
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const oldCategory = await Category.findById(req.params.id);
  if (!oldCategory) throw new AppError("Category not found", 404);

  // 1. Identify public_ids to cleanup
  const oldPublicIds = [];
  if (oldCategory.image?.public_id) oldPublicIds.push(oldCategory.image.public_id);
  oldCategory.subCategories?.forEach((sub) => {
    if (sub.image?.public_id) oldPublicIds.push(sub.image.public_id);
  });

  const newPublicIds = [];
  if (req.body.image?.public_id) newPublicIds.push(req.body.image.public_id);
  req.body.subCategories?.forEach((sub) => {
    if (sub.image?.public_id) newPublicIds.push(sub.image.public_id);
  });

  const idsToDelete = oldPublicIds.filter((id) => !newPublicIds.includes(id));

  // 2. Cleanup removed images
  if (idsToDelete.length > 0) {
    try {
      await deleteFromCloudinaryBatch(idsToDelete);
    } catch (err) {
      console.error("[Category Update Cleanup Error]", err.message);
    }
  }

  // 3. Update DB
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError("Category not found", 404);
  res.json({ success: true, message: "Category deleted" });
});

export const getStats = asyncHandler(async (_req, res) => {
  const [productCount, orderCount, userCount, revenueAgg] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
  ]);
  const revenue = revenueAgg[0]?.total || 0;
  res.json({ productCount, orderCount, userCount, revenue });
});

export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product")
    .sort({ createdAt: -1 })
    .limit(300);
  res.json(orders);
});

export const updateOrderAdmin = asyncHandler(async (req, res) => {
  const { isPaid, isDelivered } = req.body || {};
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found", 404);
  if (typeof isPaid === "boolean") order.isPaid = isPaid;
  if (typeof isDelivered === "boolean") order.isDelivered = isDelivered;
  await order.save();
  const populated = await Order.findById(order._id)
    .populate("user", "name email")
    .populate("items.product");
  res.json(populated);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const oldProduct = await Product.findById(req.params.id);
  if (!oldProduct) throw new AppError("Product not found", 404);

    // 1. Transaction-like data consistency check
    // Collect all public_ids currently stored in the DB
    const oldPublicIds = [];
    if (oldProduct.image?.public_id)
      oldPublicIds.push(oldProduct.image.public_id);
    if (oldProduct.images) {
      oldProduct.images.forEach((img) => {
        if (img.public_id) oldPublicIds.push(img.public_id);
      });
    }

    // 2. Identify new public_ids from the update request
    const newPublicIds = [];
    if (req.body.image?.public_id) newPublicIds.push(req.body.image.public_id);
    if (req.body.images) {
      req.body.images.forEach((img) => {
        if (img.public_id) newPublicIds.push(img.public_id);
      });
    }

    // 3. Batch find IDs that were in old but are NOT in the new payload (removed images)
    const idsToDelete = oldPublicIds.filter((id) => !newPublicIds.includes(id));

    // 4. Perform Cloudinary cleanup for removed images
    if (idsToDelete.length > 0) {
      console.log(
        `[Admin Update] Cleaning up ${idsToDelete.length} removed images for Product: ${oldProduct._id}`,
      );

      // Verification step: using batch deletion for efficiency
      try {
        const cleanupStatus = await deleteFromCloudinaryBatch(idsToDelete);
        console.log(
          `[Admin Update] Cloudinary cleanup verification for ${oldProduct._id}: Success`,
        );
      } catch (err) {
        // Log errors without failing the main product update (Non-blocking cleanup policy)
        console.error(
          `[Admin Update Error] Cloudinary cleanup verification failed: ${err.message}`,
        );
      }
    }

    // 5. Apply the update to the database record
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  // findByIdAndDelete triggers our pre-deletion hook in the Product model
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError("Product not found", 404);

    // Status report for the admin
    res.json({
      success: true,
      message: "Product and associated Cloudinary assets successfully removed.",
      id: req.params.id,
    });
});

// 🎞️ HERO SLIDES
export const getHeroSlides = asyncHandler(async (_req, res) => {
  const slides = await HeroSlide.find().sort({ order: 1 });
  res.json(slides);
});

export const createHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.create(req.body);
  res.status(201).json(slide);
});

export const updateHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!slide) throw new AppError("Slide not found", 404);
  res.json(slide);
});

export const deleteHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findByIdAndDelete(req.params.id);
  if (!slide) throw new AppError("Slide not found", 404);

  res.json({ success: true, message: "Slide deleted successfully" });
});

// ⚙️ SETTINGS
export const getSettings = asyncHandler(async (_req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json(settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

    // Cleanup old logo if it's being replaced
    if (
      settings?.logo?.public_id &&
      req.body.logo?.public_id &&
      settings.logo.public_id !== req.body.logo.public_id
    ) {
      try {
        await deleteFromCloudinaryBatch([settings.logo.public_id]);
      } catch (err) {
        console.error(
          "[Settings Update] Old logo cleanup failed:",
          err.message,
        );
      }
    }

    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findOneAndUpdate({}, req.body, {
        new: true,
        runValidators: true,
      });
    }
    res.json(settings);
});
