import api from './api';

/**
 * Get the current user's profile information
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/user/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

/**
 * Update the current user's profile information
 * @param {Object} profileData - Data to update in the user profile
 * @returns {Promise<Object>} Updated user profile data
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/api/user/me', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

/**
 * Update the user's availability status
 * @param {boolean} availability - Whether the user is available (true) or not (false)
 * @returns {Promise<Object>} Updated user profile data
 */
export const updateUserAvailability = async (availability) => {
  try {
    const response = await api.put('/api/user/me', { availability });
    return response.data;
  } catch (error) {
    console.error('Error updating user availability:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};