import api from './api';

/**
 * Fetches all restaurants with optional filtering
 * @param {Object} filters - Optional filters for restaurants (search, cuisine, etc.)
 * @returns {Promise<Array>} - Array of restaurant objects
 */
export const getRestaurants = async (filters = {}) => {
  try {
    // Use the configured API client
    const response = await api.get('/api/restaurants');
    
    if (!response.data || response.data.status !== 'success' || !response.data.data.restaurants) {
      throw new Error('Failed to fetch restaurants data');
    }
    
    // Transform the API response to match our expected format
    const restaurants = response.data.data.restaurants.map(restaurant => ({
      id: restaurant.restaurantId,
      name: restaurant.name,
      cuisine: restaurant.cuisineType,
      location: restaurant.address,
      rating: restaurant.rating || (Math.random() * 2 + 3).toFixed(1), // Use rating if available or generate random
      languages: restaurant.languages || getRandomLanguages(), // Use existing or generate
      available: true, // Assume all restaurants are available
      description: restaurant.description || `Authentic ${restaurant.cuisineType} cuisine in ${restaurant.address.split(',')[0]}`,
      imageUrl: getRestaurantImage(restaurant.restaurantId)
    }));
    
    // Apply filters
    return filterRestaurants(restaurants, filters);
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
    // Use the configured API client with specific endpoint
    const response = await api.get(`/api/restaurants/${restaurantId}`);
    
    if (!response.data || response.data.status !== 'success') {
      throw new Error(`Restaurant with ID ${restaurantId} not found`);
    }
    
    const restaurant = response.data.data.restaurant;
    
    // Transform the response to match our expected format
    return {
      id: restaurant.restaurantId,
      name: restaurant.name,
      cuisine: restaurant.cuisineType,
      location: restaurant.address,
      rating: restaurant.rating || (Math.random() * 2 + 3).toFixed(1),
      languages: restaurant.languages || getRandomLanguages(),
      available: true,
      description: restaurant.description || `Authentic ${restaurant.cuisineType} cuisine in ${restaurant.address.split(',')[0]}`,
      imageUrl: getRestaurantImage(restaurant.restaurantId)
    };
  } catch (error) {
    console.error(`Error fetching restaurant details for ID ${restaurantId}:`, error);
    throw error.response?.data || { message: `Error fetching restaurant details for ID ${restaurantId}` };
  }
};

/**
 * Provides images for restaurants
 * @param {number} restaurantId - ID of the restaurant
 * @returns {string} - URL to restaurant image
 */
export const getRestaurantImage = (restaurantId) => {
  // Real restaurant images from Unsplash
  const restaurantImages = {
    1: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=500&q=80', // Francesinha Braga
    2: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80', // Fogo em Brasa
    3: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80', // Mac Daniels
    4: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80', // Hell's Kitchen
    5: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80', // Sei lá mano
  };
  
  // Return image for specific restaurant ID or a default one if not found
  return restaurantImages[restaurantId] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80';
};

/**
 * Filter restaurants based on search criteria
 * @param {Array} restaurants - List of restaurants to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered restaurants
 */
const filterRestaurants = (restaurants, filters) => {
  return restaurants.filter(restaurant => {
    // Apply search filter
    if (filters.search && !restaurant.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Apply cuisine filter
    if (filters.cuisine && filters.cuisine !== 'all' && restaurant.cuisine !== filters.cuisine) {
      return false;
    }
    
    // Apply city filter
    if (filters.city && filters.city !== 'all') {
      const cityMatch = restaurant.location.toLowerCase().includes(filters.city.toLowerCase());
      if (!cityMatch) return false;
    }
    
    // Apply language filter
    if (filters.language && filters.language !== 'all') {
      const languageMatch = restaurant.languages.includes(filters.language);
      if (!languageMatch) return false;
    }
    
    return true;
  });
};

/**
 * Helper function to generate random languages for restaurants
 * @returns {Array} - Array of languages
 */
const getRandomLanguages = () => {
  const allLanguages = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão'];
  const numLanguages = Math.floor(Math.random() * 3) + 1; // 1 to 3 languages
  
  const languages = [];
  for (let i = 0; i < numLanguages; i++) {
    const randomIndex = Math.floor(Math.random() * allLanguages.length);
    const language = allLanguages[randomIndex];
    
    if (!languages.includes(language)) {
      languages.push(language);
    }
  }
  
  return languages;
};

export default {
  getRestaurants,
  getRestaurantDetails,
  getRestaurantImage
};