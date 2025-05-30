/**
 * Database Connection Test Utility
 * 
 * This script tests the connection to the existing MySQL database
 * without creating any new tables or modifying the database structure.
 */

require('dotenv').config();
const db = require('./db');
const logger = require('../utils/logger');

async function testConnection() {
  try {
    // Initialize the connection pool
    await db.initPool();
    logger.info('Database connection pool initialized successfully');
    
    // Test the connection with a simple query
    const result = await db.executeQuery('SELECT 1 as connection_test');
    logger.info('Database connection test query executed successfully');
    logger.info(`Query result: ${JSON.stringify(result)}`);
    
    // Get database information
    const [dbInfo] = await db.executeQuery('SELECT DATABASE() as db_name, VERSION() as db_version');
    logger.info(`Connected to database: ${dbInfo.db_name}`);
    logger.info(`Database version: ${dbInfo.db_version}`);
    
    // Show database tables (without creating any)
    const tables = await db.executeQuery('SHOW TABLES');
    logger.info(`Database contains ${tables.length} tables:`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      logger.info(`  ${index + 1}. ${tableName}`);
    });
    
    logger.info('Database connection test completed successfully');
  } catch (error) {
    logger.error(`Database connection test failed: ${error.message}`);
    logger.error(error.stack);
  } finally {
    // Close the connection pool
    await db.closePool();
    logger.info('Database connection pool closed');
  }
}

// Execute the test if this script is run directly
if (require.main === module) {
  testConnection().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = testConnection;