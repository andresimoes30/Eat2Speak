import api from './api';

/**
 * Fetches all favorite restaurants for the authenticated user
 * @returns {Promise<Array>} - Array of favorite restaurant objects
 */
export const getFavoriteRestaurants = async () => {
  try {
    const response = await api.get('/api/restaurants/favorites');
    return response.data.data.favorites;
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