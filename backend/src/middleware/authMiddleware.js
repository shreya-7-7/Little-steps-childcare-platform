import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const secret =
      process.env.JWT_SECRET || "little_steps_jwt_secret_dev_key_2026_super_secure";
    const decoded = jwt.verify(token, secret);

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
