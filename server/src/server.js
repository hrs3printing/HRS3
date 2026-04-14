// ======================
// ⚡ ENTRY — env must load before ANY other import reads process.env
// ======================
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import { rateLimit } from "express-rate-limit";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { sanitizeRequest } from "./middleware/sanitize.middleware.js";
import { xssSanitizeRequest } from "./middleware/xss.middleware.js";

// ESM doesn't have __dirname natively
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";
const serveStatic = process.env.SERVE_STATIC === "true";

function getNumberEnv(name, fallback, min) {
  const raw = process.env[name];
  const value = raw === undefined || raw === "" ? fallback : Number(raw);
  if (!Number.isFinite(value) || value < min) {
    console.error(`❌ ${name} must be a number >= ${min}`);
    process.exit(1);
  }
  return value;
}

const requestTimeoutMs = getNumberEnv("REQUEST_TIMEOUT_MS", 30000, 5000);
const authRateLimitMax = getNumberEnv("AUTH_RATE_LIMIT_MAX", 15, 1);
const adminRateLimitMax = getNumberEnv("ADMIN_RATE_LIMIT_MAX", 200, 1);
const generalRateLimitMax = getNumberEnv("RATE_LIMIT_MAX", 300, 1);

function assertRequiredEnv(name) {
  if (!process.env[name]) {
    console.error(`❌ Missing required env: ${name}`);
    process.exit(1);
  }
}

assertRequiredEnv("MONGO_URI");

if (isProd) {
  assertRequiredEnv("JWT_SECRET");

  if ((process.env.JWT_SECRET || "").length < 32) {
    console.error("❌ JWT_SECRET must be at least 32 characters in production");
    process.exit(1);
  }

  if (!process.env.ALLOWED_ORIGINS && !process.env.CLIENT_ORIGIN) {
    console.warn(
      "⚠️  ALLOWED_ORIGINS/CLIENT_ORIGIN not set; using built-in hostname allowlist",
    );
  }
}

// ======================
// 🔌 CONNECT DB — exit if connection fails
// ======================
try {
  await connectDB();
  console.log("✅ Database connected");
} catch (err) {
  console.error("❌ DB connection failed:", err.message);
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");

// Attach request IDs to simplify production tracing across logs/reports.
app.use((req, res, next) => {
  const requestId = req.get("x-request-id") || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
});

// Fail long-running requests deterministically instead of hanging sockets.
app.use((req, res, next) => {
  req.setTimeout(requestTimeoutMs);
  res.setTimeout(requestTimeoutMs);
  next();
});

// ======================
// 🌐 TRUST PROXY (Render / Railway / production)
// ======================
if (
  process.env.TRUST_PROXY === "true" ||
  process.env.TRUST_PROXY === "1" ||
  isProd
) {
  app.set("trust proxy", 1);
}

// ======================
// 🔥 CORS
// ======================
const configuredOrigins = (
  process.env.ALLOWED_ORIGINS ||
  process.env.CLIENT_ORIGIN ||
  ""
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOriginHosts = new Set([
  "hrs3.in",
  "www.hrs3.in",
  "admin.hrs3.in",
  ...configuredOrigins
    .map((origin) => {
      try {
        return new URL(origin).hostname;
      } catch {
        return origin
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "")
          .trim();
      }
    })
    .filter(Boolean),
  ...(process.env.NODE_ENV !== "production" ? ["localhost"] : []),
]);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    try {
      const { hostname } = new URL(origin);
      const isAllowed =
        allowedOriginHosts.has(hostname) ||
        hostname.endsWith(".vercel.app") ||
        (process.env.NODE_ENV !== "production" && hostname === "127.0.0.1");

      if (isAllowed) return callback(null, true);
    } catch {
      // malformed origin, deny below
    }

    console.warn(`❌ CORS blocked: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  exposedHeaders: ["x-request-id"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// ======================
// 📦 BODY PARSING — must come before sanitizers so req.body exists
// ======================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ======================
// 🔐 SECURITY MIDDLEWARE
// ======================

// HPP — must come after body parsing to protect req.body fields too
app.use(hpp());

// Data sanitization against NoSQL query injection
app.use(sanitizeRequest);

// Data sanitization against XSS
app.use(xssSanitizeRequest);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(compression());

// ======================
// 🚫 RATE LIMITING
// ======================
const isDev = process.env.NODE_ENV !== "production";
const rateLimitDisabled =
  process.env.RATE_LIMIT_DISABLED === "true" ||
  process.env.RATE_LIMIT_DISABLED === "1";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again later." },
  skip: () => isDev || rateLimitDisabled,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: adminRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev || rateLimitDisabled,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: generalRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    isDev ||
    rateLimitDisabled ||
    req.path.startsWith("/auth") ||
    req.path.startsWith("/admin"),
});

app.use("/api/auth", authLimiter);
app.use("/api/admin", adminLimiter);
app.use("/api", generalLimiter);

// ======================
// ❤️ HEALTHCHECKS (Render)
// ======================
app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true, service: "hrs3-api" });
});
app.get("/readyz", (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    ok: isDbConnected,
    db: isDbConnected ? "connected" : "disconnected",
  });
});

// ======================
// 📂 STATIC FILES — uploads
// ======================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    maxAge: 0,
    etag: true,
  }),
);

// ======================
// 🚀 API ROUTES
// ======================
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ======================
// 🌐 SERVE FRONTEND (OPTIONAL — monorepo mode)
// ======================
const rootDir = path.resolve(__dirname, "../..");
const clientDist = path.join(rootDir, "client", "dist");
const adminDist = path.join(rootDir, "admin", "dist");

if (serveStatic && existsSync(clientDist)) {
  if (existsSync(adminDist)) {
    app.use("/admin", express.static(adminDist));

    app.get(/^\/admin\//, (req, res) => {
      res.sendFile(path.join(adminDist, "index.html"));
    });
  }

  app.use(express.static(clientDist));

  // Express 5-safe SPA fallback (exclude API and uploads)
  app.get(/^(?!\/api(?:\/|$)|\/uploads(?:\/|$)).*/, (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.json({ success: true, message: "HRS3 API is running 🚀" });
  });
}

// ======================
// ❌ GLOBAL ERROR HANDLER
// ======================
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
});

app.use(errorHandler);

// ======================
// 🚀 START SERVER + GRACEFUL SHUTDOWN
// ======================
const PORT = process.env.PORT || 5000;
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`⚠️  ${signal} received — shutting down gracefully...`);
  const forceCloseTimer = setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);

  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");
    } catch (err) {
      console.error("❌ Failed to close MongoDB connection:", err.message);
    }

    clearTimeout(forceCloseTimer);
    console.log("✅ Server closed");
    process.exit(0);
  });
};

const server = app.listen(PORT, () => {
  console.log(
    `🔥 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
  );
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});
