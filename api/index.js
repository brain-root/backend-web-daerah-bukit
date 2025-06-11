// This file serves as the entry point for Vercel serverless deployment
const app = require("../dist/server").default;

// Export the Express app as a serverless function
module.exports = app;
