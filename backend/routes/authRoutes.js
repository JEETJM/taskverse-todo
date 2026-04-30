import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  uploadProfileImage
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put(
  "/profile/avatar",
  protect,
  upload.single("avatar"),
  uploadProfileImage
);

export default router;