import { Request, Response } from "express";
import TourismModel from "../models/TourismDestination";
import TourismImageModel from "../models/TourismImage";
import { pool } from "../config/db";
import { RowDataPacket } from "mysql2/promise";
import path from "path";
import fs from "fs";

/**
 * Get all tourism destinations with filtering and pagination
 */
export const getAllTourism = async (req: Request, res: Response) => {
  try {
    console.log("getAllTourism called with query:", req.query);
    const { category, search, page, limit } = req.query;

    const filters = {
      category: category as string | undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    };

    const result = await TourismModel.findAll(filters);
    console.log(
      `Found ${result.destinations.length} destinations out of ${result.totalCount} total`
    );
    res.json(result);
  } catch (error) {
    console.error("Error fetching tourism destinations:", error);
    res.status(500).json({
      error: "Failed to fetch tourism destinations",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get tourism destination by ID
 */
export const getTourismById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`getTourismById called with ID: ${id}`);

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Invalid destination ID" });
    }

    const destination = await TourismModel.findById(parseInt(id, 10));

    if (!destination) {
      console.log(`No destination found with ID ${id}`);
      return res.status(404).json({ error: "Tourism destination not found" });
    }

    console.log(`Found destination: ${destination.name}`);
    res.json(destination);
  } catch (error) {
    console.error(
      `Error fetching tourism destination with ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      error: "Failed to fetch tourism destination",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Create new tourism destination
 */
export const createTourism = async (req: Request, res: Response) => {
  try {
    console.log("createTourism called with body:", req.body);
    const { name, description, location, category, image_url, featured } =
      req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const tourismData = {
      name,
      description: description || "",
      location: location || "",
      category: category || "",
      image_url: image_url || "",
      featured: featured === true,
    };

    console.log("Creating tourism destination with data:", tourismData);

    // Create the destination in the database
    const newId = await TourismModel.create(tourismData);
    console.log(`Created new destination with ID: ${newId}`);

    // If there's an image_url provided, also create an entry in tourism_images table
    if (image_url) {
      try {
        await TourismImageModel.create({
          tourism_id: newId,
          image_url: image_url,
          is_primary: true,
          caption: "",
          display_order: 0,
        });
      } catch (imgError) {
        console.error("Error creating associated image record:", imgError);
        // Continue anyway, the main destination was created
      }
    }

    // Fetch the created destination to return
    const newDestination = await TourismModel.findByIdWithImages(newId);

    if (!newDestination) {
      return res
        .status(500)
        .json({ error: "Destination created but could not be retrieved" });
    }

    res.status(201).json(newDestination);
  } catch (error) {
    console.error("Error creating tourism destination:", error);
    res.status(500).json({
      error: "Failed to create tourism destination",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Update tourism destination
 */
export const updateTourism = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`updateTourism called for ID: ${id} with body:`, req.body);

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Invalid destination ID" });
    }

    const { name, description, location, category, image_url, featured } =
      req.body;

    // Check if the destination exists
    const existingDestination = await TourismModel.findById(parseInt(id, 10));
    if (!existingDestination) {
      console.log(`No destination found with ID ${id} for update`);
      return res.status(404).json({ error: "Tourism destination not found" });
    }

    // Prepare update data, only including fields that are provided
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (category !== undefined) updateData.category = category;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (featured !== undefined) updateData.featured = featured;

    console.log(`Updating destination ${id} with data:`, updateData);

    // Update the destination
    const updatedDestination = await TourismModel.update(
      parseInt(id, 10),
      updateData
    );

    // If image_url is being updated, also update the primary image in tourism_images
    if (image_url !== undefined) {
      try {
        // Check if there's any existing primary image
        const [existingImages] = await pool.query<RowDataPacket[]>(
          "SELECT * FROM tourism_images WHERE tourism_id = ? AND is_primary = TRUE",
          [parseInt(id, 10)]
        );

        if (existingImages.length > 0) {
          // Update the existing primary image
          await pool.query(
            "UPDATE tourism_images SET image_url = ? WHERE id = ?",
            [image_url, existingImages[0].id]
          );
        } else {
          // Create a new primary image
          await TourismImageModel.create({
            tourism_id: parseInt(id, 10),
            image_url: image_url,
            is_primary: true,
            caption: "",
            display_order: 0,
          });
        }
      } catch (imgError) {
        console.error("Error updating associated image record:", imgError);
        // Continue anyway, the main destination will be updated
      }
    }

    if (!updatedDestination) {
      return res.status(500).json({ error: "Failed to update destination" });
    }

    console.log(`Successfully updated destination ${id}`);
    res.json(updatedDestination);
  } catch (error) {
    console.error(
      `Error updating tourism destination with ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      error: "Failed to update tourism destination",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Delete tourism destination
 */
export const deleteTourism = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[Debug] deleteTourism called for ID: ${id}`);
    console.log(`[Debug] User in request:`, (req as any).user);

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Invalid destination ID" });
    }

    const destId = parseInt(id, 10);

    // Check if the destination exists
    const destination = await TourismModel.findById(destId);
    if (!destination) {
      console.log(`[Debug] No destination found with ID ${id} for deletion`);
      return res.status(404).json({ error: "Tourism destination not found" });
    }

    // Try to delete the associated image if it exists
    if (destination.image_url && destination.image_url.includes("/uploads/")) {
      try {
        const imagePath = destination.image_url.split("/uploads/")[1];
        if (imagePath) {
          const fullPath = path.join(process.cwd(), "uploads", imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`[Debug] Deleted image file: ${fullPath}`);
          }
        }
      } catch (imageError) {
        console.error(`[Debug] Error deleting image file:`, imageError);
        // Continue with deletion even if image deletion fails
      }
    }

    // Delete the destination from the database
    const success = await TourismModel.delete(destId);

    if (!success) {
      return res
        .status(500)
        .json({ error: "Failed to delete destination from database" });
    }

    console.log(`[Debug] Successfully deleted destination ${id}`);
    res
      .status(200)
      .json({ message: "Tourism destination deleted successfully" });
  } catch (error) {
    console.error(
      `[Debug] Error in deleteTourism for ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      error: "Failed to delete tourism destination",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get featured tourism destinations
 */
export const getFeaturedTourism = async (req: Request, res: Response) => {
  try {
    console.log("getFeaturedTourism called with query:", req.query);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

    const destinations = await TourismModel.findFeatured(limit);
    console.log(`Found ${destinations.length} featured destinations`);

    res.json({ destinations });
  } catch (error) {
    console.error("Error fetching featured tourism destinations:", error);
    res.status(500).json({
      error: "Failed to fetch featured tourism destinations",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Upload tourism destination image
 */
export const uploadTourismImage = async (req: Request, res: Response) => {
  try {
    console.log("uploadTourismImage called with file:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Get server base URL
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Generate URL for the file
    const imageUrl = `${baseUrl}/uploads/tourism/${req.file.filename}`;

    console.log("Image uploaded successfully:", imageUrl);

    res.status(201).json({ imageUrl });
  } catch (error) {
    console.error("Error uploading tourism image:", error);
    res.status(500).json({
      error: "Failed to upload tourism image",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get tourism destination by ID with images
 */
export const getTourismWithImages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`getTourismWithImages called with ID: ${id}`);

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Invalid destination ID" });
    }

    const destination = await TourismModel.findByIdWithImages(parseInt(id, 10));

    if (!destination) {
      console.log(`No destination found with ID ${id}`);
      return res.status(404).json({ error: "Tourism destination not found" });
    }

    console.log(
      `Found destination: ${destination.name} with ${
        destination.images?.length || 0
      } images`
    );
    res.json(destination);
  } catch (error) {
    console.error(
      `Error fetching tourism destination with ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      error: "Failed to fetch tourism destination",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
