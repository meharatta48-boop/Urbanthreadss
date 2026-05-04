import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30;
const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/* =====================
   SIGNUP
===================== */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "All fields are required", 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return sendError(res, "User already exists", 400);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // default role
    });

    return sendSuccess(res, {
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   LOGIN (USER + ADMIN)
===================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return sendError(res, "Invalid credentials", 401);

    if (user.isActive === false) {
      return sendError(res, "Account is disabled", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return sendError(res, "Invalid credentials", 401);

    // ✅ Generate token
    const token = generateToken(user._id);

    // 🔹 Admin: return all users
    if (user.role === "admin") {
      const users = await User.find()
        .sort({ createdAt: -1 })
        .select("name email role isActive createdAt");

      return sendSuccess(res, {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        users,
      });
    }

    // 🔹 Regular user: return only their info
    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   FORGOT PASSWORD
   Note: Requires old password for basic security verification
   (Production mein email OTP system use karo)
===================== */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.passwordResetTokenHash = hashResetToken(resetToken);
      user.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const resetUrlBase = process.env.FRONTEND_RESET_PASSWORD_URL || `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password`;
      const resetLink = `${resetUrlBase}?token=${encodeURIComponent(resetToken)}`;

      console.log(
        JSON.stringify({
          level: "info",
          event: "password_reset_requested",
          userId: user._id.toString(),
          email: user.email,
          resetLink,
        })
      );

      if (process.env.NODE_ENV !== "production") {
        return sendSuccess(res, {
          message: "If the email exists, a reset link has been generated.",
          resetToken,
          resetLink,
        });
      }
    }

    return sendSuccess(res, {
      message: "If the email exists, a password reset link will be sent shortly.",
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const tokenHash = hashResetToken(token);

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+password +passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) {
      return sendError(res, "Reset token is invalid or expired", 400);
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return sendSuccess(res, {
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   GET ALL USERS (admin only)
===================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("name email role isActive createdAt");
    return sendSuccess(res, { users });
  } catch (error) {
    return sendError(res, error.message);
  }
};
