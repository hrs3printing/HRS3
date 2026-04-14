const MONGO_OPERATOR_REGEX = /^\$|^\./;

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (MONGO_OPERATOR_REGEX.test(key)) {
        delete value[key];
        continue;
      }
      value[key] = sanitizeValue(value[key]);
    }
  }

  return value;
}

export const sanitizeRequest = (req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    sanitizeValue(req.body);
  }

  if (req.params && typeof req.params === "object") {
    sanitizeValue(req.params);
  }

  if (req.query && typeof req.query === "object") {
    sanitizeValue(req.query);
  }

  next();
};
