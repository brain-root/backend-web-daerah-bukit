// This file serves as the entry point for Vercel serverless deployment
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the Express app - handle both CommonJS and ES modules
let app;
try {
  // First try to import as a CommonJS module
  app = require('../dist/server');
  // If it's a default export from TypeScript
  if (app.default && typeof app.default === 'function') {
    app = app.default;
  }
} catch (error) {
  console.error('Error importing server:', error);
  // Return a simple function for error cases
  module.exports = (req, res) => {
    res.status(500).send('Server initialization failed: ' + error.message);
  };
  return;
}

// Export the Express app as a serverless function
module.exports = app;

// For local testing
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
