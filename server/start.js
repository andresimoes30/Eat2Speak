/**
 * Server Start Script
 * 
 * Enhanced server startup with improved error handling
 * and prevention of server shutdown on unhandled errors.
 */

const server = require('./server');
const logger = require('./utils/logger');
const db = require('./db/db');

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise);
  logger.error('Reason:', reason);
  // Don't exit - just log the error and continue
  // This keeps the server running even if there's an unhandled error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:');
  logger.error(error.stack || error);
  // Don't exit - just log the error and continue
  // This keeps the server running even if there's an uncaught error
});

// Periodically check database connection
const checkDatabaseConnection = async () => {
  try {
    // Check if database is connected
    if (!db.getPool()) {
      logger.warn('Database connection not established. Attempting to initialize pool...');
      await db.initPool();
      logger.info('Database connection re-established successfully');
    } else {
      // Test the connection with a simple query
      await db.executeQuery('SELECT 1 as connection_test');
      logger.debug('Database connection verified');
    }
  } catch (error) {
    logger.error(`Database connection check failed: ${error.message}`);
    // Don't exit - just log the error and try again later
  }
};

// Check database connection every 5 minutes
setInterval(checkDatabaseConnection, 5 * 60 * 1000);

// Initial database connection check
checkDatabaseConnection();

// Log startup information
logger.info('Server startup script executed');
logger.info('Press Ctrl+C to stop the server');