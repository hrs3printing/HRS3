function normalizeError(err) {
  // Our own operational errors
  if (err?.name === "AppError" && err?.isOperational) {
    return err;
  }

  // Multer file upload errors
  if (err?.name === "MulterError") {
    err.statusCode = 400;
    err.isOperational = true;
    err.message = err.message || "Invalid upload";
    return err;
  }

  // Mongoose / MongoDB
  if (err?.name === "CastError") {
    err.statusCode = 400;
    err.isOperational = true;
    err.message = "Invalid identifier";
    return err;
  }

  if (err?.name === "ValidationError") {
    err.statusCode = 400;
    err.isOperational = true;
    err.message = "Validation failed";
    return err;
  }

  if (err?.code === 11000) {
    err.statusCode = 400;
    err.isOperational = true;
    err.message = "Duplicate value";
    return err;
  }

  // JWT errors (for routes that do verify manually)
  if (err?.name === "JsonWebTokenError") {
    err.statusCode = 401;
    err.isOperational = true;
    err.message = "Invalid token";
    return err;
  }
  if (err?.name === "TokenExpiredError") {
    err.statusCode = 401;
    err.isOperational = true;
    err.message = "Token expired";
    return err;
  }

  return err;
}

export const errorHandler = (err, req, res, _next) => {
  const isProd = process.env.NODE_ENV === "production";
  const normalized = normalizeError(err);

  const statusCode =
    normalized?.statusCode ||
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  const isOperational = Boolean(normalized?.isOperational) || statusCode < 500;
  const message =
    isProd && !isOperational
      ? "Internal server error"
      : normalized?.message || "Server error";

  if (statusCode >= 500) {
    console.error(
      `💥 [${req.requestId || "no-request-id"}] ${req.method} ${req.originalUrl}: ${normalized?.stack || normalized?.message || "Unknown error"}`,
    );
  }

  res.status(statusCode).json({
    success: false,
    message,
    requestId: req.requestId,
    ...(isProd ? {} : { stack: normalized?.stack }),
  });
};
