// This file serves as the entry point for Vercel serverless deployment
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the Express app
const app = require("../dist/server").default;

// Export the Express app as a serverless function
module.exports = app;

// For local testing
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
