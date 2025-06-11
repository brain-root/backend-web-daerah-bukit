import { Request, Response } from "express";
import BusinessModel, {
  BusinessCreationData,
  BusinessUpdateData,
} from "../models/Business";
import { ApiError } from "../middleware/error.middleware";

/**
 * Get all businesses with filtering and pagination
 */
export const getAllBusinesses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    let result;

    if (search) {
      result = await BusinessModel.search(search, { page, limit });
    } else {
      result = await BusinessModel.findAll({ page, limit, category });
    }

    res.json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to retrieve businesses" });
  }
};

/**
 * Get a business by ID
 */
export const getBusinessById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid business ID" });
      return;
    }

    const business = await BusinessModel.findById(id);

    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    res.json(business);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to retrieve business" });
  }
};

/**
 * Create a new business
 */
export const createBusiness = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data: BusinessCreationData = {
      name: req.body.name,
      description: req.body.description,
      location: req.body.location,
      category: req.body.category,
      contact: req.body.contact,
      image_url: req.body.image_url,
    };

    // Validate required fields
    if (!data.name) {
      res.status(400).json({ error: "Business name is required" });
      return;
    }

    const id = await BusinessModel.create(data);
    const newBusiness = await BusinessModel.findById(id);

    res.status(201).json(newBusiness);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to create business" });
  }
};

/**
 * Update a business
 */
export const updateBusiness = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid business ID" });
      return;
    }

    // Check if the business exists
    const business = await BusinessModel.findById(id);

    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    const data: BusinessUpdateData = {};

    // Only update provided fields
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.description !== undefined)
      data.description = req.body.description;
    if (req.body.location !== undefined) data.location = req.body.location;
    if (req.body.category !== undefined) data.category = req.body.category;
    if (req.body.contact !== undefined) data.contact = req.body.contact;
    if (req.body.image_url !== undefined) data.image_url = req.body.image_url;

    // Make sure we have something to update
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No update data provided" });
      return;
    }

    await BusinessModel.update(id, data);
    const updatedBusiness = await BusinessModel.findById(id);

    res.json(updatedBusiness);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to update business" });
  }
};

/**
 * Delete a business
 */
export const deleteBusiness = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid business ID" });
      return;
    }

    // Check if the business exists
    const business = await BusinessModel.findById(id);

    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    await BusinessModel.delete(id);

    res.status(200).json({ message: "Business deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to delete business" });
  }
};

/**
 * Upload a business image
 */
export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      throw new ApiError("No file uploaded", 400);
    }

    // Generate the URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/business/${req.file.filename}`;

    res.status(200).json({
      message: "File uploaded successfully",
      imageUrl,
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: error.message || "Failed to upload image" });
    }
  }
};

/**
 * Get featured businesses
 */
export const getFeaturedBusinesses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
    const businesses = await BusinessModel.findFeatured(limit);

    res.json({ businesses });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to retrieve featured businesses",
    });
  }
};
