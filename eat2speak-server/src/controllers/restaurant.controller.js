/**
 * Restaurant Controller
 * 
 * Implements business logic for restaurant management, including:
 * - Restaurant CRUD operations
 * - Menu management
 * - Table management
 * - Availability management
 * - Review retrieval
 * 
 * @module controllers/restaurant.controller
 */

const db = require('../models');
const { Restaurant, Menu, User, Review, Session } = db;
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Get all restaurants with pagination, filtering and sorting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with restaurants list
 */
const getRestaurants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      cuisine = '',
      sort = 'name',
      order = 'ASC'
    } = req.query;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions.name = { [Op.like]: `%${search}%` };
    }
    
    if (cuisine) {
      whereConditions.cuisineType = { [Op.like]: `%${cuisine}%` };
    }

    // Validate sort field
    const validSortFields = ['name', 'cuisineType', 'createdAt'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    
    // Validate order direction
    const orderDirection = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Get restaurants with pagination
    const { count, rows } = await Restaurant.findAndCountAll({
      where: whereConditions,
      attributes: [
        'restaurantId', 
        'name', 
        'cuisineType', 
        'address',
        'commissionPercent',
        'createdAt'
      ],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortField, orderDirection]]
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      status: 'success',
      data: {
        restaurants: rows,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error getting restaurants:', { error: error.message, stack: error.stack });
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get restaurant details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with restaurant details
 */
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        restaurant
      }
    });
  } catch (error) {
    logger.error('Error getting restaurant by ID:', { id: req.params.id, error: error.message });
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve restaurant details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created restaurant
 */
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      cuisineType,
      address,
      seatsPerTable,
      availableTables,
      commissionPercent
    } = req.body;

    // Validate required fields
    if (!name || !cuisineType || !address) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, cuisineType, and address are required'
      });
    }

    // Validate user has restaurant role
    const userRoles = await db.UserRole.findAll({
      where: {
        userId: req.user.userId
      },
      include: [
        {
          model: db.Role,
          as: 'Role'
        }
      ]
    });

    const isRestaurantOwner = userRoles.some(userRole => 
      userRole.Role && userRole.Role.description.toLowerCase() === 'restaurant'
    );

    if (!isRestaurantOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to create a restaurant'
      });
    }

    // Check if user already has a restaurant
    const existingRestaurant = await Restaurant.findOne({
      where: {
        ownerUserId: req.user.userId
      }
    });

    if (existingRestaurant) {
      return res.status(400).json({
        status: 'error',
        message: 'You already have a registered restaurant'
      });
    }

    // Create restaurant
    const restaurant = await Restaurant.create({
      ownerUserId: req.user.userId,
      name,
      cuisineType,
      address,
      seatsPerTable: seatsPerTable || 4,
      availableTables: availableTables || 10,
      commissionPercent: commissionPercent || 10.0
    });

    logger.info('Restaurant created successfully', { 
      restaurantId: restaurant.restaurantId,
      userId: req.user.userId
    });

    return res.status(201).json({
      status: 'success',
      message: 'Restaurant created successfully',
      data: {
        restaurant
      }
    });
  } catch (error) {
    logger.error('Error creating restaurant:', { 
      userId: req.user.userId,
      error: error.message, 
      stack: error.stack
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update restaurant details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated restaurant
 */
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      cuisineType,
      address,
      seatsPerTable,
      availableTables,
      commissionPercent
    } = req.body;

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Check if user is the restaurant owner
    if (restaurant.ownerUserId !== req.user.userId) {
      // Check if user is admin
      const userRoles = await db.UserRole.findAll({
        where: {
          userId: req.user.userId
        },
        include: [
          {
            model: db.Role,
            as: 'Role'
          }
        ]
      });

      const isAdmin = userRoles.some(userRole => 
        userRole.Role && userRole.Role.description.toLowerCase() === 'admin'
      );

      if (!isAdmin) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update this restaurant'
        });
      }
    }

    // Update restaurant fields
    if (name) restaurant.name = name;
    if (cuisineType) restaurant.cuisineType = cuisineType;
    if (address) restaurant.address = address;
    if (seatsPerTable) restaurant.seatsPerTable = seatsPerTable;
    if (availableTables) restaurant.availableTables = availableTables;
    if (commissionPercent) restaurant.commissionPercent = commissionPercent;

    // Save changes
    await restaurant.save();

    logger.info('Restaurant updated successfully', { 
      restaurantId: restaurant.restaurantId,
      userId: req.user.userId
    });

    return res.status(200).json({
      status: 'success',
      message: 'Restaurant updated successfully',
      data: {
        restaurant
      }
    });
  } catch (error) {
    logger.error('Error updating restaurant:', { 
      id: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message
 */
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Check if user is the restaurant owner or admin
    if (restaurant.ownerUserId !== req.user.userId) {
      // Check if user is admin
      const userRoles = await db.UserRole.findAll({
        where: {
          userId: req.user.userId
        },
        include: [
          {
            model: db.Role,
            as: 'Role'
          }
        ]
      });

      const isAdmin = userRoles.some(userRole => 
        userRole.Role && userRole.Role.description.toLowerCase() === 'admin'
      );

      if (!isAdmin) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to delete this restaurant'
        });
      }
    }

    // Check for active sessions
    const activeSessions = await Session.count({
      where: {
        restaurantId: id,
        status: {
          [Op.in]: ['pending', 'scheduled']
        }
      }
    });

    if (activeSessions > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete restaurant with active sessions',
        data: {
          activeSessions
        }
      });
    }

    // Delete associated menu items first
    await Menu.destroy({
      where: {
        restaurantId: id
      }
    });

    // Delete restaurant
    await restaurant.destroy();

    logger.info('Restaurant deleted successfully', { 
      restaurantId: id,
      userId: req.user.userId
    });

    return res.status(200).json({
      status: 'success',
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting restaurant:', { 
      id: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get restaurant menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with menu items
 */
const getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate restaurant exists
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Get menu items
    const menuItems = await Menu.findAll({
      where: {
        restaurantId: id
      },
      order: [['price', 'ASC']]
    });

    return res.status(200).json({
      status: 'success',
      data: {
        restaurant: {
          id: restaurant.restaurantId,
          name: restaurant.name
        },
        menuItems
      }
    });
  } catch (error) {
    logger.error('Error getting restaurant menu:', { 
      restaurantId: req.params.id,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve restaurant menu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add a menu item to a restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created menu item
 */
const addMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { menuCode, price } = req.body;

    // Validate required fields
    if (!menuCode || !price) {
      return res.status(400).json({
        status: 'error',
        message: 'Menu code and price are required'
      });
    }

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Check if user is the restaurant owner
    if (restaurant.ownerUserId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to add menu items to this restaurant'
      });
    }

    // Check if menu item already exists
    const existingMenuItem = await Menu.findOne({
      where: {
        restaurantId: id,
        menuCode
      }
    });

    if (existingMenuItem) {
      return res.status(400).json({
        status: 'error',
        message: 'Menu item with this code already exists'
      });
    }

    // Create menu item
    const menuItem = await Menu.create({
      restaurantId: id,
      menuCode,
      price
    });

    logger.info('Menu item added successfully', { 
      restaurantId: id,
      menuId: menuItem.menuId,
      userId: req.user.userId
    });

    return res.status(201).json({
      status: 'success',
      message: 'Menu item added successfully',
      data: {
        menuItem
      }
    });
  } catch (error) {
    logger.error('Error adding menu item:', { 
      restaurantId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a menu item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated menu item
 */
const updateMenuItem = async (req, res) => {
  try {
    const { id, menuId } = req.params;
    const { menuCode, price } = req.body;

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Check if user is the restaurant owner
    if (restaurant.ownerUserId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update menu items for this restaurant'
      });
    }

    // Find menu item
    const menuItem = await Menu.findOne({
      where: {
        menuId,
        restaurantId: id
      }
    });

    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      });
    }

    // Update menu item fields
    if (menuCode) {
      // Check if updated code conflicts with another item
      if (menuCode !== menuItem.menuCode) {
        const existingMenuItem = await Menu.findOne({
          where: {
            restaurantId: id,
            menuCode,
            menuId: { [Op.ne]: menuId }
          }
        });

        if (existingMenuItem) {
          return res.status(400).json({
            status: 'error',
            message: 'Another menu item with this code already exists'
          });
        }

        menuItem.menuCode = menuCode;
      }
    }
    
    if (price) {
      menuItem.price = price;
    }

    // Save changes
    await menuItem.save();

    logger.info('Menu item updated successfully', { 
      restaurantId: id,
      menuId,
      userId: req.user.userId
    });

    return res.status(200).json({
      status: 'success',
      message: 'Menu item updated successfully',
      data: {
        menuItem
      }
    });
  } catch (error) {
    logger.error('Error updating menu item:', { 
      restaurantId: req.params.id,
      menuId: req.params.menuId,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a menu item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message
 */
const deleteMenuItem = async (req, res) => {
  try {
    const { id, menuId } = req.params;

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Check if user is the restaurant owner
    if (restaurant.ownerUserId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete menu items from this restaurant'
      });
    }

    // Find menu item
    const menuItem = await Menu.findOne({
      where: {
        menuId,
        restaurantId: id
      }
    });

    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      });
    }

    // Check if menu item is used in any sessions
    const sessionCount = await Session.count({
      where: {
        menuId
      }
    });

    if (sessionCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete menu item that is used in sessions',
        data: {
          sessionCount
        }
      });
    }

    // Delete menu item
    await menuItem.destroy();

    logger.info('Menu item deleted successfully', { 
      restaurantId: id,
      menuId,
      userId: req.user.userId
    });

    return res.status(200).json({
      status: 'success',
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting menu item:', { 
      restaurantId: req.params.id,
      menuId: req.params.menuId,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get restaurant availability
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with availability information
 */
const getAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // If no specific date is provided, return general availability
    if (!date) {
      return res.status(200).json({
        status: 'success',
        data: {
          restaurant: {
            id: restaurant.restaurantId,
            name: restaurant.name
          },
          availableTables: restaurant.availableTables,
          seatsPerTable: restaurant.seatsPerTable
        }
      });
    }

    // Parse date
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format'
      });
    }

    // Get booked sessions for the date
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedSessions = await Session.findAll({
      where: {
        restaurantId: id,
        sessionDate: {
          [Op.between]: [startOfDay, endOfDay]
        },
        status: {
          [Op.in]: ['pending', 'scheduled', 'completed']
        }
      },
      attributes: ['sessionId', 'startTime', 'endTime', 'tableSize']
    });

    // Calculate available timeslots
    // This is a simple implementation - in production, more complex logic would be needed
    const availableTimeslots = [];
    const operatingHours = {
      start: 10, // 10 AM
      end: 22,   // 10 PM
      interval: 2 // 2 hour sessions
    };

    for (let hour = operatingHours.start; hour < operatingHours.end; hour += operatingHours.interval) {
      const startTime = `${hour}:00`;
      const endTime = `${hour + operatingHours.interval}:00`;
      
      // Count overlapping sessions
      const overlappingSessions = bookedSessions.filter(session => {
        const sessionStart = session.startTime;
        const sessionEnd = session.endTime;
        
        // Check if session overlaps with this timeslot
        return (sessionStart <= endTime && sessionEnd >= startTime);
      });
      
      // Calculate tables used
      const tablesUsed = overlappingSessions.length;
      
      // Calculate available tables
      const availableTables = Math.max(0, restaurant.availableTables - tablesUsed);
      
      availableTimeslots.push({
        date: queryDate.toISOString().split('T')[0],
        startTime,
        endTime,
        availableTables,
        totalTables: restaurant.availableTables
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        restaurant: {
          id: restaurant.restaurantId,
          name: restaurant.name
        },
        date: queryDate.toISOString().split('T')[0],
        availableTimeslots
      }
    });
  } catch (error) {
    logger.error('Error getting restaurant availability:', { 
      restaurantId: req.params.id,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve restaurant availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update restaurant availability
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated availability
 */
const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availableTables, seatsPerTable } = req.body;

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Check if user is the restaurant owner
    if (restaurant.ownerUserId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this restaurant'
      });
    }

    // Update availability fields
    if (availableTables !== undefined) {
      if (availableTables < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Available tables must be a positive number'
        });
      }
      restaurant.availableTables = availableTables;
    }
    
    if (seatsPerTable !== undefined) {
      if (seatsPerTable < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Seats per table must be at least 1'
        });
      }
      restaurant.seatsPerTable = seatsPerTable;
    }

    // Save changes
    await restaurant.save();

    logger.info('Restaurant availability updated successfully', { 
      restaurantId: id,
      userId: req.user.userId
    });

    return res.status(200).json({
      status: 'success',
      message: 'Restaurant availability updated successfully',
      data: {
        availableTables: restaurant.availableTables,
        seatsPerTable: restaurant.seatsPerTable
      }
    });
  } catch (error) {
    logger.error('Error updating restaurant availability:', { 
      restaurantId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update restaurant availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get restaurant tables information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with tables information
 */
const getRestaurantTables = async (req, res) => {
  try {
    const { id } = req.params;

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        restaurant: {
          id: restaurant.restaurantId,
          name: restaurant.name
        },
        tables: {
          availableTables: restaurant.availableTables,
          seatsPerTable: restaurant.seatsPerTable,
          totalCapacity: restaurant.availableTables * restaurant.seatsPerTable
        }
      }
    });
  } catch (error) {
    logger.error('Error getting restaurant tables:', { 
      restaurantId: req.params.id,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve restaurant tables information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update restaurant tables information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated tables information
 */
const updateRestaurantTables = async (req, res) => {
  try {
    const { id } = req.params;
    const { availableTables, seatsPerTable } = req.body;

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Check if user is the restaurant owner
    if (restaurant.ownerUserId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this restaurant'
      });
    }

    // Update tables fields
    if (availableTables !== undefined) {
      if (availableTables < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Available tables must be a positive number'
        });
      }
      restaurant.availableTables = availableTables;
    }
    
    if (seatsPerTable !== undefined) {
      if (seatsPerTable < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Seats per table must be at least 1'
        });
      }
      restaurant.seatsPerTable = seatsPerTable;
    }

    // Save changes
    await restaurant.save();

    logger.info('Restaurant tables updated successfully', { 
      restaurantId: id,
      userId: req.user.userId
    });

    return res.status(200).json({
      status: 'success',
      message: 'Restaurant tables updated successfully',
      data: {
        tables: {
          availableTables: restaurant.availableTables,
          seatsPerTable: restaurant.seatsPerTable,
          totalCapacity: restaurant.availableTables * restaurant.seatsPerTable
        }
      }
    });
  } catch (error) {
    logger.error('Error updating restaurant tables:', { 
      restaurantId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update restaurant tables',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get reviews for a restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with reviews
 */
const getRestaurantReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate restaurant exists
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get sessions at this restaurant
    const sessions = await Session.findAll({
      where: {
        restaurantId: id
      },
      attributes: ['sessionId']
    });

    const sessionIds = sessions.map(session => session.sessionId);

    // Get reviews for these sessions
    const { count, rows } = await Review.findAndCountAll({
      where: {
        sessionId: {
          [Op.in]: sessionIds
        }
      },
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['userId', 'firstName', 'lastName']
        },
        {
          model: Session,
          attributes: ['sessionId', 'sessionDate']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      status: 'success',
      data: {
        restaurant: {
          id: restaurant.restaurantId,
          name: restaurant.name
        },
        reviews: rows,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error getting restaurant reviews:', { 
      restaurantId: req.params.id,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve restaurant reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAvailability,
  updateAvailability,
  getRestaurantTables,
  updateRestaurantTables,
  getRestaurantReviews
};