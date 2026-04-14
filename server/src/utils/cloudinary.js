import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and deletes it locally afterwards.
 * @param {string} localFilePath - Path to the local file.
 * @returns {Promise<object|null>} - Cloudinary response object or null on failure.
 */
export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "hrs3_products",
    });

    // Delete the local file after successful upload
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error deleting local file after upload:", err);
    });

    return response;
  } catch (error) {
    // Attempt to delete the local file even if the upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlink(localFilePath, (err) => {
        if (err)
          console.error("Error deleting local file after failed upload:", err);
      });
    }
    console.error("Cloudinary upload failed:", error.message);
    return null;
  }
};

/**
 * Deletes multiple resources from Cloudinary by their public IDs.
 * @param {string[]} publicIds - Array of public IDs of the files to delete.
 * @returns {Promise<object>} - Cloudinary API response with deletion results.
 */
export const deleteFromCloudinaryBatch = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) return { deleted: {} };

    console.log(`[Cloudinary API] Attempting to delete resources:`, publicIds);

    // Method 1: Try Uploader API for single or few files (often more reliable)
    if (publicIds.length <= 1) {
      const results = {};
      for (const id of publicIds) {
        const res = await cloudinary.uploader.destroy(id);
        results[id] = res.result === 'ok' ? 'deleted' : res.result;
      }
      return { deleted: results };
    }

    // Method 2: Try Admin API for multiple files
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      console.log("[Cloudinary API] Batch deletion successful:", result.deleted);
      return result;
    } catch (batchError) {
      console.warn("[Cloudinary API] Batch deletion failed, falling back to individual uploader.destroy:", batchError.message);
      
      // Fallback: Individual deletion
      const results = {};
      for (const id of publicIds) {
        try {
          const res = await cloudinary.uploader.destroy(id);
          results[id] = res.result === 'ok' ? 'deleted' : res.result;
        } catch (singleError) {
          results[id] = 'failed';
          console.error(`[Cloudinary API] Individual deletion failed for ${id}:`, singleError.message);
        }
      }
      return { deleted: results };
    }
  } catch (error) {
    console.error("[Cloudinary API] Fatal deletion error:", error.message);
    throw error;
  }
};

/**
 * Deletes a single file from Cloudinary by its public ID.
 * @param {string} publicId - The public ID of the file to delete.
 * @returns {Promise<object|null>} - Cloudinary response object or null on failure.
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId);
    if (response.result !== "ok") {
      console.warn(`Cloudinary deletion for ${publicId} returned: ${response.result}`);
    }
    return response;
  } catch (error) {
    console.error("Cloudinary single deletion failed:", error.message);
    return null;
  }
};

export default uploadToCloudinary;
