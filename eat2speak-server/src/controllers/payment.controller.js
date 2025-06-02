/**
 * Payment Controller
 * 
 * Implements business logic for payment processing and management, including:
 * - Session payment processing
 * - Payment retrieval with filtering
 * - Report generation
 * - Refund processing
 * - Authorization checks for payment operations
 * 
 * @module controllers/payment.controller
 */

const db = require('../models');
const { Payment, Session, User, Restaurant } = db;
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Get payments with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with payments list
 */
const getPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'DESC',
      startDate,
      endDate,
      minAmount,
      maxAmount,
      status
    } = req.query;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    // Check if user is admin (simplified - in production, use a more robust role check)
    let isAdmin = false;
    try {
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
      
      isAdmin = userRoles.some(userRole => 
        userRole.Role && userRole.Role.description.toLowerCase() === 'admin'
      );
    } catch (error) {
      logger.warn('Error checking admin role:', {
        userId: req.user.userId,
        error: error.message
      });
    }
    
    // If not admin, restrict to user's own payments
    if (!isAdmin) {
      whereConditions.userId = req.user.userId;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Filter by amount range
    if (minAmount !== undefined && maxAmount !== undefined) {
      whereConditions.totalAmount = {
        [Op.between]: [parseFloat(minAmount), parseFloat(maxAmount)]
      };
    } else if (minAmount !== undefined) {
      whereConditions.totalAmount = {
        [Op.gte]: parseFloat(minAmount)
      };
    } else if (maxAmount !== undefined) {
      whereConditions.totalAmount = {
        [Op.lte]: parseFloat(maxAmount)
      };
    }
    
    // Filter by status
    if (status) {
      whereConditions.status = status;
    }
    
    // Validate sort field
    const validSortFields = ['createdAt', 'totalAmount', 'status', 'userId'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    
    // Validate order direction
    const orderDirection = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Fetch payments with pagination
    const { count, rows } = await Payment.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: Session,
          attributes: ['sessionId', 'sessionDate', 'startTime', 'endTime', 'restaurantId'],
          include: [
            {
              model: Restaurant,
              attributes: ['restaurantId', 'name']
            },
            {
              model: User,
              as: 'Learner',
              attributes: ['userId', 'firstName', 'lastName']
            },
            {
              model: User,
              as: 'Native',
              attributes: ['userId', 'firstName', 'lastName']
            }
          ]
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
        payments: rows,
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
    logger.error('Error getting payments:', { 
      userId: req.user.userId,
      error: error.message, 
      stack: error.stack
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get payment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with payment details
 */
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: Session,
          attributes: ['sessionId', 'sessionDate', 'startTime', 'endTime', 'status', 'restaurantId'],
          include: [
            {
              model: Restaurant,
              attributes: ['restaurantId', 'name', 'cuisineType', 'commissionPercent']
            },
            {
              model: User,
              as: 'Learner',
              attributes: ['userId', 'firstName', 'lastName', 'email']
            },
            {
              model: User,
              as: 'Native',
              attributes: ['userId', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });
    
    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }
    
    // Check if user is authorized to view this payment
    const isPaymentUser = payment.userId === req.user.userId;
    const isSessionLearner = payment.Session?.learnerUserId === req.user.userId;
    const isSessionNative = payment.Session?.nativeUserId === req.user.userId;
    
    // Check if user is restaurant owner
    let isRestaurantOwner = false;
    if (payment.Session?.Restaurant) {
      const restaurant = await Restaurant.findByPk(payment.Session.restaurantId);
      isRestaurantOwner = restaurant && restaurant.ownerUserId === req.user.userId;
    }
    
    // Check if user is admin
    let isAdmin = false;
    try {
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
      
      isAdmin = userRoles.some(userRole => 
        userRole.Role && userRole.Role.description.toLowerCase() === 'admin'
      );
    } catch (error) {
      logger.warn('Error checking admin role:', {
        userId: req.user.userId,
        error: error.message
      });
    }
    
    if (!isPaymentUser && !isSessionLearner && !isSessionNative && !isRestaurantOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view this payment'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        payment
      }
    });
  } catch (error) {
    logger.error('Error getting payment by ID:', { 
      id: req.params.id,
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
    const { sessionId } = req.params;
    const { paymentMethod, token } = req.body;
    
    // Validate required fields
    if (!paymentMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment method is required'
      });
    }
    
    // Find session
    const session = await Session.findByPk(sessionId, {
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
          model: db.Menu,
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
      sessionId,
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
      sessionId,
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
      sessionId: req.params.sessionId,
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

/**
 * Process refund for a payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with refund details
 */
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, amount } = req.body;
    
    // Check if user is admin
    let isAdmin = false;
    try {
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
      
      isAdmin = userRoles.some(userRole => 
        userRole.Role && userRole.Role.description.toLowerCase() === 'admin'
      );
    } catch (error) {
      logger.warn('Error checking admin role:', {
        userId: req.user.userId,
        error: error.message
      });
    }
    
    if (!isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Only administrators can process refunds'
      });
    }
    
    // Find payment
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Session,
          attributes: ['sessionId', 'learnerUserId', 'nativeUserId']
        }
      ]
    });
    
    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }
    
    // Check if payment can be refunded
    if (payment.status === 'refunded') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment has already been refunded'
      });
    }
    
    // Check if amount is valid
    const refundAmount = amount ? parseFloat(amount) : payment.totalAmount;
    if (refundAmount <= 0 || refundAmount > payment.totalAmount) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid refund amount'
      });
    }
    
    // In a real app, you would process the refund with a payment provider here
    // For this example, we'll assume the refund is successful
    
    // Update payment record
    payment.status = 'refunded';
    payment.refundAmount = refundAmount;
    payment.refundReason = reason || 'Administrative refund';
    payment.refundedAt = new Date();
    payment.refundedBy = req.user.userId;
    
    await payment.save();
    
    logger.info('Refund processed successfully', { 
      paymentId: id,
      adminId: req.user.userId,
      amount: refundAmount
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Refund processed successfully',
      data: {
        payment: {
          paymentId: payment.paymentId,
          totalAmount: payment.totalAmount,
          refundAmount: payment.refundAmount,
          status: payment.status,
          refundedAt: payment.refundedAt
        }
      }
    });
  } catch (error) {
    logger.error('Error processing refund:', { 
      paymentId: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process refund',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get payments for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user payments
 */
const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Check if user is authorized to view these payments
    const isOwnPayments = userId === req.user.userId;
    
    // Check if user is admin
    let isAdmin = false;
    try {
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
      
      isAdmin = userRoles.some(userRole => 
        userRole.Role && userRole.Role.description.toLowerCase() === 'admin'
      );
    } catch (error) {
      logger.warn('Error checking admin role:', {
        userId: req.user.userId,
        error: error.message
      });
    }
    
    if (!isOwnPayments && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view these payments'
      });
    }
    
    // Validate user exists
    const user = await User.findByPk(userId, {
      attributes: ['userId', 'firstName', 'lastName', 'email']
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Build filter conditions
    const whereConditions = {
      userId
    };
    
    // Filter by status
    if (status) {
      whereConditions.status = status;
    }
    
    // Fetch payments
    const { count, rows } = await Payment.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Session,
          attributes: ['sessionId', 'sessionDate', 'startTime', 'endTime', 'status'],
          include: [
            {
              model: Restaurant,
              attributes: ['restaurantId', 'name']
            },
            {
              model: User,
              as: 'Native',
              attributes: ['userId', 'firstName', 'lastName']
            }
          ]
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
        user,
        payments: rows,
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
    logger.error('Error getting user payments:', { 
      userId: req.params.userId,
      requesterId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get payments for a specific restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with restaurant payments
 */
const getRestaurantPayments = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, startDate, endDate, status } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Validate restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId, {
      attributes: ['restaurantId', 'name', 'ownerUserId']
    });
    
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }
    
    // Check if user is authorized to view these payments
    const isRestaurantOwner = restaurant.ownerUserId === req.user.userId;
    
    // Check if user is admin
    let isAdmin = false;
    try {
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
      
      isAdmin = userRoles.some(userRole => 
        userRole.Role && userRole.Role.description.toLowerCase() === 'admin'
      );
    } catch (error) {
      logger.warn('Error checking admin role:', {
        userId: req.user.userId,
        error: error.message
      });
    }
    
    if (!isRestaurantOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view these payments'
      });
    }
    
    // Get sessions at this restaurant
    const sessions = await Session.findAll({
      where: {
        restaurantId
      },
      attributes: ['sessionId']
    });
    
    const sessionIds = sessions.map(session => session.sessionId);
    
    if (sessionIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          restaurant,
          payments: [],
          pagination: {
            total: 0,
            totalPages: 0,
            currentPage: parseInt(page),
            limit: parseInt(limit),
            hasNext: false,
            hasPrev: false
          }
        }
      });
    }
    
    // Build filter conditions
    const whereConditions = {
      sessionId: {
        [Op.in]: sessionIds
      }
    };
    
    // Filter by status
    if (status) {
      whereConditions.status = status;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Fetch payments
    const { count, rows } = await Payment.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['userId', 'firstName', 'lastName']
        },
        {
          model: Session,
          attributes: ['sessionId', 'sessionDate', 'startTime', 'endTime', 'status'],
          include: [
            {
              model: User,
              as: 'Learner',
              attributes: ['userId', 'firstName', 'lastName']
            },
            {
              model: User,
              as: 'Native',
              attributes: ['userId', 'firstName', 'lastName']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    // Calculate restaurant's total earnings
    const totalEarnings = rows.reduce((sum, payment) => sum + payment.restaurantShare, 0);
    
    return res.status(200).json({
      status: 'success',
      data: {
        restaurant,
        totalEarnings,
        payments: rows,
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
    logger.error('Error getting restaurant payments:', { 
      restaurantId: req.params.restaurantId,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve restaurant payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get monthly payment reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with monthly payment reports
 */
const getMonthlyReports = async (req, res) => {
  try {
    // Check if user is admin
    let isAdmin = false;
    try {
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
      
      isAdmin = userRoles.some(userRole => 
        userRole.Role && userRole.Role.description.toLowerCase() === 'admin'
      );
    } catch (error) {
      logger.warn('Error checking admin role:', {
        userId: req.user.userId,
        error: error.message
      });
    }
    
    if (!isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Only administrators can access monthly reports'
      });
    }
    
    // Get query parameters
    const { year = new Date().getFullYear(), month } = req.query;
    
    // Build date conditions
    let startDate, endDate;
    
    if (month) {
      // Report for a specific month
      startDate = new Date(year, parseInt(month) - 1, 1);
      endDate = new Date(year, parseInt(month), 0); // Last day of the month
    } else {
      // Report for the entire year
      startDate = new Date(year, 0, 1); // January 1st
      endDate = new Date(year, 11, 31); // December 31st
    }
    
    // Get all payments for the period
    const payments = await Payment.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        status: 'completed' // Only completed payments
      },
      attributes: [
        'paymentId',
        'totalAmount',
        'platformShare',
        'restaurantShare',
        'createdAt'
      ]
    });
    
    // Group payments by month
    const monthlyData = {};
    
    payments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          year: paymentDate.getFullYear(),
          month: paymentDate.getMonth() + 1,
          count: 0,
          totalAmount: 0,
          platformRevenue: 0,
          restaurantPayouts: 0
        };
      }
      
      monthlyData[monthKey].count++;
      monthlyData[monthKey].totalAmount += payment.totalAmount;
      monthlyData[monthKey].platformRevenue += payment.platformShare;
      monthlyData[monthKey].restaurantPayouts += payment.restaurantShare;
    });
    
    // Convert to array and sort by date
    const monthlySummary = Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    
    // Calculate overall totals
    const overallTotals = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.totalAmount, 0),
      platformRevenue: payments.reduce((sum, payment) => sum + payment.platformShare, 0),
      restaurantPayouts: payments.reduce((sum, payment) => sum + payment.restaurantShare, 0)
    };
    
    return res.status(200).json({
      status: 'success',
      data: {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          year: parseInt(year),
          month: month ? parseInt(month) : null
        },
        monthlySummary,
        overallTotals
      }
    });
  } catch (error) {
    logger.error('Error generating monthly reports:', { 
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate monthly reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get payment reports for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user payment reports
 */
const getUserPaymentReports = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is authorized to view these reports
    const isOwnReports = userId === req.user.userId;
    
    // Check if user is admin
    let isAdmin = false;
    try {
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
      
      isAdmin = userRoles.some(userRole => 
        userRole.Role && userRole.Role.description.toLowerCase() === 'admin'
      );
    } catch (error) {
      logger.warn('Error checking admin role:', {
        userId: req.user.userId,
        error: error.message
      });
    }
    
    if (!isOwnReports && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view these reports'
      });
    }
    
    // Validate user exists
    const user = await User.findByPk(userId, {
      attributes: ['userId', 'firstName', 'lastName', 'email']
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get query parameters
    const { year = new Date().getFullYear(), startDate, endDate } = req.query;
    
    // Build date conditions
    let dateCondition;
    
    if (startDate && endDate) {
      dateCondition = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else {
      // Default to current year if no date range specified
      dateCondition = {
        [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31)]
      };
    }
    
    // Get all payments for the user in the period
    const payments = await Payment.findAll({
      where: {
        userId,
        createdAt: dateCondition,
        status: 'completed' // Only completed payments
      },
      include: [
        {
          model: Session,
          attributes: ['sessionId', 'sessionDate', 'restaurantId'],
          include: [
            {
              model: Restaurant,
              attributes: ['restaurantId', 'name']
            }
          ]
        }
      ]
    });
    
    // Group payments by month
    const monthlyData = {};
    
    payments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          year: paymentDate.getFullYear(),
          month: paymentDate.getMonth() + 1,
          count: 0,
          totalAmount: 0
        };
      }
      
      monthlyData[monthKey].count++;
      monthlyData[monthKey].totalAmount += payment.totalAmount;
    });
    
    // Convert to array and sort by date
    const monthlySummary = Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    
    // Calculate statistics
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;
    
    // Group by restaurant
    const restaurantStats = {};
    
    payments.forEach(payment => {
      if (payment.Session && payment.Session.Restaurant) {
        const restaurantId = payment.Session.restaurantId;
        const restaurantName = payment.Session.Restaurant.name;
        
        if (!restaurantStats[restaurantId]) {
          restaurantStats[restaurantId] = {
            restaurantId,
            name: restaurantName,
            count: 0,
            totalAmount: 0
          };
        }
        
        restaurantStats[restaurantId].count++;
        restaurantStats[restaurantId].totalAmount += payment.totalAmount;
      }
    });
    
    // Convert to array and sort by count
    const restaurantSummary = Object.values(restaurantStats).sort((a, b) => b.count - a.count);
    
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        period: {
          startDate: startDate || new Date(year, 0, 1).toISOString().split('T')[0],
          endDate: endDate || new Date(year, 11, 31).toISOString().split('T')[0]
        },
        summary: {
          totalPayments,
          totalAmount,
          averageAmount
        },
        monthlySummary,
        restaurantSummary
      }
    });
  } catch (error) {
    logger.error('Error generating user payment reports:', { 
      userId: req.params.userId,
      requesterId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate user payment reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get payment reports for a specific restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with restaurant payment reports
 */
const getRestaurantPaymentReports = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Validate restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId, {
      attributes: ['restaurantId', 'name', 'ownerUserId']
    });
    
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }
    
    // Check if user is authorized to view these reports
    const isRestaurantOwner = restaurant.ownerUserId === req.user.userId;
    
    // Check if user is admin
    let isAdmin = false;
    try {
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
      
      isAdmin = userRoles.some(userRole => 
        userRole.Role && userRole.Role.description.toLowerCase() === 'admin'
      );
    } catch (error) {
      logger.warn('Error checking admin role:', {
        userId: req.user.userId,
        error: error.message
      });
    }
    
    if (!isRestaurantOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view these reports'
      });
    }
    
    // Get query parameters
    const { year = new Date().getFullYear(), startDate, endDate } = req.query;
    
    // Build date conditions
    let dateCondition;
    
    if (startDate && endDate) {
      dateCondition = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else {
      // Default to current year if no date range specified
      dateCondition = {
        [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31)]
      };
    }
    
    // Get sessions at this restaurant
    const sessions = await Session.findAll({
      where: {
        restaurantId
      },
      attributes: ['sessionId']
    });
    
    const sessionIds = sessions.map(session => session.sessionId);
    
    if (sessionIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          restaurant: {
            restaurantId: restaurant.restaurantId,
            name: restaurant.name
          },
          period: {
            startDate: startDate || new Date(year, 0, 1).toISOString().split('T')[0],
            endDate: endDate || new Date(year, 11, 31).toISOString().split('T')[0]
          },
          summary: {
            totalPayments: 0,
            totalAmount: 0,
            restaurantEarnings: 0
          },
          monthlySummary: []
        }
      });
    }
    
    // Get all payments for these sessions in the period
    const payments = await Payment.findAll({
      where: {
        sessionId: {
          [Op.in]: sessionIds
        },
        createdAt: dateCondition,
        status: 'completed' // Only completed payments
      },
      include: [
        {
          model: Session,
          attributes: ['sessionId', 'sessionDate', 'learnerUserId', 'nativeUserId'],
          include: [
            {
              model: User,
              as: 'Learner',
              attributes: ['userId', 'firstName', 'lastName']
            }
          ]
        }
      ]
    });
    
    // Group payments by month
    const monthlyData = {};
    
    payments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          year: paymentDate.getFullYear(),
          month: paymentDate.getMonth() + 1,
          count: 0,
          totalAmount: 0,
          restaurantEarnings: 0
        };
      }
      
      monthlyData[monthKey].count++;
      monthlyData[monthKey].totalAmount += payment.totalAmount;
      monthlyData[monthKey].restaurantEarnings += payment.restaurantShare;
    });
    
    // Convert to array and sort by date
    const monthlySummary = Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    
    // Calculate statistics
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
    const restaurantEarnings = payments.reduce((sum, payment) => sum + payment.restaurantShare, 0);
    
    // Group by learner
    const learnerStats = {};
    
    payments.forEach(payment => {
      if (payment.Session && payment.Session.Learner) {
        const learnerId = payment.Session.learnerUserId;
        const learnerName = `${payment.Session.Learner.firstName} ${payment.Session.Learner.lastName}`;
        
        if (!learnerStats[learnerId]) {
          learnerStats[learnerId] = {
            learnerId,
            name: learnerName,
            count: 0,
            totalAmount: 0
          };
        }
        
        learnerStats[learnerId].count++;
        learnerStats[learnerId].totalAmount += payment.totalAmount;
      }
    });
    
    // Convert to array and sort by count
    const learnerSummary = Object.values(learnerStats).sort((a, b) => b.count - a.count);
    
    return res.status(200).json({
      status: 'success',
      data: {
        restaurant: {
          restaurantId: restaurant.restaurantId,
          name: restaurant.name
        },
        period: {
          startDate: startDate || new Date(year, 0, 1).toISOString().split('T')[0],
          endDate: endDate || new Date(year, 11, 31).toISOString().split('T')[0]
        },
        summary: {
          totalPayments,
          totalAmount,
          restaurantEarnings
        },
        monthlySummary,
        topLearners: learnerSummary.slice(0, 10) // Top 10 learners
      }
    });
  } catch (error) {
    logger.error('Error generating restaurant payment reports:', { 
      restaurantId: req.params.restaurantId,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate restaurant payment reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  processSessionPayment,
  processRefund,
  getUserPayments,
  getRestaurantPayments,
  getMonthlyReports,
  getUserPaymentReports,
  getRestaurantPaymentReports
};