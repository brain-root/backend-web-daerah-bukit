import express, { Request, Response } from "express";
import * as businessController from "../controllers/businessController";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { businessUpload } from "../middleware/upload.middleware";

const router = express.Router();

// Public routes
router.get("/", businessController.getAllBusinesses);
router.get("/featured", businessController.getFeaturedBusinesses); // Add this line
router.get("/:id", businessController.getBusinessById);

// Protected routes (admin only)
router.post("/", authenticate, requireAdmin, businessController.createBusiness);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  businessController.updateBusiness
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  businessController.deleteBusiness
);

// File upload route
router.post(
  "/upload",
  authenticate,
  requireAdmin,
  businessUpload.single("image"),
  businessController.uploadImage
);

export default router;
