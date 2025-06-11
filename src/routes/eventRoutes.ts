import express from "express";
import * as eventController from "../controllers/eventController";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { eventUpload } from "../middleware/upload.middleware";

const router = express.Router();

// Public routes
router.get("/", eventController.getAllEvents);
router.get("/upcoming", eventController.getUpcomingEvents);
router.get("/:id", eventController.getEventById);

// Protected routes (admin only)
router.post("/", authenticate, requireAdmin, eventController.createEvent);
router.put("/:id", authenticate, requireAdmin, eventController.updateEvent);
router.delete("/:id", authenticate, requireAdmin, eventController.deleteEvent);

// File upload route
router.post(
  "/upload",
  authenticate,
  requireAdmin,
  eventUpload.single("image"),
  eventController.uploadImage
);

export default router;
