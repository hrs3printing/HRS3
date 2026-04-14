import mongoose from "mongoose";
import { deleteFromCloudinaryBatch } from "../utils/cloudinary.js";

const heroSlideSchema = new mongoose.Schema(
  {
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Comprehensive Cleanup Hook
heroSlideSchema.pre("findOneAndDelete", async function () {
  try {
    const query = this.getQuery();
    const docToProcess = await this.model.findOne(query);
    if (!docToProcess) return;

    if (docToProcess.image?.public_id) {
      console.log(
        `[Hero Cleanup] Triggering deletion for Hero Slide image: ${docToProcess.image.public_id}`,
      );
      await deleteFromCloudinaryBatch([docToProcess.image.public_id]);
    }
  } catch (error) {
    console.error("[Hero Cleanup Error] Fatal error during cleanup:", error);
  }
});

export default mongoose.model("HeroSlide", heroSlideSchema);
