import express from "express";
import * as tourismController from "../controllers/tourismController";
import * as tourismImageController from "../controllers/tourismImageController";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { tourismUpload } from "../middleware/upload.middleware";

const router = express.Router();

// Public routes - no authentication needed
router.get("/", tourismController.getAllTourism);
router.get("/featured", tourismController.getFeaturedTourism);
router.get("/:id", tourismController.getTourismById);
router.get("/:id/images", tourismController.getTourismWithImages);

// Protected routes - need authentication
router.use(authenticate); // Apply authentication middleware to all routes below

// Image routes - admin only
router.get("/:tourismId/images", tourismImageController.getTourismImages);
router.post(
  "/:tourismId/images",
  authorize(["admin"]),
  tourismUpload.array("images", 10), // Allow up to 10 images
  tourismImageController.uploadTourismImages
);
router.put(
  "/images/:id/primary",
  authorize(["admin"]),
  tourismImageController.setAsPrimaryImage
);
router.put(
  "/images/:id",
  authorize(["admin"]),
  tourismImageController.updateImage
);
router.delete(
  "/images/:id",
  authorize(["admin"]),
  tourismImageController.deleteImage
);

// Admin-only tourism routes
router.post(
  "/upload",
  authorize(["admin"]),
  tourismUpload.single("image"),
  tourismController.uploadTourismImage
);
router.post("/", authorize(["admin"]), tourismController.createTourism);
router.put("/:id", authorize(["admin"]), tourismController.updateTourism);
router.delete("/:id", authorize(["admin"]), tourismController.deleteTourism);

export default router;
