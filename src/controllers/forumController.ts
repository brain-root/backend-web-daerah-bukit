import { Request, Response } from "express";
import ForumCategoryModel from "../models/ForumCategory";
import ForumThreadModel from "../models/ForumThread";
import ForumPostModel from "../models/ForumPost";
import { pool } from "../config/db"; // Import pool from db config

/**
 * Interface for reported content structure
 */
interface ReportedContent {
  id: number;
  content_type: string;
  content_id: number;
  reporter_id: string;
  reporter_name: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/**
 * Get all forum categories
 */
export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await ForumCategoryModel.getCategoriesWithThreadCount();
    res.json(categories);
  } catch (error: any) {
    console.error("Get all categories error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const category = await ForumCategoryModel.findById(
      parseInt(categoryId, 10)
    );

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(category);
  } catch (error: any) {
    console.error(
      `Error fetching category with id ${req.params.categoryId}:`,
      error
    );
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Get all threads in a category
 */
export const getThreadsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const categoryIdNum = parseInt(categoryId, 10);

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sort as string) || "newest";

    // Check if category exists
    const category = await ForumCategoryModel.findById(categoryIdNum);
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Get threads by category
    const result = await ForumThreadModel.findByCategory(categoryIdNum, {
      page,
      limit,
      sortBy, // Add sortBy property here
    });

    res.json({
      threads: result.threads,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: page,
    });
  } catch (error: any) {
    console.error("Get threads by category error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Get a thread by ID with its posts
 */
export const getThreadById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startTime = Date.now();
  console.log(
    `[${new Date().toISOString()}] getThreadById request for ID: ${
      req.params.threadId
    }`
  );

  try {
    const { threadId } = req.params;

    // Validate threadId
    const parsedId = parseInt(threadId, 10);
    if (isNaN(parsedId)) {
      console.log(`Invalid thread ID format: "${threadId}"`);
      res.status(400).json({ error: "Invalid thread ID format" });
      return;
    }

    // Get the thread
    console.log(`Fetching thread with ID: ${parsedId}`);
    const thread = await ForumThreadModel.findById(parsedId);

    // Check if thread exists
    if (!thread) {
      console.log(`Thread with ID ${parsedId} not found`);
      res.status(404).json({ error: `Thread with ID ${parsedId} not found` });
      return;
    }

    console.log(`Found thread: ${thread.title}`);

    // Get the posts for this thread
    console.log(`Fetching posts for thread ${parsedId}`);
    const postsData = await ForumPostModel.findByThread(parsedId);
    console.log(`Found ${postsData.posts.length} posts for thread ${parsedId}`);

    // Prepare response with thread and posts
    const response = {
      ...thread,
      posts: postsData.posts,
    };

    const executionTime = Date.now() - startTime;
    console.log(`getThreadById completed in ${executionTime}ms`);

    res.json(response);
  } catch (error: any) {
    console.error(`Error in getThreadById: ${error.message}`);
    console.error(error);
    res.status(500).json({
      error: "Error retrieving thread",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Create a new thread
 */
export const createThread = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { title, content } = req.body;
    const userId = (req as any).user?.id; // From auth middleware

    // Validate input
    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required" });
      return;
    }

    // Check if category exists
    const category = await ForumCategoryModel.findById(
      parseInt(categoryId, 10)
    );
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Create thread
    const threadId = await ForumThreadModel.create({
      title,
      content,
      user_id: userId,
      category_id: parseInt(categoryId, 10),
    });

    // Get the created thread
    const thread = await ForumThreadModel.findById(threadId);

    res.status(201).json(thread);
  } catch (error: any) {
    console.error("Create thread error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Create a post in a thread
 */
export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { threadId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user?.id; // From auth middleware

    // Validate input
    if (!content) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    // Check if thread exists
    const thread = await ForumThreadModel.findById(parseInt(threadId, 10));
    if (!thread) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

    // Create post
    const postId = await ForumPostModel.create({
      content,
      user_id: userId,
      thread_id: parseInt(threadId, 10),
    });

    // Get the created post
    const post = await ForumPostModel.findById(postId);

    res.status(201).json(post);
  } catch (error: any) {
    console.error("Create post error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Update a thread
 */
export const updateThread = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { threadId } = req.params;
    const { title, content } = req.body;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    // Check if thread exists
    const existingThread = await ForumThreadModel.findById(
      parseInt(threadId, 10)
    );
    if (!existingThread) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

    // Check if user has permission to update
    if (existingThread.user_id !== userId && userRole !== "admin") {
      res.status(403).json({ error: "Not authorized to update this thread" });
      return;
    }

    // Update thread
    await ForumThreadModel.update(parseInt(threadId, 10), {
      title: title !== undefined ? title : undefined,
      content: content !== undefined ? content : undefined,
    });

    // Get updated thread
    const updatedThread = await ForumThreadModel.findById(
      parseInt(threadId, 10)
    );

    res.json(updatedThread);
  } catch (error: any) {
    console.error("Update thread error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Update a post
 */
export const updatePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    // Check if post exists
    const existingPost = await ForumPostModel.findById(parseInt(postId, 10));
    if (!existingPost) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Check if user has permission to update
    if (existingPost.user_id !== userId && userRole !== "admin") {
      res.status(403).json({ error: "Not authorized to update this post" });
      return;
    }

    // Update post
    await ForumPostModel.update(parseInt(postId, 10), { content });

    // Get updated post
    const updatedPost = await ForumPostModel.findById(parseInt(postId, 10));

    res.json(updatedPost);
  } catch (error: any) {
    console.error("Update post error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Delete a thread
 */
export const deleteThread = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { threadId } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    // Check if thread exists
    const thread = await ForumThreadModel.findById(parseInt(threadId, 10));
    if (!thread) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

    // Check if user has permission to delete
    if (thread.user_id !== userId && userRole !== "admin") {
      res.status(403).json({ error: "Not authorized to delete this thread" });
      return;
    }

    // Delete thread (and associated posts due to CASCADE)
    const success = await ForumThreadModel.delete(parseInt(threadId, 10));

    if (!success) {
      res.status(500).json({ error: "Failed to delete thread" });
      return;
    }

    res.json({ message: "Thread deleted successfully" });
  } catch (error: any) {
    console.error("Delete thread error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Delete a post
 */
export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    // Check if post exists
    const post = await ForumPostModel.findById(parseInt(postId, 10));
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Check if user has permission to delete
    if (post.user_id !== userId && userRole !== "admin") {
      res.status(403).json({ error: "Not authorized to delete this post" });
      return;
    }

    // Delete post
    const success = await ForumPostModel.delete(parseInt(postId, 10));

    if (!success) {
      res.status(500).json({ error: "Failed to delete post" });
      return;
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Get recent threads
 */
export const getRecentThreads = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const threads = await ForumThreadModel.getRecentThreads(limit);

    res.json(threads);
  } catch (error: any) {
    console.error("Get recent threads error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Get forum statistics
 */
export const getForumStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Calculate stats from database
    // This would typically involve multiple queries

    // Placeholder implementation
    const stats = {
      thread_count: 0,
      post_count: 0,
      user_count: 0,
      newest_user: "",
    };

    // Get thread count
    const [threadCountResult] = await pool.query<any>(
      "SELECT COUNT(*) as count FROM forum_threads"
    );
    stats.thread_count = threadCountResult[0].count;

    // Get post count
    const [postCountResult] = await pool.query<any>(
      "SELECT COUNT(*) as count FROM forum_posts"
    );
    stats.post_count = postCountResult[0].count;

    // Get user count
    const [userCountResult] = await pool.query<any>(
      "SELECT COUNT(*) as count FROM users"
    );
    stats.user_count = userCountResult[0].count;

    // Get newest user
    const [newestUserResult] = await pool.query<any>(
      "SELECT full_name FROM users ORDER BY created_at DESC LIMIT 1"
    );
    stats.newest_user = newestUserResult[0]?.full_name || "No users yet";

    res.json(stats);
  } catch (error: any) {
    console.error("Get forum stats error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Admin: Create a new forum category
 */
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name) {
      res.status(400).json({ error: "Category name is required" });
      return;
    }

    // Create category
    const categoryId = await ForumCategoryModel.create({
      name,
      description: description || "",
    });

    // Fetch the newly created category
    const category = await ForumCategoryModel.findById(categoryId);

    res.status(201).json(category);
  } catch (error: any) {
    console.error("Create category error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create category" });
  }
};

/**
 * Admin: Update a forum category
 */
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    // Check if category exists
    const category = await ForumCategoryModel.findById(
      parseInt(categoryId, 10)
    );
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Update category
    await ForumCategoryModel.update(parseInt(categoryId, 10), {
      name,
      description,
    });

    // Get updated category
    const updatedCategory = await ForumCategoryModel.findById(
      parseInt(categoryId, 10)
    );

    res.json(updatedCategory);
  } catch (error: any) {
    console.error("Update category error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to update category" });
  }
};

/**
 * Admin: Delete a forum category
 */
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;

    // Check if category exists
    const category = await ForumCategoryModel.findById(
      parseInt(categoryId, 10)
    );
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Delete category
    const success = await ForumCategoryModel.delete(parseInt(categoryId, 10));

    if (!success) {
      res.status(500).json({ error: "Failed to delete category" });
      return;
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Delete category error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to delete category" });
  }
};

/**
 * Admin: Get reported content
 */
export const getReportedContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;

    // Get reported content
    const reports: ReportedContent[] = []; // Replace with actual implementation when you have a Report model

    res.json({ reports });
  } catch (error: any) {
    console.error("Get reported content error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to get reported content" });
  }
};
