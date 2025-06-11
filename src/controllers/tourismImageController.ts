import { Request, Response } from "express";
import TourismImageModel from "../models/TourismImage";
import TourismModel from "../models/TourismDestination";
import { pool } from "../config/db";
import path from "path";
import fs from "fs";

/**
 * Get all images for a tourism destination
 */
export const getTourismImages = async (req: Request, res: Response) => {
  try {
    const { tourismId } = req.params;

    if (!tourismId || isNaN(parseInt(tourismId, 10))) {
      return res.status(400).json({ error: "Invalid tourism ID" });
    }

    // Check if tourism exists
    const tourism = await TourismModel.findById(parseInt(tourismId, 10));
    if (!tourism) {
      return res.status(404).json({ error: "Tourism destination not found" });
    }

    const images = await TourismImageModel.findByTourismId(
      parseInt(tourismId, 10)
    );
    console.log(`Found ${images.length} images for tourism ID ${tourismId}`);

    res.json({ images });
  } catch (error) {
    console.error("Error fetching tourism images:", error);
    res.status(500).json({
      error: "Failed to fetch tourism images",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Upload images for a tourism destination
 * Handles multiple file uploads
 */
export const uploadTourismImages = async (req: Request, res: Response) => {
  try {
    const { tourismId } = req.params;

    if (!tourismId || isNaN(parseInt(tourismId, 10))) {
      return res.status(400).json({ error: "Invalid tourism ID" });
    }

    // Check if tourism exists
    const tourism = await TourismModel.findById(parseInt(tourismId, 10));
    if (!tourism) {
      return res.status(404).json({ error: "Tourism destination not found" });
    }

    // Get uploaded files
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No image files provided" });
    }

    console.log(
      `Processing ${files.length} uploaded files for tourism ID ${tourismId}`
    );

    // Get server base URL
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Process each file and store in database
    const uploadedImages = [];
    for (const file of files) {
      // Generate URL for the file
      const imageUrl = `${baseUrl}/uploads/tourism/${file.filename}`;

      console.log(`Created image URL: ${imageUrl}`);

      // Get existing images to determine if this should be the primary
      const existingImages = await TourismImageModel.findByTourismId(
        parseInt(tourismId, 10)
      );
      const isPrimary = existingImages.length === 0; // First image is primary

      // Create image record in database
      const imageId = await TourismImageModel.create({
        tourism_id: parseInt(tourismId, 10),
        image_url: imageUrl,
        is_primary: isPrimary,
        caption: "",
        display_order: existingImages.length,
      });

      console.log(`Created image record with ID: ${imageId}`);

      const image = await TourismImageModel.findById(imageId);
      if (image) {
        uploadedImages.push(image);
      }

      // If this is the primary image, sync it with the main tourism record
      if (isPrimary) {
        await TourismModel.syncPrimaryImage(parseInt(tourismId, 10));
      }
    }

    res.status(201).json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Error uploading tourism images:", error);
    res.status(500).json({
      error: "Failed to upload tourism images",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Set an image as the primary image for a tourism destination
 */
export const setAsPrimaryImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Invalid image ID" });
    }

    const success = await TourismImageModel.setPrimary(parseInt(id, 10));

    if (!success) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Get the updated image
    const image = await TourismImageModel.findById(parseInt(id, 10));
    if (!image) {
      return res.status(404).json({ error: "Image not found after update" });
    }

    // Sync the primary image with the tourism destination
    await TourismModel.syncPrimaryImage(image.tourism_id);

    // Get all images for this tourism
    const allImages = await TourismImageModel.findByTourismId(image.tourism_id);

    res.json({
      message: "Image set as primary successfully",
      image,
      allImages,
    });
  } catch (error) {
    console.error("Error setting primary image:", error);
    res.status(500).json({
      error: "Failed to set primary image",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Delete an image
 */
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Invalid image ID" });
    }

    // Find image first to get file path and tourism_id
    const image = await TourismImageModel.findById(parseInt(id, 10));

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Store tourism ID for later use
    const tourismId = image.tourism_id;
    const wasPrimary = image.is_primary;

    // Extract filename from URL
    try {
      if (image.image_url && image.image_url.includes("/uploads/tourism/")) {
        const filename = image.image_url.split("/uploads/tourism/")[1];
        if (filename) {
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "tourism",
            filename
          );

          // Delete file if it exists
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted image file: ${filePath}`);
          }
        }
      }
    } catch (fileError) {
      console.error("Error deleting image file:", fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const success = await TourismImageModel.delete(parseInt(id, 10));

    if (!success) {
      return res.status(500).json({ error: "Failed to delete image" });
    }

    // Get remaining images
    const remainingImages = await TourismImageModel.findByTourismId(tourismId);

    // If we deleted the primary image, make the first remaining image primary
    if (wasPrimary && remainingImages.length > 0) {
      await TourismImageModel.setPrimary(remainingImages[0].id);

      // Sync the new primary image with the tourism destination
      await TourismModel.syncPrimaryImage(tourismId);
    } else if (wasPrimary && remainingImages.length === 0) {
      // If there are no more images and we deleted the primary, clear the image_url
      await pool.query(
        "UPDATE tourism_destinations SET image_url = '' WHERE id = ?",
        [tourismId]
      );
    }

    // Get updated images list
    const updatedImages = await TourismImageModel.findByTourismId(tourismId);

    res.json({
      message: "Image deleted successfully",
      images: updatedImages,
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      error: "Failed to delete image",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Update image caption and other details
 */
export const updateImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { caption, isPrimary, displayOrder } = req.body;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Invalid image ID" });
    }

    const image = await TourismImageModel.findById(parseInt(id, 10));

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Prepare update data
    const updateData: any = {};
    if (caption !== undefined) updateData.caption = caption;
    if (isPrimary !== undefined) updateData.is_primary = isPrimary;
    if (displayOrder !== undefined) updateData.display_order = displayOrder;

    const success = await TourismImageModel.update(
      parseInt(id, 10),
      updateData
    );

    if (!success) {
      return res.status(500).json({ error: "Failed to update image" });
    }

    const updatedImage = await TourismImageModel.findById(parseInt(id, 10));

    res.json({
      message: "Image updated successfully",
      image: updatedImage,
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({
      error: "Failed to update image",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
