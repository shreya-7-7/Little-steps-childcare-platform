import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (
        parts.length === 2 &&
        parts[0] === "Bearer" &&
        parts[1] &&
        parts[1] !== "null" &&
        parts[1] !== "undefined"
      ) {
        token = parts[1];
      }
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const secret =
      process.env.JWT_SECRET || "little_steps_jwt_secret_dev_key_2026_super_secure";

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      // If Bearer token was expired or invalid, fallback to cookie if present
      if (req.cookies?.token && token !== req.cookies.token) {
        try {
          decoded = jwt.verify(req.cookies.token, secret);
          token = req.cookies.token;
        } catch {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by the administrator.",
      });
    }

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

export default authMiddleware;
