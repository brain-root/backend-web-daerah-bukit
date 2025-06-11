import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Ensure upload directories exist on server start - but only in non-serverless environments
const createUploadDirectories = () => {
  // Skip directory creation in serverless environments
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    console.log("Running in serverless environment, skipping directory creation");
    return;
  }

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
    // Don't throw error, just log it - this allows the app to continue
  }
};

// Initialize directories immediately
createUploadDirectories();

// Create a memory storage for serverless environments
const memoryStorage = multer.memoryStorage();

// Use appropriate storage based on environment
const getStorage = (directory: string) => {
  // In serverless environment, use memory storage
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return memoryStorage;
  }

  // In regular environment, use disk storage
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(process.cwd(), "uploads", directory);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const fileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, "-")}`;
      console.log(`Generated filename for upload: ${fileName}`);
      cb(null, fileName);
    },
  });
};

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
  storage: getStorage("general"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const tourismUpload = multer({
  storage: getStorage("tourism"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const businessUpload = multer({
  storage: getStorage("business"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const eventUpload = multer({
  storage: getStorage("events"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const profileUpload = multer({
  storage: getStorage("profiles"),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
