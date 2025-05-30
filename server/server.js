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
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers with cross-origin policy

// Basic CORS configuration - simpler approach to avoid path-to-regexp issues
app.use(cors());

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

// Import API routes but handle potential route errors
let apiRoutes;
try {
  apiRoutes = require('./routes/index');
  
  // Register API routes
  app.use('/api', apiRoutes);
} catch (error) {
  logger.error(`Failed to load API routes: ${error.message}`);
  
  // Fallback route handler
  app.use('/api', (req, res) => {
    res.status(500).json({
      message: 'API routes failed to load properly',
      error: error.message
    });
  });
}

// Add basic route for testing server functionality
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong', time: new Date().toISOString() });
});

// Add direct test routes for debugging
app.post('/test-register', express.json(), (req, res) => {
  logger.info('Test registration endpoint called');
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  
  // Return success for testing
  res.status(200).json({
    message: 'Test registration received successfully',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

// Direct root endpoint test
app.get('/hello', (req, res) => {
  logger.info('Hello endpoint called');
  res.status(200).json({ 
    message: 'Hello from Eat2Speak server!',
    time: new Date().toISOString()
  });
});

// Direct auth test endpoint
app.get('/auth-test', (req, res) => {
  logger.info('Auth test endpoint called');
  res.status(200).json({ 
    message: 'Auth test endpoint working!',
    time: new Date().toISOString()
  });
});

// Add a direct route to expose auth routes information
app.get('/routes-info', (req, res) => {
  logger.info('Routes info endpoint called');
  try {
    const authRoutes = require('./routes/auth');
    const stack = authRoutes.stack || [];
    const routes = stack.map(r => ({
      path: r.route?.path,
      methods: r.route?.methods,
      middlewares: r.route?.stack.length
    })).filter(r => r.path);
    
    res.status(200).json({
      message: 'Routes information',
      apiRoutes: 'Mounted at /api',
      authRoutes: routes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error getting routes info',
      error: error.message
    });
  }
});

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