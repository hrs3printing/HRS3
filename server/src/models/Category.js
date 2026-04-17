import mongoose from "mongoose";
import { deleteFromCloudinaryBatch } from "../utils/cloudinary.js";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: {
      url: String,
      public_id: String,
    },
    subCategories: [
      {
        name: { type: String, required: true },
        image: {
          url: String,
          public_id: String,
        },
      },
    ],
  },
  { timestamps: true },
);

// Cleanup Cloudinary images when category is deleted
categorySchema.pre("findOneAndDelete", async function (next) {
  try {
    const docToDel = await this.model.findOne(this.getQuery());
    if (docToDel) {
      const publicIds = [];
      if (docToDel.image?.public_id) {
        publicIds.push(docToDel.image.public_id);
      }
      if (docToDel.subCategories) {
        docToDel.subCategories.forEach((sub) => {
          if (sub.image?.public_id) {
            publicIds.push(sub.image.public_id);
          }
        });
      }

      if (publicIds.length > 0) {
        await deleteFromCloudinaryBatch(publicIds);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Category", categorySchema);
