import AppError from "../utils/AppError.js";

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return next(new AppError("Admin access required", 403));
    }
    next();
  } catch (e) {
    next(e);
  }
};
