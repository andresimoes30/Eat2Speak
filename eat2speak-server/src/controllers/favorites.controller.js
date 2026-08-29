/**
 * Favorites Controller
 * 
 * Implements business logic for managing favorite restaurants, including:
 * - Retrieving a user's favorite restaurants
 * - Adding a restaurant to favorites
 * - Removing a restaurant from favorites
 * - Checking if a restaurant is in a user's favorites
 * 
 * @module controllers/favorites.controller
 */

const db = require('../models');
const { FavoriteRestaurant, Restaurant, User } = db;
const logger = require('../utils/logger');

/**
 * Get favorite restaurants for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with favorite restaurants list
 */
const getFavoriteRestaurants = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get favorite restaurants IDs for the user (without trying to join with Restaurant)
    const favorites = await FavoriteRestaurant.findAll({
      where: {
        UserId: userId
      },
      attributes: ['RestaurantId']
    });

    // Return just the restaurant IDs - frontend will need to make separate API calls
    // to fetch complete restaurant details including ratings
    return res.status(200).json({
      status: 'success',
      data: {
        favoriteRestaurantIds: favorites.map(fav => fav.RestaurantId)
      }
    });
  } catch (error) {
    logger.error('Error getting favorite restaurants:', { error: error.message, stack: error.stack });
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve favorite restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add a restaurant to user's favorites
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message
 */
const addFavoriteRestaurant = async (req, res) => {
  try {
    const userId = req.user.userId;
    const restaurantId = req.params.id; // Extract id parameter from route

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Check if already favorited
    const existingFavorite = await FavoriteRestaurant.findOne({
      where: {
        UserId: userId,
        RestaurantId: restaurantId
      }
    });

    if (existingFavorite) {
      return res.status(400).json({
        status: 'error',
        message: 'Restaurant already in favorites'
      });
    }

    // Add to favorites
    await FavoriteRestaurant.create({
      UserId: userId,
      RestaurantId: restaurantId
    });

    logger.info('Restaurant added to favorites', {
      userId,
      restaurantId
    });

    return res.status(201).json({
      status: 'success',
      message: 'Restaurant added to favorites'
    });
  } catch (error) {
    logger.error('Error adding favorite restaurant:', { error: error.message, stack: error.stack });
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add restaurant to favorites',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Remove a restaurant from user's favorites
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message
 */
const removeFavoriteRestaurant = async (req, res) => {
  try {
    const userId = req.user.userId;
    const restaurantId = req.params.id; // Extract id parameter from route

    // Check if favorited
    const favorite = await FavoriteRestaurant.findOne({
      where: {
        UserId: userId,
        RestaurantId: restaurantId
      }
    });

    if (!favorite) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found in favorites'
      });
    }

    // Remove from favorites
    await favorite.destroy();

    logger.info('Restaurant removed from favorites', {
      userId,
      restaurantId
    });

    return res.status(200).json({
      status: 'success',
      message: 'Restaurant removed from favorites'
    });
  } catch (error) {
    logger.error('Error removing favorite restaurant:', { error: error.message, stack: error.stack });
    return res.status(500).json({
      status: 'error',
      message: 'Failed to remove restaurant from favorites',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Check if a restaurant is in user's favorites
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with favorite status
 */
const checkFavoriteStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const restaurantId = req.params.id; // Extract id parameter from route

    // Check if favorited
    const favorite = await FavoriteRestaurant.findOne({
      where: {
        UserId: userId,
        RestaurantId: restaurantId
      }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        isFavorite: !!favorite
      }
    });
  } catch (error) {
    logger.error('Error checking favorite status:', { error: error.message, stack: error.stack });
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check favorite status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getFavoriteRestaurants,
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
  checkFavoriteStatus
};