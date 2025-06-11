import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Define environment interface to ensure type safety
interface Env {
  NODE_ENV: string;
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string; // Added this missing env variable
  CORS_ORIGIN: string;
}

// Parse environment variables with defaults
const env: Env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  DB_HOST: process.env.DB_HOST || "aws-mysql.cnoiawuws42w.ap-southeast-1.rds.amazonaws.com",
  DB_PORT: parseInt(process.env.DB_PORT || "3306", 10),
  DB_USER: process.env.DB_USER || "adminrian001",
  DB_PASSWORD: process.env.DB_PASSWORD || "MySQLamazonadminrian001",
  DB_NAME: process.env.DB_NAME || "solok_selatan_db",
  JWT_SECRET: process.env.JWT_SECRET || "default-development-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d", // Added this missing env variable
  CORS_ORIGIN: process.env.CORS_ORIGIN || "https://bukittinggi.vercel.app",
};

export default env;
