/**
 * User Model
 * 
 * Demonstrates proper separation of concerns between database layer and application logic.
 * Provides methods for user-related database operations using the database connection module.
 */

const db = require('../db/db');
const logger = require('../utils/logger');

class User {
  /**
   * Find a user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = ?';
      const results = await db.executeQuery(query, [id]);
      
      return results.length ? results[0] : null;
    } catch (error) {
      logger.error(`Error finding user by ID ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = ?';
      const results = await db.executeQuery(query, [email]);
      
      return results.length ? results[0] : null;
    } catch (error) {
      logger.error(`Error finding user by email ${email}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user with ID
   */
  static async create(userData) {
    try {
      // Start a transaction for data consistency
      return await db.executeTransaction(async (connection) => {
        const insertQuery = `
          INSERT INTO users (
            firstName, lastName, email, password, 
            phoneNumber, address, userType, 
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const params = [
          userData.firstName,
          userData.lastName,
          userData.email,
          userData.password, // Note: In a real app, this should be hashed
          userData.phoneNumber,
          userData.address,
          userData.userType,
        ];
        
        const [result] = await connection.execute(insertQuery, params);
        const userId = result.insertId;
        
        // Fetch the newly created user
        const [users] = await connection.execute(
          'SELECT * FROM users WHERE id = ?',
          [userId]
        );
        
        return users[0];
      });
    } catch (error) {
      logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update a user
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  static async update(id, userData) {
    try {
      // Build the dynamic update query based on provided fields
      const updateFields = [];
      const params = [];
      
      // Only update fields that are provided
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          params.push(userData[key]);
        }
      });
      
      // Add updatedAt timestamp and id parameter
      updateFields.push('updatedAt = NOW()');
      params.push(id);
      
      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `;
      
      await db.executeQuery(updateQuery, params);
      
      // Return the updated user
      return this.findById(id);
    } catch (error) {
      logger.error(`Error updating user ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM users WHERE id = ?';
      const result = await db.executeQuery(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error deleting user ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * List users with pagination
   * @param {Object} options - Pagination options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of records per page
   * @returns {Promise<Object>} Paginated results with metadata
   */
  static async list({ page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count for pagination metadata
      const countQuery = 'SELECT COUNT(*) as total FROM users';
      const countResult = await db.executeQuery(countQuery);
      const total = countResult[0].total;
      
      // Get paginated users
      const query = 'SELECT * FROM users LIMIT ? OFFSET ?';
      const users = await db.executeQuery(query, [limit, offset]);
      
      return {
        data: users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error listing users: ${error.message}`);
      throw error;
    }
  }
}

module.exports = User;