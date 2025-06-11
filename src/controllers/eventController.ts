import { Request, Response } from "express";
import EventModel, {
  EventCreationData,
  EventUpdateData,
} from "../models/Event";
import { ApiError } from "../middleware/error.middleware";

/**
 * Get all events with filtering and pagination
 */
export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const search = req.query.search as string | undefined;

    let result;

    if (search) {
      result = await EventModel.search(search, { page, limit });
    } else {
      result = await EventModel.findAll({ page, limit });
    }

    res.json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to retrieve events" });
  }
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;

    const events = await EventModel.findUpcoming(limit);

    res.json({ events });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to retrieve upcoming events" });
  }
};

/**
 * Get an event by ID
 */
export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    const event = await EventModel.findById(id);

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json(event);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to retrieve event" });
  }
};

/**
 * Create a new event
 */
export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data: EventCreationData = {
      name: req.body.name,
      description: req.body.description,
      location: req.body.location,
      date: req.body.date,
      time: req.body.time,
      image_url: req.body.image_url,
    };

    // Validate required fields
    if (!data.name) {
      res.status(400).json({ error: "Event name is required" });
      return;
    }

    const id = await EventModel.create(data);
    const newEvent = await EventModel.findById(id);

    res.status(201).json(newEvent);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create event" });
  }
};

/**
 * Update an event
 */
export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    // Check if the event exists
    const event = await EventModel.findById(id);

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const data: EventUpdateData = {};

    // Only update provided fields
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.description !== undefined)
      data.description = req.body.description;
    if (req.body.location !== undefined) data.location = req.body.location;
    if (req.body.date !== undefined) data.date = req.body.date;
    if (req.body.time !== undefined) data.time = req.body.time;
    if (req.body.image_url !== undefined) data.image_url = req.body.image_url;

    // Make sure we have something to update
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No update data provided" });
      return;
    }

    await EventModel.update(id, data);
    const updatedEvent = await EventModel.findById(id);

    res.json(updatedEvent);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update event" });
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    // Check if the event exists
    const event = await EventModel.findById(id);

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    await EventModel.delete(id);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete event" });
  }
};

/**
 * Upload an event image
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
    const imageUrl = `${baseUrl}/uploads/events/${req.file.filename}`;

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
