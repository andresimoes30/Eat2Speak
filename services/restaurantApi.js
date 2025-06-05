import api from './api';

// Type definitions
interface RestaurantFilters {
  search?: string;
  city?: string;
  cuisine?: string;
  language?: string;
}

interface RestaurantOwner {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface ApiRestaurant {
  restaurantId: number;
  name: string;
  cuisineType: string;
  address: string;
  commissionPercent: string;
  createdAt: string;
  owner: RestaurantOwner;
}

interface ApiResponse {
  status: string;
  data: {
    restaurants: ApiRestaurant[];
    pagination?: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  languages: string[];
  available: boolean;
  description: string;
  imageUrl: string;
}

/**
 * Fetches all restaurants with optional filtering
 * @param {RestaurantFilters} filters - Optional filters for restaurants (search, cuisine, etc.)
 * @returns {Promise<Array>} - Array of restaurant objects
 */
export const getRestaurants = async (filters: RestaurantFilters = {}): Promise<Restaurant[]> => {
  try {
    // Use the real API endpoint provided by the user
    const response = await fetch('https://eat2speak.com/api/restaurants');
    const data: ApiResponse = await response.json();
    
    if (data.status !== 'success' || !data.data.restaurants) {
      throw new Error('Failed to fetch restaurants data');
    }
    
    // Transform the API response to match our expected format
    const restaurants = data.data.restaurants.map(restaurant => ({
      id: restaurant.restaurantId,
      name: restaurant.name,
      cuisine: restaurant.cuisineType,
      location: restaurant.address,
      rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3 and 5
      languages: getRandomLanguages(), // We'll generate these since API doesn't provide them
      available: true, // Assume all restaurants are available
      description: `Authentic ${restaurant.cuisineType} cuisine in ${restaurant.address.split(',')[0]}`,
      imageUrl: getRestaurantImage(restaurant.restaurantId)
    }));
    
    // Apply filters
    return filterRestaurants(restaurants, filters);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

/**
 * Gets detailed information about a single restaurant
 * @param {number} restaurantId - ID of the restaurant to fetch
 * @returns {Promise<Object>} - Restaurant object with detailed information
 */
export const getRestaurantDetails = async (restaurantId: number): Promise<Restaurant> => {
  try {
    // In a real app, we would have a specific endpoint for restaurant details
    // For now, we'll fetch all restaurants and find the one we want
    const restaurants = await getRestaurants();
    const restaurant = restaurants.find(r => r.id === restaurantId);
    
    if (!restaurant) {
      throw new Error(`Restaurant with ID ${restaurantId} not found`);
    }
    
    return restaurant;
  } catch (error) {
    console.error(`Error fetching restaurant details for ID ${restaurantId}:`, error);
    throw error;
  }
};

/**
 * Provides images for restaurants
 * @param {number} restaurantId - ID of the restaurant
 * @returns {string} - URL to restaurant image
 */
export const getRestaurantImage = (restaurantId: number): string => {
  // Real restaurant images from Unsplash
  const restaurantImages: Record<number, string> = {
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
 * @param {Restaurant[]} restaurants - List of restaurants to filter
 * @param {RestaurantFilters} filters - Filter criteria
 * @returns {Restaurant[]} - Filtered restaurants
 */
const filterRestaurants = (restaurants: Restaurant[], filters: RestaurantFilters): Restaurant[] => {
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
 * @returns {string[]} - Array of languages
 */
const getRandomLanguages = (): string[] => {
  const allLanguages = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão'];
  const numLanguages = Math.floor(Math.random() * 3) + 1; // 1 to 3 languages
  
  const languages: string[] = [];
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