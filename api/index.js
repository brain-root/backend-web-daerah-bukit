// This file serves as the entry point for Vercel serverless deployment
const path = require('path');

// Let Vercel know we're in a serverless environment
process.env.VERCEL = '1';

// Import the Express app - handle both CommonJS and ES modules
let app;
try {
  console.log("Loading server application...");
  
  // First try to import as a CommonJS module
  app = require('../dist/server');
  
  // If it's a default export from TypeScript
  if (app.default && typeof app.default === 'function') {
    console.log("Found default export, using it");
    app = app.default;
  }
  
  console.log("Server application loaded successfully");
} catch (error) {
  console.error('Error importing server:', error);
  // Return a simple function that provides detailed error information
  module.exports = (req, res) => {
    res.status(500).send(`
      <html>
        <head><title>Server Error</title></head>
        <body>
          <h1>Server Initialization Failed</h1>
          <p>Error: ${error.message}</p>
          <pre>${error.stack}</pre>
        </body>
      </html>
    `);
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
