/**
 * Express.js Server
 * 
 * Main entry point for the Eat2Speak backend API server.
 * Sets up Express with middleware, connects to the database,
 * configures routes, and handles errors.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db/db');
const logger = require('./utils/logger');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

// Initialize database connection
(async () => {
  try {
    await db.initPool();
    logger.info('Database connection pool initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize database connection: ${error.message}`);
    // Continue server startup even if DB fails - it will retry connections later
  }
})();

// Health check endpoint - without executing database queries
app.get('/health', (req, res) => {
  try {
    // Check if database pool is initialized without running any queries
    const dbPool = db.getPool();
    const dbConnected = dbPool !== null;
    
    return res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'pool_initialized' : 'pool_not_initialized',
      uptime: process.uptime()
    });
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Import API routes
const apiRoutes = require('./routes/index');

// Register API routes
app.use('/api', apiRoutes);

// Database test endpoint (outside of API routes for direct testing)
app.get('/test-db', async (req, res) => {
  try {
    const results = await db.executeQuery('SELECT 1 as test');
    res.status(200).json({
      message: 'Database connection successful',
      data: results
    });
  } catch (error) {
    logger.error(`Database test failed: ${error.message}`);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  logger.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Close database connections
  try {
    await db.closePool();
    logger.info('Database connections closed');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during graceful shutdown: ${error.message}`);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server; // Export for testing