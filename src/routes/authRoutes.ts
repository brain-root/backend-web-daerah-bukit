import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validation.middleware";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validators/authValidators";

const router = express.Router();

// Public routes
router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  resetPassword
);

// Protected routes
router.use(authenticate);
router.get("/me", getMe);
router.post("/logout", logout);

export default router;
