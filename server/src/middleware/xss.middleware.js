function sanitizeString(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function deepSanitize(value) {
  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }

  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      value[key] = deepSanitize(value[key]);
    }
    return value;
  }

  return typeof value === "string" ? sanitizeString(value) : value;
}

export const xssSanitizeRequest = (req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    deepSanitize(req.body);
  }

  if (req.params && typeof req.params === "object") {
    deepSanitize(req.params);
  }

  if (req.query && typeof req.query === "object") {
    deepSanitize(req.query);
  }

  next();
};
