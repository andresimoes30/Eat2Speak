/**
 * Session Controller
 * 
 * Implements business logic for language learning session management, including:
 * - Session creation and scheduling
 * - Status updates and cancellation
 * - Session retrieval with filtering
 * - Payment processing
 * - Review management
 * 
 * @module controllers/session.controller
 */

const db = require('../models');
const { 
  Session, 
  User, 
  Restaurant, 
  Menu, 
  Payment, 
  Review 
} = db;
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Get sessions for the current user with filtering options
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with sessions list
 */
const getSessions = async (req, res) => {
  try {
    const { 
      role = 'all', 
      status = 'all', 
      page = 1, 
      limit = 10,
      sort = 'sessionDate',
      order = 'DESC',
      restaurantId,
      startDate,
      endDate
    } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    // Filter by user role (learner, native, restaurant)
    if (role === 'learner') {
      whereConditions.learnerUserId = req.user.userId;
    } else if (role === 'native') {
      whereConditions.nativeUserId = req.user.userId;
    } else if (role === 'restaurant') {
      // Find restaurant owned by current user
      const restaurant = await Restaurant.findOne({
        where: { ownerUserId: req.user.userId }
      });
      
      if (restaurant) {
        whereConditions.restaurantId = restaurant.restaurantId;
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'You do not own any restaurant'
        });
      }
    } else {
      // If role is 'all', show sessions where user is either learner or native
      whereConditions[Op.or] = [
        { learnerUserId: req.user.userId },
        { nativeUserId: req.user.userId }
      ];
      
      // Also include restaurant if user is a restaurant owner
      const restaurant = await Restaurant.findOne({
        where: { ownerUserId: req.user.userId }
      });
      
      if (restaurant) {
        whereConditions[Op.or].push({ restaurantId: restaurant.restaurantId });
      }
    }
    
    // Filter by specific restaurant
    if (restaurantId) {
      whereConditions.restaurantId = restaurantId;
    }
    
    // Filter by session status
    if (status !== 'all') {
      whereConditions.status = status;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      whereConditions.sessionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.sessionDate = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.sessionDate = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Validate sort field
    const validSortFields = ['sessionDate', 'startTime', 'createdAt', 'status'];
    const sortField = validSortFields.includes(sort) ? sort : 'sessionDate';
    
    // Validate order direction
    const orderDirection = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Fetch sessions with associations
    const { count, rows } = await Session.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'Learner',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'Native',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: Restaurant,
          attributes: ['restaurantId', 'name', 'address', 'cuisineType']
        },
        {
          model: Menu,
          attributes: ['menuId', 'menuCode', 'price']
        },
        {
          model: Payment,
          attributes: ['paymentId', 'totalAmount', 'learnerPercentage', 'nativePercentage', 'restaurantShare', 'platformShare']
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
        sessions: rows,
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
    logger.error('Error getting sessions:', { 
      userId: req.user.userId,
      error: error.message, 
      stack: error.stack
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get session details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with session details
 */
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await Session.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Learner',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'phoneNumber']
        },
        {
          model: User,
          as: 'Native',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'phoneNumber']
        },
        {
          model: Restaurant,
          attributes: ['restaurantId', 'name', 'address', 'cuisineType', 'commissionPercent']
        },
        {
          model: Menu,
          attributes: ['menuId', 'menuCode', 'price']
        },
        {
          model: Payment,
          attributes: [
            'paymentId', 
            'totalAmount', 
            'learnerPercentage', 
            'nativePercentage', 
            'restaurantShare', 
            'platformShare'
          ]
        },
        {
          model: Review,
          attributes: ['reviewId', 'reviewerUserId', 'reviewedUserId', 'score', 'comment', 'reviewedType']
        }
      ]
    });
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    
    // Check if the user is authorized to view this session
    const isAuthorized = 
      session.learnerUserId === req.user.userId || 
      session.nativeUserId === req.user.userId;
    
    // Also check if user is the restaurant owner
    let isRestaurantOwner = false;
    if (session.Restaurant) {
      const restaurant = await Restaurant.findByPk(session.restaurantId);
      isRestaurantOwner = restaurant && restaurant.ownerUserId === req.user.userId;
    }
    
    if (!isAuthorized && !isRestaurantOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view this session'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        session
      }
    });
  } catch (error) {
    logger.error('Error getting session by ID:', { 
      sessionId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve session details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new session request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created session
 */
const createSession = async (req, res) => {
  try {
    const {
      nativeUserId,
      restaurantId,
      menuId,
      sessionDate,
      startTime,
      endTime,
      tableSize,
      languageUsed
    } = req.body;
    
    // Validate required fields
    if (!nativeUserId || !restaurantId || !sessionDate || !startTime || !endTime || !languageUsed) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }
    
    // Validate date and time format
    const sessionDateObj = new Date(sessionDate);
    if (isNaN(sessionDateObj.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format'
      });
    }
    
    // Check if user has learner role
    // This is a simple check - in a production app, you would use a more robust role check
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
    
    const isLearner = userRoles.some(userRole => 
      userRole.Role && userRole.Role.description.toLowerCase() === 'student'
    );
    
    if (!isLearner) {
      return res.status(403).json({
        status: 'error',
        message: 'Only students can create session requests'
      });
    }
    
    // Verify native speaker exists and has native role
    const nativeSpeaker = await User.findByPk(nativeUserId);
    if (!nativeSpeaker) {
      return res.status(404).json({
        status: 'error',
        message: 'Native speaker not found'
      });
    }
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }
    
    // Verify menu item if provided
    let menuItem = null;
    if (menuId) {
      menuItem = await Menu.findOne({
        where: {
          menuId,
          restaurantId
        }
      });
      
      if (!menuItem) {
        return res.status(404).json({
          status: 'error',
          message: 'Menu item not found for this restaurant'
        });
      }
    }
    
    // Check restaurant availability for the requested date/time
    // This is a simplified check - in production, you would implement more complex availability logic
    const overlappingSessions = await Session.count({
      where: {
        restaurantId,
        sessionDate: sessionDateObj,
        [Op.or]: [
          {
            // Session starts during existing session
            startTime: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            // Session ends during existing session
            endTime: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            // Session encompasses existing session
            [Op.and]: [
              { startTime: { [Op.lte]: startTime } },
              { endTime: { [Op.gte]: endTime } }
            ]
          }
        ],
        status: {
          [Op.notIn]: ['cancelled', 'rejected']
        }
      }
    });
    
    if (overlappingSessions >= restaurant.availableTables) {
      return res.status(400).json({
        status: 'error',
        message: 'Restaurant is fully booked for the selected time'
      });
    }
    
    // Create session
    const session = await Session.create({
      learnerUserId: req.user.userId,
      nativeUserId,
      restaurantId,
      menuId: menuItem ? menuItem.menuId : null,
      sessionDate: sessionDateObj,
      startTime,
      endTime,
      tableSize: tableSize || 1,
      languageUsed,
      status: 'pending',
      totalPrice: menuItem ? menuItem.price : 0
    });
    
    logger.info('Session request created successfully', { 
      sessionId: session.sessionId,
      learnerUserId: req.user.userId,
      nativeUserId
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Session request created successfully',
      data: {
        session
      }
    });
  } catch (error) {
    logger.error('Error creating session:', { 
      userId: req.user.userId,
      error: error.message, 
      stack: error.stack
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create session request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update session details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated session
 */
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sessionDate,
      startTime,
      endTime,
      tableSize,
      languageUsed,
      menuId
    } = req.body;
    
    // Find session
    const session = await Session.findByPk(id);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    
    // Check if user is authorized to update this session
    if (session.learnerUserId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to update this session'
      });
    }
    
    // Check if session is in a state that can be updated
    if (session.status !== 'pending' && session.status !== 'scheduled') {
      return res.status(400).json({
        status: 'error',
        message: `Session cannot be updated in ${session.status} status`
      });
    }
    
    // Validate date if provided
    if (sessionDate) {
      const sessionDateObj = new Date(sessionDate);
      if (isNaN(sessionDateObj.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid date format'
        });
      }
      session.sessionDate = sessionDateObj;
    }
    
    // Update fields if provided
    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    if (tableSize) session.tableSize = tableSize;
    if (languageUsed) session.languageUsed = languageUsed;
    
    // Update menu if provided
    if (menuId) {
      const menuItem = await Menu.findOne({
        where: {
          menuId,
          restaurantId: session.restaurantId
        }
      });
      
      if (!menuItem) {
        return res.status(404).json({
          status: 'error',
          message: 'Menu item not found for this restaurant'
        });
      }
      
      session.menuId = menuId;
      session.totalPrice = menuItem.price;
    }
    
    // Save changes
    await session.save();
    
    logger.info('Session updated successfully', { 
      sessionId: id,
      userId: req.user.userId
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Session updated successfully',
      data: {
        session
      }
    });
  } catch (error) {
    logger.error('Error updating session:', { 
      sessionId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update session status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated session
 */
const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
    }
    
    // Validate status
    const validStatuses = ['pending', 'scheduled', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }
    
    // Find session
    const session = await Session.findByPk(id);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    
    // Check if user is authorized to update this session status
    const isLearner = session.learnerUserId === req.user.userId;
    const isNative = session.nativeUserId === req.user.userId;
    
    // Check if user is restaurant owner
    let isRestaurantOwner = false;
    const restaurant = await Restaurant.findByPk(session.restaurantId);
    isRestaurantOwner = restaurant && restaurant.ownerUserId === req.user.userId;
    
    // Check authorization based on requested status change
    if (status === 'scheduled') {
      // Only native speaker can confirm a session
      if (!isNative) {
        return res.status(403).json({
          status: 'error',
          message: 'Only the native speaker can confirm a session'
        });
      }
      
      // Can only confirm pending sessions
      if (session.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: `Cannot confirm a session in ${session.status} status`
        });
      }
    } else if (status === 'completed') {
      // Both learner and native can mark session as completed
      if (!isLearner && !isNative) {
        return res.status(403).json({
          status: 'error',
          message: 'Only session participants can mark it as completed'
        });
      }
      
      // Can only complete scheduled sessions
      if (session.status !== 'scheduled') {
        return res.status(400).json({
          status: 'error',
          message: `Cannot complete a session in ${session.status} status`
        });
      }
    } else if (status === 'cancelled' || status === 'rejected') {
      // Learner can cancel, native can reject
      if (status === 'cancelled' && !isLearner) {
        return res.status(403).json({
          status: 'error',
          message: 'Only the learner can cancel a session'
        });
      }
      
      if (status === 'rejected' && !isNative) {
        return res.status(403).json({
          status: 'error',
          message: 'Only the native speaker can reject a session'
        });
      }
      
      // Cannot cancel/reject completed sessions
      if (session.status === 'completed') {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot cancel or reject a completed session'
        });
      }
    }
    
    // Update status
    session.status = status;
    
    // Add cancellation reason if provided
    if ((status === 'cancelled' || status === 'rejected') && reason) {
      session.cancelReason = reason;
      session.cancelledAt = new Date();
    }
    
    // Save changes
    await session.save();
    
    logger.info(`Session status updated to ${status}`, { 
      sessionId: id,
      userId: req.user.userId,
      previousStatus: session.status
    });
    
    return res.status(200).json({
      status: 'success',
      message: `Session ${status} successfully`,
      data: {
        session
      }
    });
  } catch (error) {
    logger.error('Error updating session status:', { 
      sessionId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update session status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get upcoming sessions for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with upcoming sessions
 */
const getUpcomingSessions = async (req, res) => {
  try {
    // Check if user is learner or native
    const isLearner = req.query.role === 'learner';
    const isNative = req.query.role === 'native';
    
    // Build filter conditions
    const whereConditions = {
      [Op.or]: []
    };
    
    // Current date
    const now = new Date();
    
    // Filter by role if specified
    if (isLearner) {
      whereConditions[Op.or].push({ learnerUserId: req.user.userId });
    } else if (isNative) {
      whereConditions[Op.or].push({ nativeUserId: req.user.userId });
    } else {
      // If no role specified, include both
      whereConditions[Op.or].push(
        { learnerUserId: req.user.userId },
        { nativeUserId: req.user.userId }
      );
    }
    
    // Check if user is a restaurant owner
    const restaurant = await Restaurant.findOne({
      where: { ownerUserId: req.user.userId }
    });
    
    if (restaurant) {
      whereConditions[Op.or].push({ restaurantId: restaurant.restaurantId });
    }
    
    // Add date filter for upcoming sessions
    whereConditions[Op.and] = [
      {
        [Op.or]: [
          // Session date is in the future
          { sessionDate: { [Op.gt]: now } },
          // Session date is today but end time is in the future
          {
            [Op.and]: [
              { sessionDate: { [Op.eq]: now.toISOString().split('T')[0] } },
              // This is a simplified check - in production, you would compare against current time
              // For this example, we're assuming endTime is a string like "HH:MM"
              { endTime: { [Op.gt]: now.getHours() + ':' + now.getMinutes() } }
            ]
          }
        ]
      },
      // Only include pending or scheduled sessions
      { status: { [Op.in]: ['pending', 'scheduled'] } }
    ];
    
    // Fetch upcoming sessions
    const sessions = await Session.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'Learner',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'Native',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: Restaurant,
          attributes: ['restaurantId', 'name', 'address', 'cuisineType']
        },
        {
          model: Menu,
          attributes: ['menuId', 'menuCode', 'price']
        }
      ],
      order: [
        ['sessionDate', 'ASC'],
        ['startTime', 'ASC']
      ]
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        sessions
      }
    });
  } catch (error) {
    logger.error('Error getting upcoming sessions:', { 
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve upcoming sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get session history for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with session history
 */
const getSessionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {
      [Op.or]: []
    };
    
    // Filter by role if specified
    if (role === 'learner') {
      whereConditions[Op.or].push({ learnerUserId: req.user.userId });
    } else if (role === 'native') {
      whereConditions[Op.or].push({ nativeUserId: req.user.userId });
    } else {
      // If no role specified, include both
      whereConditions[Op.or].push(
        { learnerUserId: req.user.userId },
        { nativeUserId: req.user.userId }
      );
    }
    
    // Check if user is a restaurant owner
    const restaurant = await Restaurant.findOne({
      where: { ownerUserId: req.user.userId }
    });
    
    if (restaurant) {
      whereConditions[Op.or].push({ restaurantId: restaurant.restaurantId });
    }
    
    // Add filter for completed or cancelled sessions
    whereConditions.status = { [Op.in]: ['completed', 'cancelled', 'rejected'] };
    
    // Fetch session history
    const { count, rows } = await Session.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'Learner',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'Native',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: Restaurant,
          attributes: ['restaurantId', 'name', 'address', 'cuisineType']
        },
        {
          model: Menu,
          attributes: ['menuId', 'menuCode', 'price']
        },
        {
          model: Payment,
          attributes: ['paymentId', 'totalAmount']
        },
        {
          model: Review,
          attributes: ['reviewId', 'reviewerUserId', 'reviewedUserId', 'score']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['sessionDate', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      data: {
        sessions: rows,
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
    logger.error('Error getting session history:', { 
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve session history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancel a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with cancelled session
 */
const cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Find session
    const session = await Session.findByPk(id);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    
    // Check if user is authorized to cancel this session
    const isLearner = session.learnerUserId === req.user.userId;
    const isNative = session.nativeUserId === req.user.userId;
    
    if (!isLearner && !isNative) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to cancel this session'
      });
    }
    
    // Check if session can be cancelled
    if (session.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel a completed session'
      });
    }
    
    if (session.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Session is already cancelled'
      });
    }
    
    // Update session status
    session.status = 'cancelled';
    session.cancelReason = reason || 'Cancelled by user';
    session.cancelledAt = new Date();
    
    // Save changes
    await session.save();
    
    logger.info('Session cancelled successfully', { 
      sessionId: id,
      userId: req.user.userId,
      reason: session.cancelReason
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Session cancelled successfully',
      data: {
        session
      }
    });
  } catch (error) {
    logger.error('Error cancelling session:', { 
      sessionId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to cancel session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add a review for a completed session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created review
 */
const addSessionReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewedUserId, score, comment, reviewedType } = req.body;
    
    // Validate required fields
    if (!reviewedUserId || !score || !reviewedType) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }
    
    // Validate score
    if (score < 1 || score > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Score must be between 1 and 5'
      });
    }
    
    // Validate reviewedType
    const validTypes = ['native', 'learner', 'restaurant'];
    if (!validTypes.includes(reviewedType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reviewed type'
      });
    }
    
    // Find session
    const session = await Session.findByPk(id);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    
    // Check if session is completed
    if (session.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only review completed sessions'
      });
    }
    
    // Check if user is a participant in this session
    const isLearner = session.learnerUserId === req.user.userId;
    const isNative = session.nativeUserId === req.user.userId;
    
    if (!isLearner && !isNative) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to review this session'
      });
    }
    
    // Verify reviewed user is part of the session
    if (reviewedType === 'learner' && session.learnerUserId !== reviewedUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'Reviewed user is not the learner of this session'
      });
    }
    
    if (reviewedType === 'native' && session.nativeUserId !== reviewedUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'Reviewed user is not the native speaker of this session'
      });
    }
    
    if (reviewedType === 'restaurant') {
      // Check if restaurant owner is being reviewed
      const restaurant = await Restaurant.findByPk(session.restaurantId);
      if (!restaurant || restaurant.ownerUserId !== reviewedUserId) {
        return res.status(400).json({
          status: 'error',
          message: 'Reviewed user is not the restaurant owner of this session'
        });
      }
    }
    
    // Check if user is trying to review themselves
    if (reviewedUserId === req.user.userId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot review yourself'
      });
    }
    
    // Check if user has already reviewed this user for this session
    const existingReview = await Review.findOne({
      where: {
        sessionId: id,
        reviewerUserId: req.user.userId,
        reviewedUserId
      }
    });
    
    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this user for this session'
      });
    }
    
    // Create review
    const review = await Review.create({
      sessionId: id,
      reviewerUserId: req.user.userId,
      reviewedUserId,
      score,
      comment: comment || null,
      reviewedType
    });
    
    logger.info('Review added successfully', { 
      reviewId: review.reviewId,
      sessionId: id,
      reviewerId: req.user.userId,
      reviewedId: reviewedUserId
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Review added successfully',
      data: {
        review
      }
    });
  } catch (error) {
    logger.error('Error adding review:', { 
      sessionId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get payment details for a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with payment details
 */
const getSessionPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find session
    const session = await Session.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Learner',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'Native',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: Restaurant,
          attributes: ['restaurantId', 'name', 'address', 'cuisineType', 'commissionPercent']
        },
        {
          model: Menu,
          attributes: ['menuId', 'menuCode', 'price']
        },
        {
          model: Payment,
          attributes: [
            'paymentId', 
            'totalAmount', 
            'learnerPercentage', 
            'nativePercentage', 
            'restaurantShare', 
            'platformShare'
          ]
        }
      ]
    });
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    
    // Check if user is authorized to view payment details
    const isLearner = session.learnerUserId === req.user.userId;
    const isNative = session.nativeUserId === req.user.userId;
    
    // Also check if user is the restaurant owner
    let isRestaurantOwner = false;
    if (session.Restaurant) {
      const restaurant = await Restaurant.findByPk(session.restaurantId);
      isRestaurantOwner = restaurant && restaurant.ownerUserId === req.user.userId;
    }
    
    if (!isLearner && !isNative && !isRestaurantOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view payment details for this session'
      });
    }
    
    // If payment doesn't exist yet, calculate estimated payment details
    let paymentDetails;
    
    if (session.Payment) {
      paymentDetails = session.Payment;
    } else {
      // Calculate estimated payment details based on session data
      const menuPrice = session.Menu ? session.Menu.price : 0;
      const restaurantCommission = session.Restaurant ? session.Restaurant.commissionPercent : 10;
      
      // Default split percentages
      const platformPercentage = 20; // 20% to platform
      const nativePercentage = 50;   // 50% to native speaker
      const restaurantPercentage = restaurantCommission; // Restaurant commission
      const learnerPercentage = 100 - platformPercentage - nativePercentage - restaurantPercentage;
      
      paymentDetails = {
        estimatedTotal: menuPrice,
        platformShare: (menuPrice * platformPercentage) / 100,
        nativeShare: (menuPrice * nativePercentage) / 100,
        restaurantShare: (menuPrice * restaurantPercentage) / 100,
        learnerPercentage,
        nativePercentage,
        restaurantPercentage,
        platformPercentage,
        status: 'estimated'
      };
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        session: {
          sessionId: session.sessionId,
          status: session.status,
          sessionDate: session.sessionDate,
          startTime: session.startTime,
          endTime: session.endTime
        },
        payment: paymentDetails,
        isPaid: !!session.Payment
      }
    });
  } catch (error) {
    logger.error('Error getting session payment:', { 
      sessionId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve payment details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Process payment for a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with payment details
 */
const processSessionPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, token } = req.body;
    
    // Validate required fields
    if (!paymentMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment method is required'
      });
    }
    
    // Find session
    const session = await Session.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Learner',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'Native',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: Restaurant,
          attributes: ['restaurantId', 'name', 'commissionPercent']
        },
        {
          model: Menu,
          attributes: ['menuId', 'menuCode', 'price']
        },
        {
          model: Payment
        }
      ]
    });
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    
    // Check if user is authorized to make payment
    if (session.learnerUserId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the learner can make payment for this session'
      });
    }
    
    // Check if payment already exists
    if (session.Payment) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment has already been processed for this session'
      });
    }
    
    // Check if session is in a state that can be paid for
    if (session.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: `Cannot process payment for session in ${session.status} status`
      });
    }
    
    // Calculate payment details
    const menuPrice = session.Menu ? session.Menu.price : 0;
    const restaurantCommission = session.Restaurant ? session.Restaurant.commissionPercent : 10;
    
    // Default split percentages
    const platformPercentage = 20; // 20% to platform
    const nativePercentage = 50;   // 50% to native speaker
    const restaurantPercentage = restaurantCommission; // Restaurant commission
    const learnerPercentage = 100 - platformPercentage - nativePercentage - restaurantPercentage;
    
    // Calculate shares
    const platformShare = (menuPrice * platformPercentage) / 100;
    const nativeShare = (menuPrice * nativePercentage) / 100;
    const restaurantShare = (menuPrice * restaurantPercentage) / 100;
    
    // In a real app, you would process the payment with a payment provider here
    // For this example, we'll assume the payment is successful
    
    // Create payment record
    const payment = await Payment.create({
      sessionId: id,
      userId: req.user.userId,
      totalAmount: menuPrice,
      learnerPercentage,
      nativePercentage,
      restaurantShare,
      platformShare,
      paymentMethod,
      token: token || null,
      status: 'completed',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    logger.info('Payment processed successfully', { 
      paymentId: payment.paymentId,
      sessionId: id,
      userId: req.user.userId,
      amount: menuPrice
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Payment processed successfully',
      data: {
        payment: {
          paymentId: payment.paymentId,
          totalAmount: payment.totalAmount,
          status: payment.status,
          createdAt: payment.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Error processing payment:', { 
      sessionId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  updateSessionStatus,
  getUpcomingSessions,
  getSessionHistory,
  cancelSession,
  addSessionReview,
  getSessionPayment,
  processSessionPayment
};