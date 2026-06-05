import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";
import LoginHistory from "../models/loginHistory.model.js";
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
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "";
    const userAgent = req.headers["user-agent"] || "";

    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      await LoginHistory.create({ email, ipAddress, userAgent, status: "failed", failureReason: "Invalid email" });
      return sendError(res, "Invalid credentials", 401);
    }

    if (user.isActive === false) {
      await LoginHistory.create({ userId: user._id, email: user.email, ipAddress, userAgent, status: "failed", failureReason: "Account disabled" });
      return sendError(res, "Account is disabled", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await LoginHistory.create({ userId: user._id, email: user.email, ipAddress, userAgent, status: "failed", failureReason: "Wrong password" });
      return sendError(res, "Invalid credentials", 401);
    }

    // Record successful login
    await LoginHistory.create({ userId: user._id, email: user.email, ipAddress, userAgent, status: "success" });

    // ✅ Generate token
    const token = generateToken(user._id);

    // 🔹 Admin: return all users
    if (user.role === "admin") {
      const users = await User.find()
        .sort({ createdAt: -1 })
        .select("name email role isActive createdAt loyaltyPoints storeCredit customerSegment phone");

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
   GET ALL USERS (admin only, paginated)
===================== */
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, Number.parseInt(req.query.limit, 10) || 20), 100);
    const skip = (page - 1) * limit;

    const query = {};
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .select("name email role isActive createdAt loyaltyPoints storeCredit customerSegment phone")
      .skip(skip)
      .limit(limit);

    const pages = Math.ceil(total / limit);

    return sendSuccess(res, {
      users,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   UPDATE USER ROLE (admin only)
   PUT /api/auth/users/:userId/role
===================== */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return sendError(res, "Invalid role. Must be 'user' or 'admin'", 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("name email role isActive createdAt");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, {
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   TOGGLE USER STATUS (admin only)
   PUT /api/auth/users/:userId/status
===================== */
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select("name email role isActive createdAt");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, {
      message: `User status updated to ${isActive ? "Active" : "Blocked"}`,
      user,
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   DELETE USER (admin only)
   DELETE /api/auth/users/:userId
===================== */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, {
      message: "User deleted successfully",
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   UPDATE USER LOYALTY (admin only)
   PUT /api/auth/users/:userId/loyalty
===================== */
export const updateUserLoyalty = async (req, res) => {
  try {
    const { userId } = req.params;
    const { loyaltyPoints } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { loyaltyPoints: Number(loyaltyPoints) || 0 },
      { new: true }
    );

    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, { message: "Loyalty points updated", user });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   UPDATE USER CREDIT (admin only)
   PUT /api/auth/users/:userId/credit
===================== */
export const updateUserCredit = async (req, res) => {
  try {
    const { userId } = req.params;
    const { storeCredit } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { storeCredit: Number(storeCredit) || 0 },
      { new: true }
    );

    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, { message: "Store credits updated", user });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   UPDATE USER SEGMENT (admin only)
   PUT /api/auth/users/:userId/segment
===================== */
export const updateUserSegment = async (req, res) => {
  try {
    const { userId } = req.params;
    const { customerSegment } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { customerSegment },
      { new: true }
    );

    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, { message: "Segment updated", user });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   UPDATE USER PHONE (admin only)
   PUT /api/auth/users/:userId/phone
===================== */
export const updateUserPhone = async (req, res) => {
  try {
    const { userId } = req.params;
    const { phone } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { phone },
      { new: true }
    );

    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, { message: "Phone number updated", user });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   GET LOGIN HISTORY (admin only)
===================== */
export const getLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    return sendSuccess(res, { history });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/* =====================
   2FA READINESS (admin or user own account)
===================== */
export const generate2faSecret = async (req, res) => {
  try {
    const secret = crypto.randomBytes(20).toString("hex");
    const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString("hex"));

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, "User not found", 404);

    user.twoFactorSecret = secret;
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    return sendSuccess(res, {
      secret,
      backupCodes,
      qrCodePlaceholder: `otpauth://totp/UrbanThreads:${user.email}?secret=${secret}&issuer=UrbanThreads`
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const enable2fa = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return sendError(res, "Verification code is required", 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, "User not found", 404);

    user.isTwoFactorEnabled = true;
    await user.save();

    return sendSuccess(res, { message: "Two-factor authentication enabled successfully" });
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const disable2fa = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, "User not found", 404);

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = [];
    await user.save();

    return sendSuccess(res, { message: "Two-factor authentication disabled" });
  } catch (error) {
    return sendError(res, error.message);
  }
};
