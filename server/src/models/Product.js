import mongoose from "mongoose";
import { deleteFromCloudinaryBatch } from "../utils/cloudinary.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    category: [String],
    subCategory: [String],
    size: [String],
    colors: [String],
    description: String,
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Helper to extract public_id from Cloudinary URL if it's a string
const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  try {
    // Cloudinary URL format: .../upload/v12345/folder/filename.ext
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // The public_id starts after the version (which starts with 'v') or directly after 'upload'
    let publicIdWithExt = "";
    if (parts[uploadIndex + 1].startsWith("v")) {
      publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
    } else {
      publicIdWithExt = parts.slice(uploadIndex + 1).join("/");
    }

    // Remove extension
    return publicIdWithExt.split(".")[0];
  } catch (error) {
    console.warn(
      `[Cloudinary Cleanup] Failed to parse public_id from URL: ${url}`,
    );
    return null;
  }
};

// Comprehensive Cleanup Hook
// This middleware runs BEFORE a product is deleted from the database
productSchema.pre("findOneAndDelete", async function () {
  try {
    const query = this.getQuery();
    console.log(`[Cloudinary Cleanup Debug] Running for query:`, query);

    // 1. Capture the document being deleted
    const docToProcess = await this.model.findOne(query);
    if (!docToProcess) {
      console.warn(
        `[Cloudinary Cleanup] No product found for deletion query:`,
        query,
      );
      return;
    }

    console.log(
      `[Cloudinary Cleanup] Found product to delete: ${docToProcess.name} (${docToProcess._id})`,
    );

    // 2. Extract all Cloudinary public IDs associated with the product
    const publicIds = [];

    // Handle main image
    if (docToProcess.image?.public_id) {
      publicIds.push(docToProcess.image.public_id);
    } else if (typeof docToProcess.image === "string") {
      const extracted = extractPublicIdFromUrl(docToProcess.image);
      if (extracted) publicIds.push(extracted);
    }

    // Handle extra images
    if (docToProcess.images && docToProcess.images.length > 0) {
      docToProcess.images.forEach((img) => {
        if (img.public_id) {
          publicIds.push(img.public_id);
        } else if (typeof img === "string") {
          const extracted = extractPublicIdFromUrl(img);
          if (extracted) publicIds.push(extracted);
        }
      });
    }

    console.log(`[Cloudinary Cleanup] Public IDs to remove:`, publicIds);

    // 3. Perform batch deletion from Cloudinary if IDs exist
    if (publicIds.length > 0) {
      console.log(
        `[Cloudinary Cleanup] Triggering deletion for ${publicIds.length} resources...`,
      );

      const deletionResult = await deleteFromCloudinaryBatch(publicIds);

      const results = deletionResult.deleted || {};
      const deletedCount = Object.keys(results).filter(
        (id) => results[id] === "deleted",
      ).length;

      console.log(
        `[Cloudinary Cleanup] Results summary: ${deletedCount}/${publicIds.length} deleted.`,
      );
    } else {
      console.log(
        `[Cloudinary Cleanup] No Cloudinary assets found for this product.`,
      );
    }
  } catch (error) {
    console.error(
      "[Cloudinary Cleanup Error] Fatal error during cleanup:",
      error,
    );
  }
});

export default mongoose.model("Product", productSchema);
