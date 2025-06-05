import api from './api';

/**
 * Fetches all restaurants with optional filtering
 * @param {Object} filters - Optional filters for restaurants (search, cuisine, etc.)
 * @returns {Promise<Array>} - Array of restaurant objects
 */
export const getRestaurants = async (filters = {}) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.cuisine) queryParams.append('cuisine', filters.cuisine);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.language) queryParams.append('language', filters.language);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await api.get(`/api/restaurants${queryString}`);
    return response.data.data.restaurants;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error.response?.data || { message: 'Error fetching restaurants' };
  }
};

/**
 * Gets detailed information about a single restaurant
 * @param {number} restaurantId - ID of the restaurant to fetch
 * @returns {Promise<Object>} - Restaurant object with detailed information
 */
export const getRestaurantDetails = async (restaurantId) => {
  try {
    const response = await api.get(`/api/restaurants/${restaurantId}`);
    return response.data.data.restaurant;
  } catch (error) {
    console.error(`Error fetching restaurant details for ID ${restaurantId}:`, error);
    throw error.response?.data || { message: 'Error fetching restaurant details' };
  }
};

// For development/testing, you can use these real restaurant images
export const getRestaurantImage = (restaurantId, useRealImages = true) => {
  if (!useRealImages) {
    return 'https://via.placeholder.com/300x200';
  }
  
  // Real restaurant images from Unsplash
  const restaurantImages = {
    1: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
    2: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80',
    3: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80',
    4: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80',
    5: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
    6: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=500&q=80',
    7: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
    8: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80',
    9: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=500&q=80',
    10: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=500&q=80',
  };
  
  // Return image for specific restaurant ID or a random one if not found
  return restaurantImages[restaurantId] || 
    restaurantImages[Math.floor(Math.random() * Object.keys(restaurantImages).length) + 1];
};

export default {
  getRestaurants,
  getRestaurantDetails,
  getRestaurantImage
};