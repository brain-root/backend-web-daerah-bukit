import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Ensure all upload directories exist on server start
const createUploadDirectories = () => {
  try {
    console.log("Initializing upload directories...");
    const baseDir = path.join(process.cwd(), "uploads");

    // Create base upload directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
      console.log("Created base uploads directory:", baseDir);
    }

    // Create subdirectories for each resource type
    const subdirs = ["tourism", "business", "events", "profiles", "general"];

    subdirs.forEach((dir) => {
      const fullPath = path.join(baseDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${fullPath}`);
      }
    });

    console.log("Upload directories initialized successfully");
  } catch (error) {
    console.error("Error creating upload directories:", error);
    throw error;
  }
};

// Initialize directories immediately
createUploadDirectories();

// Tourism storage configuration
const tourismStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "tourism");
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const fileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, "-")}`;
    console.log(`Generated filename for upload: ${fileName}`);
    cb(null, fileName);
  },
});

// Business storage configuration
const businessStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "business");
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const fileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, fileName);
  },
});

// Events storage configuration
const eventStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "events");
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const fileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, fileName);
  },
});

// Profile storage configuration
const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "profiles");
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const fileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, fileName);
  },
});

// File filter for image uploads
const imageFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    console.log(`Rejecting file ${file.originalname} - not an image`);
    return cb(null, false);
  }
  console.log(`Accepting file ${file.originalname}`);
  cb(null, true);
};

// Create and export multer instances
export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(process.cwd(), "uploads", "general");
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const fileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, "-")}`;
      cb(null, fileName);
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const tourismUpload = multer({
  storage: tourismStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const businessUpload = multer({
  storage: businessStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const eventUpload = multer({
  storage: eventStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const profileUpload = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
