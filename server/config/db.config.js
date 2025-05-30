/**
 * Database Configuration
 * 
 * This module provides configuration for MySQL database connection
 * using environment variables with fallback defaults.
 */

require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '75.102.58.135',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'oxiyveey',
  password: process.env.DB_PASSWORD || '6k9LjHgYsUi32',
  database: process.env.DB_NAME || 'oxiyveey_eat2speak',
  
  // Connection pool configuration
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000', 10),
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '30000', 10),
  waitForConnections: true,
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10),

  // Enable multiple statement support
  multipleStatements: false,
  
  // Security and validation
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
  
  // Disable debug to prevent protocol level logs
  debug: false,
  trace: false, // Disable trace logs
};

module.exports = dbConfig;