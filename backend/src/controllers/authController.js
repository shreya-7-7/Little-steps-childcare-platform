import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import generateToken from "../utils/generateToken.js";

// =============================
// Register
// =============================
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      qualification,
      experience,
      governmentId,
    } = req.body;

    // 1. Required Fields Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const formattedName = name.trim();
    const formattedEmail = email.trim().toLowerCase();

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formattedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Role Security: Admin accounts cannot be created via public registration
    const userRole = (role || "parent").toLowerCase();
    if (userRole === "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin accounts cannot be created via public registration",
      });
    }

    if (!["parent", "provider"].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be parent or provider",
      });
    }

    // Provider Specific Validations
    if (userRole === "provider") {
      if (
        !phone ||
        !address ||
        !qualification ||
        experience === undefined ||
        experience === null ||
        experience === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Phone, address, qualification, and years of experience are required for provider registration",
        });
      }
    }

    // Password Length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // 2. Duplicate Email Check
    const existingUser = await User.findOne({
      email: formattedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists. Please log in or use a different email.",
      });
    }

    // 3. Hash Password Securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User Record
    const user = await User.create({
      name: formattedName,
      email: formattedEmail,
      password: hashedPassword,
      role: userRole,
      status: userRole === "provider" ? "pending" : "active",
      isApproved: userRole === "provider" ? false : true,
    });

    // 5. Create Provider Profile if Provider
    if (userRole === "provider") {
      await Provider.create({
        user: user._id,
        phone: phone.trim(),
        address: address.trim(),
        qualification: qualification.trim(),
        experience: Number(experience) || 0,
        governmentId: governmentId ? governmentId.trim() : "",
        profileImage: req.file?.path || "",
        verificationStatus: "pending",
      });
    }

    // 6. Response & Session Cookie for Parent Accounts
    let token = null;
    if (userRole === "parent") {
      token = generateToken(user._id, user.role);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        userRole === "provider"
          ? "Provider registration submitted successfully. Your account is pending administrator verification."
          : "Parent registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    if (
      error.code === 11000 ||
      (error.message && error.message.includes("E11000"))
    ) {
      return res.status(409).json({
        success: false,
        message: "Email already exists. Please log in or use a different email.",
      });
    }

    console.error("REGISTER ERROR:", error.message || error);
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// =============================
// Login
// =============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const formattedEmail = email.trim().toLowerCase();

    // 1. Find User by Normalized Email
    const user = await User.findOne({
      email: formattedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 2. Compare Password
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Blocked User Check
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by the administrator.",
      });
    }

    // 4. Provider Verification Checks
    if (user.role === "provider") {
      const provider = await Provider.findOne({
        user: user._id,
      });

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: "Provider profile not found.",
        });
      }

      if (provider.verificationStatus === "pending") {
        return res.status(403).json({
          success: false,
          message:
            "Your provider account is waiting for administrator approval.",
        });
      }

      if (provider.verificationStatus === "rejected") {
        return res.status(403).json({
          success: false,
          message:
            "Your provider application has been rejected by the administrator.",
        });
      }

      if (!user.isApproved) {
        return res.status(403).json({
          success: false,
          message: "Your provider account has not been approved yet.",
        });
      }
    }

    // 5. Generate Token and Set Secure Cookie
    const token = generateToken(user._id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message || error);
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// =============================
// Logout
// =============================
const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// =============================
// Current User
// =============================
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (req.user.status === "blocked") {
      res.clearCookie("token");
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by the administrator.",
      });
    }

    return res.status(200).json({
      success: true,
      token: req.token,
      user: {
        id: req.user._id,
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        isApproved: req.user.isApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// Update Profile
// =============================
const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name.trim();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error.message || error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// =============================
// Forgot Password
// =============================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Consistent response message regardless of user existence to prevent account enumeration
    const successMessage =
      "If an account exists with this email address, password reset instructions have been generated.";

    if (!user) {
      return res.status(200).json({
        success: true,
        message: successMessage,
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA256 hashed token in the database
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Expiry: 15 minutes
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // Note: If an external SMTP or SendGrid service is configured, dispatch email here.
    // In development environments without email credentials, the reset URL is returned in dev mode
    const isDev = process.env.NODE_ENV !== "production";

    return res.status(200).json({
      success: true,
      message: successMessage,
      ...(isDev ? { devResetUrl: resetUrl } : {}),
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error.message || error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process password recovery request",
    });
  }
};

// =============================
// Reset Password
// =============================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash incoming token to match stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or has expired",
      });
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error.message || error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password",
    });
  }
};

export {
  register,
  login,
  logout,
  getCurrentUser,
  updateUserProfile,
  forgotPassword,
  resetPassword,
};
