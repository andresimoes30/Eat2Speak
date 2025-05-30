/**
 * Database Connection Module
 * 
 * Provides a robust MySQL connection pool with features including:
 * - Connection pooling for improved performance
 * - Error handling and automatic reconnection
 * - Retry logic for failed connections
 * - Connection validation
 * - Query logging capabilities
 * - Graceful shutdown procedures
 */

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');
const logger = require('../utils/logger');

// Maximum number of reconnection attempts
const MAX_RETRIES = 5;
// Initial backoff time in milliseconds (will be multiplied by retryCount)
const RETRY_BASE_DELAY = 1000;

let pool = null;

/**
 * Initialize the database connection pool
 * @returns {Promise<mysql.Pool>} The connection pool instance
 */
const initPool = async () => {
  try {
    if (pool) {
      logger.info('Database pool already initialized');
      return pool;
    }

    logger.info('Initializing database connection pool');
    pool = mysql.createPool(dbConfig);

    // Get a connection to verify pool is working, but don't run any queries
    const connection = await pool.getConnection();
    logger.info('Database connection established successfully');
    
    // Release the connection without running any validation queries
    connection.release();
    
    // Set up pool event listeners
    pool.on('connection', (connection) => {
      logger.info('New connection established to database');
      connection.on('error', (err) => {
        logger.error(`Database connection error: ${err.message}`);
      });
    });

    pool.on('enqueue', () => {
      logger.debug('Database query added to the connection queue');
    });

    pool.on('acquire', (connection) => {
      logger.debug('Database connection acquired from pool');
    });

    pool.on('release', (connection) => {
      logger.debug('Database connection released back to pool');
    });

    return pool;
  } catch (error) {
    logger.error(`Failed to initialize database pool: ${error.message}`);
    throw error;
  }
};

/**
 * Execute a database query with retry logic
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Parameters for the query
 * @param {Object} options - Additional options (retryCount, etc.)
 * @returns {Promise<Array>} Query results
 */
const executeQuery = async (sql, params = [], options = {}) => {
  const retryCount = options.retryCount || 0;
  
  try {
    if (!pool) {
      await initPool();
    }
    
    // Log the query (but not in production to avoid exposing sensitive data)
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`Executing query: ${sql} with params: ${JSON.stringify(params)}`);
    }
    
    const startTime = Date.now();
    const [results] = await pool.execute(sql, params);
    const executionTime = Date.now() - startTime;
    
    // Log execution time for performance monitoring
    logger.debug(`Query executed in ${executionTime}ms`);
    
    return results;
  } catch (error) {
    logger.error(`Database query error: ${error.message}`);
    
    // Determine if error is related to connection
    const isConnectionError = error.code === 'ECONNREFUSED' || 
                             error.code === 'PROTOCOL_CONNECTION_LOST' || 
                             error.code === 'ER_ACCESS_DENIED_ERROR' ||
                             error.code === 'ETIMEDOUT';
    
    // Implement retry logic for connection-related errors
    if (isConnectionError && retryCount < MAX_RETRIES) {
      const nextRetryCount = retryCount + 1;
      const delay = RETRY_BASE_DELAY * nextRetryCount;
      
      logger.info(`Retrying database connection (attempt ${nextRetryCount}/${MAX_RETRIES}) after ${delay}ms`);
      
      // Reset pool if needed
      if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        pool = null;
      }
      
      // Wait for delay and retry
      await new Promise(resolve => setTimeout(resolve, delay));
      return executeQuery(sql, params, { ...options, retryCount: nextRetryCount });
    }
    
    // If max retries exceeded or not a connection error, rethrow
    throw error;
  }
};

/**
 * Execute a transaction with multiple queries
 * @param {Function} callback - Transaction callback function that receives a connection
 * @returns {Promise<any>} Transaction result
 */
const executeTransaction = async (callback) => {
  let connection;
  
  try {
    if (!pool) {
      await initPool();
    }
    
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    logger.debug('Transaction started');
    
    const result = await callback(connection);
    
    await connection.commit();
    logger.debug('Transaction committed successfully');
    
    return result;
  } catch (error) {
    logger.error(`Transaction error: ${error.message}`);
    
    if (connection) {
      try {
        await connection.rollback();
        logger.debug('Transaction rolled back due to error');
      } catch (rollbackError) {
        logger.error(`Failed to rollback transaction: ${rollbackError.message}`);
      }
    }
    
    throw error;
  } finally {
    if (connection) {
      connection.release();
      logger.debug('Transaction connection released');
    }
  }
};

/**
 * Validate database connection by executing a simple query
 * @returns {Promise<boolean>} True if connection is valid
 */
const validateConnection = async () => {
  try {
    if (!pool) {
      await initPool();
    }
    
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    
    logger.debug('Database connection validated successfully');
    return true;
  } catch (error) {
    logger.error(`Database connection validation failed: ${error.message}`);
    return false;
  }
};

/**
 * Gracefully close the connection pool
 * @returns {Promise<void>}
 */
const closePool = async () => {
  if (pool) {
    logger.info('Closing database connection pool');
    
    try {
      await pool.end();
      pool = null;
      logger.info('Database connection pool closed successfully');
    } catch (error) {
      logger.error(`Error closing database pool: ${error.message}`);
      throw error;
    }
  }
};

// Process termination handlers for graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT signal received. Shutting down database connections');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received. Shutting down database connections');
  await closePool();
  process.exit(0);
});

module.exports = {
  initPool,
  executeQuery,
  executeTransaction,
  validateConnection,
  closePool,
  getPool: () => pool
};