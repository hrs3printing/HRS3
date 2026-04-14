import express from "express";
import {
  getProducts,
  getProductById,
  getNewArrivals,
  getHeroSlidesPublic,
  getSettingsPublic,
  getCategoriesPublic,
  contactUs,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getCategoriesPublic);
router.post("/contact", contactUs);
router.get("/hero", getHeroSlidesPublic);
router.get("/settings", getSettingsPublic);
router.get("/new-arrivals", getNewArrivals);
router.get("/:id", getProductById);

export default router;
