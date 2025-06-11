import express from "express";
import * as forumController from "../controllers/forumController";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = express.Router();

// Public routes (no authentication required)
router.get("/categories", forumController.getAllCategories);
router.get("/categories/:categoryId", forumController.getCategoryById);
router.get(
  "/categories/:categoryId/threads",
  forumController.getThreadsByCategory
);
router.get("/threads/recent", forumController.getRecentThreads);
router.get("/stats", forumController.getForumStats);

// Routes that can work with or without auth (for reactions)
router.get(
  "/threads/:threadId",
  optionalAuthenticate,
  forumController.getThreadById
);

// Protected routes (authentication required)
router.post(
  "/categories/:categoryId/threads",
  authenticate,
  forumController.createThread
);
router.post(
  "/threads/:threadId/posts",
  authenticate,
  forumController.createPost
);
router.put("/threads/:threadId", authenticate, forumController.updateThread);
router.put("/posts/:postId", authenticate, forumController.updatePost);
router.delete("/threads/:threadId", authenticate, forumController.deleteThread);
router.delete("/posts/:postId", authenticate, forumController.deletePost);

// Admin routes - category management
router.post(
  "/admin/categories",
  authenticate,
  authorize(["admin"]),
  forumController.createCategory
);
router.put(
  "/admin/categories/:categoryId",
  authenticate,
  authorize(["admin"]),
  forumController.updateCategory
);
router.delete(
  "/admin/categories/:categoryId",
  authenticate,
  authorize(["admin"]),
  forumController.deleteCategory
);

// Admin routes - moderation
router.get(
  "/admin/reports",
  authenticate,
  authorize(["admin"]),
  forumController.getReportedContent
);

export default router;
