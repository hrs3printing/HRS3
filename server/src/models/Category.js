import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: {
      url: String,
      public_id: String,
    },
    subCategories: [String],
  },
  { timestamps: true },
);

export default mongoose.model("Category", categorySchema);
