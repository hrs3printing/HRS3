/**
 * Auth cookie options for production (HTTPS, cross-subdomain) vs development.
 * Cross-site SPAs (api.* vs www.*): set COOKIE_SAME_SITE=none (Secure is required).
 * Same-site behind HTTPS: default secure in production unless COOKIE_SECURE=false.
 */
export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const raw = (process.env.COOKIE_SAME_SITE || "").toLowerCase();
  const sameSite =
    raw === "none" || raw === "lax" || raw === "strict"
      ? raw
      : "lax";

  const insecure =
    process.env.COOKIE_SECURE === "false" || process.env.COOKIE_SECURE === "0";
  const secure = sameSite === "none" ? true : isProd && !insecure;

  const sessionHours = Number(process.env.AUTH_SESSION_HOURS || 24);
  const maxAgeMs = Math.max(sessionHours, 1) * 60 * 60 * 1000;

  const opts = {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: maxAgeMs,
  };

  // Domain-scoped cookies usually break localhost auth in development.
  if (isProd && process.env.COOKIE_DOMAIN) {
    opts.domain = process.env.COOKIE_DOMAIN;
  }

  if (process.env.COOKIE_PATH) {
    opts.path = process.env.COOKIE_PATH;
  }

  return opts;
}
