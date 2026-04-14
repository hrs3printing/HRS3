export default class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {object} [meta]
   */
  constructor(message, statusCode = 500, meta) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    if (meta) this.meta = meta;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

