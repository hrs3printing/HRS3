/**
 * Promote a user to admin (run from server/):
 *   node scripts/promoteAdmin.js you@email.com
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/promoteAdmin.js <email>");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
const user = await User.findOne({
  email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
});
if (!user) {
  console.error(`No user found with email ${email}`);
  process.exit(1);
}
user.role = "admin";
await user.save();
console.log(`Updated: ${user.email} is now admin`);
await mongoose.disconnect();
