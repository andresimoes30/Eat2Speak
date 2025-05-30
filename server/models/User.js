/**
 * User Model
 * 
 * Demonstrates proper separation of concerns between database layer and application logic.
 * Provides methods for user-related database operations using the database connection module.
 * Enhanced with secure password hashing and user role management.
 */

const db = require('../db/db');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

// Number of salt rounds for bcrypt password hashing
const SALT_ROUNDS = 10;

// Role IDs based on user types
const ROLE_IDS = {
  student: 1,
  native: 2, 
  restaurant: 3
};

class User {
  /**
   * Find a user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findById(id) {
    try {
      const query = 'SELECT * FROM Users WHERE userId = ?';
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
      const query = 'SELECT * FROM Users WHERE email = ?';
      const results = await db.executeQuery(query, [email]);
      
      return results.length ? results[0] : null;
    } catch (error) {
      logger.error(`Error finding user by email ${email}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    try {
      return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
      logger.error(`Error hashing password: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Verify if a password matches the hashed version
   * @param {string} password - Plain text password to check
   * @param {string} hashedPassword - Stored hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error(`Error verifying password: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Register a new user with appropriate role assignment
   * @param {Object} userData - User data including userType
   * @returns {Promise<Object>} Created user with ID (password removed from result)
   */
  static async register(userData) {
    try {
      // Start a transaction for data consistency
      return await db.executeTransaction(async (connection) => {
        // 1. Hash the password
        const hashedPassword = await this.hashPassword(userData.password);
        
        // 2. Insert the user
        const insertUserQuery = `
          INSERT INTO Users (
            firstName, lastName, email, passwordHash, 
            phoneNumber, address, nationality, gender,
            createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const userParams = [
          userData.firstName,
          userData.lastName,
          userData.email,
          hashedPassword, // Store hashed password
          userData.phoneNumber,
          userData.address,
          userData.nationality || null,
          userData.gender || null
        ];
        
        const [userResult] = await connection.execute(insertUserQuery, userParams);
        const userId = userResult.insertId;
        
        // 3. Determine role ID based on user type
        const userType = userData.userTypes.toLowerCase(); // Changed from userType to userTypes as per frontend
        const roleId = ROLE_IDS[userType];
        
        if (!roleId) {
          throw new Error(`Invalid user type: ${userType}`);
        }
        
        // 4. Assign the role
        const insertRoleQuery = `
          INSERT INTO UserRole (userId, roleId) 
          VALUES (?, ?)
        `;
        
        await connection.execute(insertRoleQuery, [userId, roleId]);
        
        // 5. If user is a restaurant, store additional data
        if (userType === 'restaurant' && userData.restaurantName) {
          const insertRestaurantQuery = `
            INSERT INTO RestaurantProfile (
              userId, restaurantName, cuisineType
            ) VALUES (?, ?, ?)
          `;
          
          await connection.execute(insertRestaurantQuery, [
            userId, 
            userData.restaurantName,
            userData.cuisineType || 'Not specified'
          ]);
        }
        
        // 6. If user is a native speaker, store language information
        if (userType === 'native' && userData.languageName) {
          const insertLanguageQuery = `
            INSERT INTO NativeLanguage (
              userId, languageName
            ) VALUES (?, ?)
          `;
          
          await connection.execute(insertLanguageQuery, [
            userId,
            userData.languageName
          ]);
        }
        
        // 7. Fetch the newly created user (without the password)
        const [Users] = await connection.execute(
          'SELECT userId, firstName, lastName, email, phoneNumber, address, nationality, gender, createdAt FROM Users WHERE userId = ?',
          [userId]
        );
        
        return {
          ...Users[0],
          userType: userType,
          message: 'Registration successful'
        };
      });
    } catch (error) {
      logger.error(`Error registering user: ${error.message}`);
      
      // Handle specific database errors
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          throw new Error('Email address is already registered');
        }
        throw new Error('Duplicate entry found');
      }
      
      throw error;
    }
  }
  
  /**
   * Create a new user (basic version, use register for complete flow)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user with ID
   */
  static async create(userData) {
    try {
      // Start a transaction for data consistency
      return await db.executeTransaction(async (connection) => {
        // Hash password if provided
        let passwordToStore = userData.password;
        if (passwordToStore) {
          passwordToStore = await this.hashPassword(passwordToStore);
        }
        
        const insertQuery = `
          INSERT INTO Users (
            firstName, lastName, email, passwordHash, 
            phoneNumber, address, nationality, gender,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const params = [
          userData.firstName,
          userData.lastName,
          userData.email,
          passwordToStore,
          userData.phoneNumber,
          userData.address,
          userData.nationality || null,
          userData.gender || null
        ];
        
        const [result] = await connection.execute(insertQuery, params);
        const userId = result.insertId;
        
        // Fetch the newly created user
        const [Users] = await connection.execute(
          'SELECT * FROM Users WHERE userId = ?',
          [userId]
        );
        
        const user = Users[0];
        // Remove sensitive data
        delete user.passwordHash;
        
        return user;
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
      
      // Check if password needs to be updated
      if (userData.password) {
        const hashedPassword = await this.hashPassword(userData.password);
        updateFields.push('passwordHash = ?');
        params.push(hashedPassword);
        delete userData.password;
      }
      
      // Add other fields
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && key !== 'password' && key !== 'id') {
          updateFields.push(`${key} = ?`);
          params.push(userData[key]);
        }
      });
      
      // Add updatedAt timestamp and id parameter
      updateFields.push('updatedAt = NOW()');
      params.push(id);
      
      const updateQuery = `
        UPDATE Users 
        SET ${updateFields.join(', ')} 
        WHERE userId = ?
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
      return await db.executeTransaction(async (connection) => {
        // First delete from UserRole to maintain referential integrity
        await connection.execute('DELETE FROM UserRole WHERE userId = ?', [id]);
        
        // Then delete any restaurant profile if exists
        await connection.execute('DELETE FROM RestaurantProfile WHERE userId = ?', [id]);
        
        // Then delete any native language entries if exists
        await connection.execute('DELETE FROM NativeLanguage WHERE userId = ?', [id]);
        
        // Finally delete the user
        const [result] = await connection.execute('DELETE FROM Users WHERE userId = ?', [id]);
        
        return result.affectedRows > 0;
      });
    } catch (error) {
      logger.error(`Error deleting user ${id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * List Users with pagination
   * @param {Object} options - Pagination options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of records per page
   * @returns {Promise<Object>} Paginated results with metadata
   */
  static async list({ page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count for pagination metadata
      const countQuery = 'SELECT COUNT(*) as total FROM Users';
      const countResult = await db.executeQuery(countQuery);
      const total = countResult[0].total;
      
      // Get paginated Users (exclude password)
      const query = `
        SELECT userId, firstName, lastName, email, 
        phoneNumber, address, nationality, gender, 
        createdAt, updatedAt 
        FROM Users LIMIT ? OFFSET ?
      `;
      const Users = await db.executeQuery(query, [limit, offset]);
      
      return {
        data: Users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error listing Users: ${error.message}`);
      throw error;
    }
  }
}

module.exports = User;