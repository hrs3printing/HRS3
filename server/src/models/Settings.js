import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    logo: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
      width: { type: Number, default: 120 }, // default width in px
    },
    contact: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      address: { type: String, default: "" },
    },
    socials: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    about: { type: String, default: "" },
    fabrics: { type: [String], default: [] },
    printTypes: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("Settings", settingsSchema);
