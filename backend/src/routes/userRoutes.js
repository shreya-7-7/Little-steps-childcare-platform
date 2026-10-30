import express from "express";

console.log("USER ROUTES FILE LOADED");

import authMiddleware from "../middleware/authMiddleware.js";
import { updateUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ success: true });
});

router.put("/profile", authMiddleware, updateUserProfile);

export default router;
