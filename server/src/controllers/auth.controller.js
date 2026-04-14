import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { getAuthCookieOptions } from "../utils/cookieOptions.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendEmail } from "../utils/email.js";

const jwtExpire = process.env.JWT_EXPIRE || "24h";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const emailVerificationExpiryMs = Number(
  process.env.EMAIL_VERIFICATION_EXPIRE_MS || 24 * 60 * 60 * 1000,
);
const passwordResetExpiryMs = Number(
  process.env.PASSWORD_RESET_EXPIRE_MS || 15 * 60 * 1000,
);

function getPrimaryClientOrigin() {
  const candidates = [
    process.env.CLIENT_URL,
    process.env.ALLOWED_ORIGINS,
    process.env.CLIENT_ORIGIN,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return candidates[0] || "http://localhost:5173";
}

function createEmailVerificationToken() {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const tokenHash = crypto.createHash("sha256").update(otp).digest("hex");
  return { otp, tokenHash };
}

function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

function getResetPasswordUrl(token) {
  const explicit = String(process.env.RESET_PASSWORD_URL || "")
    .trim()
    .replace(/\/$/, "");
  const base = explicit || getPrimaryClientOrigin();
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}


async function sendVerificationEmail(user) {
  const { otp, tokenHash } = createEmailVerificationToken();
  const expiresAt = new Date(Date.now() + emailVerificationExpiryMs);

  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpiresAt = expiresAt;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Verify your email for HRS3",
    text: `Welcome to HRS3.\n\nYour verification OTP is: ${otp}\n\nEnter this code on the Verify Email page in the app.\n\nThis code expires in 24 hours.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Welcome to HRS3</h2>
        <p>Please verify your email to complete signup.</p>
        <p>Your verification code is:</p>
        <p style="font-size:24px;font-weight:700;letter-spacing:4px">${otp}</p>
        <p>Enter this code on the Verify Email page in the app.</p>
        <p>This code expires in 24 hours.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(user) {
  const { token, tokenHash } = createPasswordResetToken();
  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = new Date(Date.now() + passwordResetExpiryMs);
  await user.save();

  const resetUrl = getResetPasswordUrl(token);
  const expiresMinutes = Math.max(1, Math.round(passwordResetExpiryMs / 60000));
  await sendEmail({
    to: user.email,
    subject: "Reset your HRS3 password",
    text: `We received a request to reset your HRS3 password.\n\nUse this link to set a new password:\n${resetUrl}\n\nThis link expires in ${expiresMinutes} minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 12px">Reset your HRS3 password</h2>
        <p style="margin:0 0 12px">
          We received a request to reset your password.
        </p>
        <p style="margin:0 0 16px">
          <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px">
            Reset Password
          </a>
        </p>
        <p style="margin:0 0 8px">This link expires in ${expiresMinutes} minutes.</p>
        <p style="margin:0;color:#6b7280">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}


// GENERATE TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: jwtExpire,
  });
};

// REGISTER
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name?.trim() || !email?.trim() || !password) {
    throw new AppError("Name, email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!emailRegex.test(normalizedEmail)) {
    throw new AppError("Invalid email format", 400);
  }

  if (!passwordRegex.test(password)) {
    throw new AppError(
      "Password must be at least 8 characters and include uppercase, lowercase and a number",
      400,
    );
  }

  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  const allowAdminPromotion =
    process.env.ALLOW_ADMIN_EMAIL_PROMOTION === "true" ||
    process.env.ALLOW_ADMIN_EMAIL_PROMOTION === "1";

  const role =
    allowAdminPromotion &&
    process.env.ADMIN_EMAIL &&
    normalizedEmail === String(process.env.ADMIN_EMAIL).toLowerCase()
      ? "admin"
      : "user";

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
  });

  try {
    await sendVerificationEmail(user);
  } catch (err) {
    console.error("⚠️ Verification email failed:", err.message);
  }

  return res.status(201).json({
    success: true,
    message: "Signup successful. Please verify your email before logging in.",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      isEmailVerified: user.isEmailVerified,
    },
    verificationEmailSent: true,
    requiresEmailVerification: true,
    verificationTarget: { email: user.email },
  });
});

// LOGIN
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError(
      "Please verify your email before logging in. You can request a new verification email.",
      403,
    );
  }

  const token = generateToken(user._id);
  res.cookie("token", token, getAuthCookieOptions());

  return res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      isEmailVerified: user.isEmailVerified,
    },
    token,
  });
});

// LOGOUT
export const logoutUser = (req, res) => {
  const opts = getAuthCookieOptions();
  res.clearCookie("token", {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path || "/",
    ...(opts.domain ? { domain: opts.domain } : {}),
  });

  res.status(200).json({ success: true, message: "Logged out" });
};

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "_id name email role isEmailVerified",
  );
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  return res.status(200).json({ success: true, user });
});

export const getSessionStatus = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(200)
      .json({ success: true, authenticated: false, user: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "_id name email role isEmailVerified",
    );
    if (!user) {
      return res
        .status(200)
        .json({ success: true, authenticated: false, user: null });
    }

    // Sliding session: active users get a fresh 24h token/cookie.
    const refreshedToken = generateToken(user._id);
    res.cookie("token", refreshedToken, getAuthCookieOptions());

    return res.status(200).json({ success: true, authenticated: true, user });
  } catch {
    const opts = getAuthCookieOptions();
    res.clearCookie("token", {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path || "/",
      ...(opts.domain ? { domain: opts.domain } : {}),
    });

    return res
      .status(200)
      .json({ success: true, authenticated: false, user: null });
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const otp = String(req.body?.otp || "").trim();
  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400);
  }

  const tokenHash = crypto.createHash("sha256").update(otp).digest("hex");
  const user = await User.findOne({
    email,
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() },
  }).select("+emailVerificationTokenHash +emailVerificationExpiresAt");

  if (!user) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpiresAt = null;
  await user.save();

  const token = generateToken(user._id);
  res.cookie("token", token, getAuthCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Email verified successfully. You are now logged in.",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      isEmailVerified: user.isEmailVerified,
    },
    token,
  });
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user || user.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: "If the account exists, a verification email has been sent.",
    });
  }

  await sendVerificationEmail(user);
  return res.status(200).json({
    success: true,
    message: "Verification email sent.",
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (user) {
    try {
      await sendPasswordResetEmail(user);
    } catch (err) {
      console.error("⚠️ Password reset email failed:", err.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: "If the account exists, a password reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = String(req.body?.token || "").trim();
  const password = String(req.body?.password || "");

  if (!token || !password) {
    throw new AppError("Token and new password are required", 400);
  }

  if (!passwordRegex.test(password)) {
    throw new AppError(
      "Password must be at least 8 characters and include uppercase, lowercase and a number",
      400,
    );
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpiresAt");

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  user.password = password;
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await user.save();

  const authCookieOptions = getAuthCookieOptions();
  res.clearCookie("token", {
    httpOnly: authCookieOptions.httpOnly,
    secure: authCookieOptions.secure,
    sameSite: authCookieOptions.sameSite,
    path: authCookieOptions.path || "/",
    ...(authCookieOptions.domain ? { domain: authCookieOptions.domain } : {}),
  });

  return res.status(200).json({
    success: true,
    message: "Password reset successful. Please log in with your new password.",
  });
});
