/**
 * Review Controller
 * 
 * Implements business logic for review management, including:
 * - Review creation and validation
 * - Review retrieval with filtering
 * - Review statistics calculation
 * - Authorization checks for review operations
 * 
 * @module controllers/review.controller
 */

const db = require('../models');
const { Review, User, Restaurant, Session } = db;
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Get reviews with filtering options
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with reviews list
 */
const getReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'DESC',
      minScore,
      maxScore,
      reviewedType
    } = req.query;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    // Filter by score range
    if (minScore !== undefined && maxScore !== undefined) {
      whereConditions.score = {
        [Op.between]: [parseInt(minScore), parseInt(maxScore)]
      };
    } else if (minScore !== undefined) {
      whereConditions.score = {
        [Op.gte]: parseInt(minScore)
      };
    } else if (maxScore !== undefined) {
      whereConditions.score = {
        [Op.lte]: parseInt(maxScore)
      };
    }
    
    // Filter by reviewed type
    if (reviewedType) {
      whereConditions.reviewedType = reviewedType;
    }
    
    // Validate sort field
    const validSortFields = ['createdAt', 'score', 'reviewerUserId', 'reviewedUserId'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    
    // Validate order direction
    const orderDirection = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Fetch reviews with pagination
    const { count, rows } = await Review.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['userId', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'Reviewed',
          attributes: ['userId', 'firstName', 'lastName']
        },
        {
          model: Session,
          attributes: ['sessionId', 'sessionDate', 'restaurantId']
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
    logger.error('Error getting reviews:', { error: error.message, stack: error.stack });
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get review by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with review details
 */
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'Reviewed',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        },
        {
          model: Session,
          attributes: ['sessionId', 'sessionDate', 'startTime', 'endTime', 'restaurantId'],
          include: [
            {
              model: Restaurant,
              attributes: ['restaurantId', 'name', 'cuisineType']
            }
          ]
        }
      ]
    });
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    logger.error('Error getting review by ID:', { 
      id: req.params.id,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve review details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created review
 */
const createReview = async (req, res) => {
  try {
    const {
      sessionId,
      reviewedUserId,
      score,
      comment,
      reviewedType
    } = req.body;
    
    // Validate required fields
    if (!sessionId || !reviewedUserId || !score || !reviewedType) {
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
    const validTypes = ['learner', 'native', 'restaurant'];
    if (!validTypes.includes(reviewedType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reviewed type'
      });
    }
    
    // Find session
    const session = await Session.findByPk(sessionId);
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
    
    // Check if user is a participant in the session
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
        sessionId,
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
      sessionId,
      reviewerUserId: req.user.userId,
      reviewedUserId,
      score,
      comment: comment || null,
      reviewedType
    });
    
    logger.info('Review created successfully', { 
      reviewId: review.reviewId,
      sessionId,
      reviewerUserId: req.user.userId,
      reviewedUserId
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Review created successfully',
      data: {
        review
      }
    });
  } catch (error) {
    logger.error('Error creating review:', { 
      userId: req.user.userId,
      error: error.message, 
      stack: error.stack
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated review
 */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, comment } = req.body;
    
    // Find review
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    // Check if user is the reviewer
    if (review.reviewerUserId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to update this review'
      });
    }
    
    // Check time window for updates (e.g., 48 hours)
    const reviewAge = Date.now() - new Date(review.createdAt).getTime();
    const maxEditWindow = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
    
    if (reviewAge > maxEditWindow) {
      return res.status(400).json({
        status: 'error',
        message: 'Reviews can only be edited within 48 hours of creation'
      });
    }
    
    // Update fields
    if (score !== undefined) {
      if (score < 1 || score > 5) {
        return res.status(400).json({
          status: 'error',
          message: 'Score must be between 1 and 5'
        });
      }
      review.score = score;
    }
    
    if (comment !== undefined) {
      review.comment = comment;
    }
    
    // Save changes
    await review.save();
    
    logger.info('Review updated successfully', { 
      reviewId: id,
      userId: req.user.userId
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Review updated successfully',
      data: {
        review
      }
    });
  } catch (error) {
    logger.error('Error updating review:', { 
      id: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find review
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    // Check if user is the reviewer or an admin
    const isReviewer = review.reviewerUserId === req.user.userId;
    
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
    
    if (!isReviewer && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to delete this review'
      });
    }
    
    // Delete review
    await review.destroy();
    
    logger.info('Review deleted successfully', { 
      reviewId: id,
      userId: req.user.userId
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting review:', { 
      id: req.params.id,
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get reviews for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user reviews
 */
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, type = 'received' } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
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
    const whereConditions = {};
    
    if (type === 'given') {
      // Reviews given by the user
      whereConditions.reviewerUserId = userId;
    } else {
      // Reviews received by the user (default)
      whereConditions.reviewedUserId = userId;
    }
    
    // Fetch reviews
    const { count, rows } = await Review.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['userId', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'Reviewed',
          attributes: ['userId', 'firstName', 'lastName']
        },
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
        reviewType: type,
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
    logger.error('Error getting user reviews:', { 
      userId: req.params.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get reviews for a specific restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with restaurant reviews
 */
const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Validate restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId, {
      attributes: ['restaurantId', 'name', 'cuisineType', 'address']
    });
    
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
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
          reviews: [],
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
    
    // Fetch reviews for these sessions
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
        restaurant,
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
      restaurantId: req.params.restaurantId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve restaurant reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get reviews for a specific session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with session reviews
 */
const getSessionReviews = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Validate session exists
    const session = await Session.findByPk(sessionId, {
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
        },
        {
          model: Restaurant,
          attributes: ['restaurantId', 'name']
        }
      ]
    });
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    
    // Fetch reviews for this session
    const reviews = await Review.findAll({
      where: {
        sessionId
      },
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['userId', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'Reviewed',
          attributes: ['userId', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        session,
        reviews
      }
    });
  } catch (error) {
    logger.error('Error getting session reviews:', { 
      sessionId: req.params.sessionId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve session reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get review statistics for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user review statistics
 */
const getUserReviewStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
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
    
    // Get all reviews received by user
    const reviews = await Review.findAll({
      where: {
        reviewedUserId: userId
      },
      attributes: ['score', 'createdAt', 'reviewedType']
    });
    
    // Calculate statistics
    const totalReviews = reviews.length;
    let totalScore = 0;
    let scoreDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    // Group by type
    const reviewsByType = {
      learner: [],
      native: [],
      restaurant: []
    };
    
    reviews.forEach(review => {
      totalScore += review.score;
      scoreDistribution[review.score]++;
      
      // Add to type group if valid
      if (reviewsByType[review.reviewedType]) {
        reviewsByType[review.reviewedType].push(review);
      }
    });
    
    // Calculate average score
    const averageScore = totalReviews > 0 ? (totalScore / totalReviews).toFixed(1) : 0;
    
    // Calculate percentage distribution
    const scorePercentages = {};
    Object.keys(scoreDistribution).forEach(score => {
      scorePercentages[score] = totalReviews > 0 
        ? ((scoreDistribution[score] / totalReviews) * 100).toFixed(1) 
        : 0;
    });
    
    // Calculate type-specific stats
    const typeStats = {};
    Object.keys(reviewsByType).forEach(type => {
      const typeReviews = reviewsByType[type];
      const typeTotal = typeReviews.length;
      const typeScore = typeReviews.reduce((sum, review) => sum + review.score, 0);
      
      typeStats[type] = {
        count: typeTotal,
        averageScore: typeTotal > 0 ? (typeScore / typeTotal).toFixed(1) : 0
      };
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        stats: {
          totalReviews,
          averageScore,
          scoreDistribution,
          scorePercentages,
          byType: typeStats
        }
      }
    });
  } catch (error) {
    logger.error('Error getting user review stats:', { 
      userId: req.params.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user review statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get review statistics for a restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with restaurant review statistics
 */
const getRestaurantReviewStats = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Validate restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId, {
      attributes: ['restaurantId', 'name', 'cuisineType', 'address']
    });
    
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
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
    
    // Get all reviews for these sessions
    const reviews = await Review.findAll({
      where: {
        sessionId: {
          [Op.in]: sessionIds
        }
      },
      attributes: ['score', 'createdAt', 'reviewedType']
    });
    
    // Calculate statistics
    const totalReviews = reviews.length;
    let totalScore = 0;
    let scoreDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    reviews.forEach(review => {
      totalScore += review.score;
      scoreDistribution[review.score]++;
    });
    
    // Calculate average score
    const averageScore = totalReviews > 0 ? (totalScore / totalReviews).toFixed(1) : 0;
    
    // Calculate percentage distribution
    const scorePercentages = {};
    Object.keys(scoreDistribution).forEach(score => {
      scorePercentages[score] = totalReviews > 0 
        ? ((scoreDistribution[score] / totalReviews) * 100).toFixed(1) 
        : 0;
    });
    
    // Get monthly review counts (last 6 months)
    const monthlyStats = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthReviews = reviews.filter(review => {
        const reviewDate = new Date(review.createdAt);
        return reviewDate >= month && reviewDate <= nextMonth;
      });
      
      const monthTotal = monthReviews.length;
      const monthScore = monthReviews.reduce((sum, review) => sum + review.score, 0);
      
      monthlyStats.unshift({
        month: month.toISOString().substring(0, 7), // YYYY-MM format
        count: monthTotal,
        averageScore: monthTotal > 0 ? (monthScore / monthTotal).toFixed(1) : 0
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        restaurant: {
          restaurantId: restaurant.restaurantId,
          name: restaurant.name,
          cuisineType: restaurant.cuisineType
        },
        stats: {
          totalReviews,
          averageScore,
          scoreDistribution,
          scorePercentages,
          monthly: monthlyStats
        }
      }
    });
  } catch (error) {
    logger.error('Error getting restaurant review stats:', { 
      restaurantId: req.params.restaurantId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve restaurant review statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getRestaurantReviews,
  getSessionReviews,
  getUserReviewStats,
  getRestaurantReviewStats
};