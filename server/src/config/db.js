import mongoose from "mongoose";

const connectDB = async () => {
  const maxAttempts = Number(process.env.DB_CONNECT_MAX_RETRIES || 5);
  const baseDelayMs = Number(process.env.DB_CONNECT_RETRY_BASE_MS || 2000);
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      // Listen for connection errors after initial connection
      mongoose.connection.on("error", (err) => {
        console.error(`❌ MongoDB connection error: ${err}`);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("✅ MongoDB reconnected");
      });

      return;
    } catch (error) {
      attempt += 1;
      const isLastAttempt = attempt >= maxAttempts;
      const delayMs = baseDelayMs * attempt;

      console.error(
        `❌ DB connection failed (attempt ${attempt}/${maxAttempts}): ${error.message}`,
      );

      if (isLastAttempt) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export default connectDB;