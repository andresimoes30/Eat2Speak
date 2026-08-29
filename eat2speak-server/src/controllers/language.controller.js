/**
 * Language Controller
 * 
 * Implements business logic for language management, including:
 * - Retrieving available languages
 * - Managing user language preferences
 * - Calculating language statistics
 * - Finding language speakers
 * 
 * @module controllers/language.controller
 */

const db = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Import Language and UserLanguage models
// We assume they exist based on the DB schema image
const Language = db.Language || { findAll: () => Promise.resolve([]) };
const UserLanguage = db.UserLanguage;
const User = db.User;

/**
 * Get list of all available languages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with languages list
 */
const getLanguages = async (req, res) => {
  try {
    // If we have a Language model, use it
    let languages = [];
    
    try {
      // Try to use the Language model
      languages = await Language.findAll({
        order: [['languageName', 'ASC']]
      });
    } catch (error) {
      // If Language model doesn't exist, get distinct languages from UserLanguage
      const distinctLanguages = await UserLanguage.findAll({
        attributes: [
          [db.sequelize.fn('DISTINCT', db.sequelize.col('languageName')), 'languageName']
        ],
        order: [['languageName', 'ASC']]
      });
      
      languages = distinctLanguages.map(lang => ({
        languageId: null, // We don't have IDs in this case
        languageName: lang.languageName
      }));
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        languages
      }
    });
  } catch (error) {
    logger.error('Error getting languages:', { error: error.message, stack: error.stack });
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve languages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get language details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with language details
 */
const getLanguageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find language by ID if Language model exists
    let language = null;
    
    try {
      language = await Language.findByPk(id);
    } catch (error) {
      // If Language model doesn't exist, find by languageId in UserLanguage
      const userLanguage = await UserLanguage.findOne({
        where: { languageId: id }
      });
      
      if (userLanguage) {
        language = {
          languageId: userLanguage.languageId,
          languageName: userLanguage.languageName
        };
      }
    }
    
    if (!language) {
      return res.status(404).json({
        status: 'error',
        message: 'Language not found'
      });
    }
    
    // Get count of users for this language
    const userCount = await UserLanguage.count({
      where: {
        [Op.or]: [
          { languageId: id },
          { languageName: language.languageName }
        ]
      }
    });
    
    // Get count of native speakers
    const nativeSpeakersCount = await UserLanguage.count({
      where: {
        [Op.or]: [
          { languageId: id, proficiencyLevel: 'Nativo' },
          { languageName: language.languageName, proficiencyLevel: 'Nativo' }
        ]
      }
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        language: {
          ...language,
          userCount,
          nativeSpeakersCount
        }
      }
    });
  } catch (error) {
    logger.error('Error getting language by ID:', { 
      id: req.params.id,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve language details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get languages for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user languages
 */
const getUserLanguages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user exists
    const user = await User.findByPk(userId, {
      attributes: ['userId', 'firstName', 'lastName']
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get user languages
    const userLanguages = await UserLanguage.findAll({
      where: { userId },
      order: [
        ['proficiencyLevel', 'DESC'],
        ['languageName', 'ASC']
      ]
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        languages: userLanguages
      }
    });
  } catch (error) {
    logger.error('Error getting user languages:', { 
      userId: req.params.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user languages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get languages for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user languages
 */
const getMyLanguages = async (req, res) => {
  try {
    // Use userId from authenticated user
    const userId = req.user.userId;
    
    // Get user languages
    const userLanguages = await UserLanguage.findAll({
      where: { userId },
      order: [
        ['proficiencyLevel', 'DESC'],
        ['languageName', 'ASC']
      ]
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        languages: userLanguages
      }
    });
  } catch (error) {
    logger.error('Error getting current user languages:', { 
      userId: req.user.userId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve languages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add a language to the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created user language
 */
const addUserLanguage = async (req, res) => {
  try {
    const { languageName, proficiencyLevel } = req.body;
    
    // Validate required fields
    if (!languageName || !proficiencyLevel) {
      return res.status(400).json({
        status: 'error',
        message: 'Language name and proficiency level are required'
      });
    }
    
    // Validate proficiency level
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'];
    if (!validLevels.includes(proficiencyLevel)) {
      return res.status(400).json({
        status: 'error',
        message: `Proficiency level must be one of: ${validLevels.join(', ')}`
      });
    }
    
    // Check if user already has this language
    const existingLanguage = await UserLanguage.findOne({
      where: {
        userId: req.user.userId,
        languageName
      }
    });
    
    if (existingLanguage) {
      return res.status(400).json({
        status: 'error',
        message: 'User already has this language',
        data: {
          userLanguage: existingLanguage
        }
      });
    }
    
    // Create new user language
    const userLanguage = await UserLanguage.create({
      userId: req.user.userId,
      languageName,
      proficiencyLevel
    });
    
    logger.info('Language added to user successfully', { 
      userId: req.user.userId,
      languageName,
      proficiencyLevel
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Language added successfully',
      data: {
        userLanguage
      }
    });
  } catch (error) {
    logger.error('Error adding user language:', { 
      userId: req.user.userId,
      error: error.message, 
      stack: error.stack
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add language',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user's language proficiency
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user language
 */
const updateUserLanguage = async (req, res) => {
  try {
    const { languageId } = req.params;
    const { proficiencyLevel } = req.body;
    
    // Validate proficiency level
    if (!proficiencyLevel) {
      return res.status(400).json({
        status: 'error',
        message: 'Proficiency level is required'
      });
    }
    
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'];
    if (!validLevels.includes(proficiencyLevel)) {
      return res.status(400).json({
        status: 'error',
        message: `Proficiency level must be one of: ${validLevels.join(', ')}`
      });
    }
    
    // Find user language
    const userLanguage = await UserLanguage.findOne({
      where: {
        userLanguageId: languageId,
        userId: req.user.userId
      }
    });
    
    if (!userLanguage) {
      return res.status(404).json({
        status: 'error',
        message: 'User language not found'
      });
    }
    
    // Update proficiency level
    userLanguage.proficiencyLevel = proficiencyLevel;
    await userLanguage.save();
    
    logger.info('User language updated successfully', { 
      userId: req.user.userId,
      languageId,
      proficiencyLevel
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Language proficiency updated successfully',
      data: {
        userLanguage
      }
    });
  } catch (error) {
    logger.error('Error updating user language:', { 
      userId: req.user.userId,
      languageId: req.params.languageId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update language proficiency',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Remove a language from the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message
 */
const removeUserLanguage = async (req, res) => {
  try {
    const { languageId } = req.params;
    
    // Find user language
    const userLanguage = await UserLanguage.findOne({
      where: {
        userLanguageId: languageId,
        userId: req.user.userId
      }
    });
    
    if (!userLanguage) {
      return res.status(404).json({
        status: 'error',
        message: 'User language not found'
      });
    }
    
    // Delete user language
    await userLanguage.destroy();
    
    logger.info('User language removed successfully', { 
      userId: req.user.userId,
      languageId
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Language removed successfully'
    });
  } catch (error) {
    logger.error('Error removing user language:', { 
      userId: req.user.userId,
      languageId: req.params.languageId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to remove language',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get language statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with language statistics
 */
const getLanguageStats = async (req, res) => {
  try {
    // Get counts by language
    const languageCounts = await UserLanguage.findAll({
      attributes: [
        'languageName',
        [db.sequelize.fn('COUNT', db.sequelize.col('userId')), 'userCount']
      ],
      group: ['languageName'],
      order: [[db.sequelize.literal('userCount'), 'DESC']]
    });
    
    // Get counts by proficiency level
    const proficiencyCounts = await UserLanguage.findAll({
      attributes: [
        'proficiencyLevel',
        [db.sequelize.fn('COUNT', db.sequelize.col('userId')), 'userCount']
      ],
      group: ['proficiencyLevel'],
      order: [[db.sequelize.literal('userCount'), 'DESC']]
    });
    
    // Get native speaker counts by language
    const nativeSpeakerCounts = await UserLanguage.findAll({
      attributes: [
        'languageName',
        [db.sequelize.fn('COUNT', db.sequelize.col('userId')), 'nativeCount']
      ],
      where: {
        proficiencyLevel: 'Nativo'
      },
      group: ['languageName'],
      order: [[db.sequelize.literal('nativeCount'), 'DESC']]
    });
    
    // Total user count
    const totalUsers = await User.count();
    
    // Total language entries
    const totalEntries = await UserLanguage.count();
    
    // Average languages per user
    const avgLanguagesPerUser = totalUsers > 0 ? (totalEntries / totalUsers).toFixed(2) : 0;
    
    return res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalLanguageEntries: totalEntries,
        averageLanguagesPerUser: avgLanguagesPerUser,
        mostPopularLanguages: languageCounts,
        proficiencyDistribution: proficiencyCounts,
        nativeSpeakers: nativeSpeakerCounts
      }
    });
  } catch (error) {
    logger.error('Error getting language statistics:', { 
      error: error.message, 
      stack: error.stack
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve language statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get native speakers by language
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with native speakers
 */
const getNativeSpeakers = async (req, res) => {
  try {
    const { page = 1, limit = 10, language } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = {
      proficiencyLevel: 'Nativo'
    };
    
    if (language) {
      whereConditions.languageName = language;
    }
    
    // Find native speakers
    const { count, rows } = await UserLanguage.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['userId', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['languageName', 'ASC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      data: {
        nativeSpeakers: rows,
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
    logger.error('Error getting native speakers:', { 
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve native speakers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get users who speak a specific language
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with language speakers
 */
const getLanguageSpeakers = async (req, res) => {
  try {
    const { languageId } = req.params;
    const { page = 1, limit = 10, minLevel } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Get language details
    let languageName;
    
    try {
      // Try to use Language model
      const language = await Language.findByPk(languageId);
      if (language) {
        languageName = language.languageName;
      }
    } catch (error) {
      // If Language model doesn't exist, get name from UserLanguage
      const userLanguage = await UserLanguage.findOne({
        where: { languageId }
      });
      
      if (userLanguage) {
        languageName = userLanguage.languageName;
      }
    }
    
    if (!languageName) {
      return res.status(404).json({
        status: 'error',
        message: 'Language not found'
      });
    }
    
    // Build where conditions
    const whereConditions = {
      languageName
    };
    
    // Filter by minimum proficiency level
    if (minLevel) {
      const proficiencyLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'];
      const minLevelIndex = proficiencyLevels.indexOf(minLevel);
      
      if (minLevelIndex !== -1) {
        const allowedLevels = proficiencyLevels.slice(minLevelIndex);
        whereConditions.proficiencyLevel = {
          [Op.in]: allowedLevels
        };
      }
    }
    
    // Find language speakers
    const { count, rows } = await UserLanguage.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['userId', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['proficiencyLevel', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      data: {
        language: {
          languageId,
          languageName
        },
        speakers: rows,
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
    logger.error('Error getting language speakers:', { 
      languageId: req.params.languageId,
      error: error.message
    });
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve language speakers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getLanguages,
  getLanguageById,
  getUserLanguages,
  getMyLanguages,
  addUserLanguage,
  updateUserLanguage,
  removeUserLanguage,
  getLanguageStats,
  getNativeSpeakers,
  getLanguageSpeakers
};