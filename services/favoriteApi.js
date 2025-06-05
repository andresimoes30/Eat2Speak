import api from './api';
import * as restaurantApi from './restaurantApi';

/**
 * Fetches all favorite restaurants for the authenticated user
 * Implements a two-step process:
 * 1. Fetch favorite restaurant IDs from the favorites endpoint
 * 2. For each ID, fetch complete restaurant details from the restaurant API
 * @returns {Promise<Array>} - Array of favorite restaurant objects with complete details
 */
export const getFavoriteRestaurants = async () => {
  try {
    // Step 1: Get favorite restaurant IDs from the favorites endpoint
    const response = await api.get('/api/restaurants/favorites');
    const favoriteIds = response.data.data.favoriteRestaurantIds;
    
    // Step 2: Fetch complete details for each restaurant ID
    const favoriteRestaurants = await Promise.all(
      favoriteIds.map(async (id) => {
        try {
          // Get complete restaurant details including rating
          const restaurantDetails = await restaurantApi.getRestaurantDetails(id);
          return restaurantDetails;
        } catch (error) {
          console.error(`Error fetching details for restaurant ID ${id}:`, error);
          // Return a minimal object if we can't get details, to avoid breaking the UI
          return { id, name: `Restaurant ${id}`, isFavorite: true };
        }
      })
    );
    
    return favoriteRestaurants;
  } catch (error) {
    console.error('Error fetching favorite restaurants:', error);
    throw error.response?.data || { message: 'Error fetching favorite restaurants' };
  }
};

/**
 * Checks if a restaurant is in the user's favorites
 * @param {number} restaurantId - The ID of the restaurant to check
 * @returns {Promise<boolean>} - True if restaurant is a favorite, false otherwise
 */
export const checkFavoriteStatus = async (restaurantId) => {
  try {
    const response = await api.get(`/api/restaurants/${restaurantId}/favorite`);
    return response.data.data.isFavorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error.response?.data || { message: 'Error checking favorite status' };
  }
};

/**
 * Adds a restaurant to the user's favorites
 * @param {number} restaurantId - The ID of the restaurant to add to favorites
 * @returns {Promise<Object>} - Success message
 */
export const addToFavorites = async (restaurantId) => {
  try {
    const response = await api.post(`/api/restaurants/${restaurantId}/favorite`);
    return response.data;
  } catch (error) {
    console.error('Error adding restaurant to favorites:', error);
    throw error.response?.data || { message: 'Error adding restaurant to favorites' };
  }
};

/**
 * Removes a restaurant from the user's favorites
 * @param {number} restaurantId - The ID of the restaurant to remove from favorites
 * @returns {Promise<Object>} - Success message
 */
export const removeFromFavorites = async (restaurantId) => {
  try {
    const response = await api.delete(`/api/restaurants/${restaurantId}/favorite`);
    return response.data;
  } catch (error) {
    console.error('Error removing restaurant from favorites:', error);
    throw error.response?.data || { message: 'Error removing restaurant from favorites' };
  }
};

export default {
  getFavoriteRestaurants,
  checkFavoriteStatus,
  addToFavorites,
  removeFromFavorites
};