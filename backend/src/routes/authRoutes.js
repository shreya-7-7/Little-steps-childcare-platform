import express from "express";

import {
  register,
  login,
  logout,
  getCurrentUser,
  updateUserProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* Public Routes */
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

/* Protected Routes */
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateUserProfile);

export default router;
