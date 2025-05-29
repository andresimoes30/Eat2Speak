import axios from 'axios';

const api = axios.create({
  baseURL: 'https://eat2speak.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT nas requisições autenticadas
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Login function
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data;
    
    // Set the token for future authenticated requests
    if (token) {
      setAuthToken(token);
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

// Register function
export const register = async (userData) => {
  try {
    // Create a simplified data object with only required fields
    const dataToSend = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      userTypes: userData.userType // Changed from userType to userTypes as expected by backend
    };
    
    // Add type-specific fields only if they exist
    if (userData.nationality) dataToSend.nationality = userData.nationality;
    if (userData.gender) dataToSend.gender = userData.gender;
    
    // For native speakers
    if (userData.languageName) dataToSend.languageName = userData.languageName;
    
    // For restaurants - FIXED: now using restaurantName from userData directly
    if (userData.restaurantName) dataToSend.restaurantName = userData.restaurantName;
    if (userData.cuisineType) dataToSend.cuisineType = userData.cuisineType;
    
    // Log the data being sent for debugging
    console.log('Sending registration data:', JSON.stringify(dataToSend));
    
    // Send to the correct endpoint
    const response = await api.post('/user/register', dataToSend);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    
    // Make error handling more robust
    if (error.response?.data) {
      throw error.response.data;
    } else if (error.response) {
      throw { message: `Error ${error.response.status}: ${error.response.statusText}` };
    } else {
      throw { message: error.message || 'Network error' };
    }
  }
};

export default api;