import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Networking utility to handle different environments and connection methods
 * Solves issues with localhost not being the same in different environments
 */

// Connection configurations for different environments
const CONNECTION_CONFIGS = {
  // Web browser environment
  web: {
    url: 'http://localhost:3000',
    proxyPath: '/api',
  },
  // Android emulator needs special IP for localhost
  android: {
    url: 'http://10.0.2.2:3000', // Android emulator localhost
    fallbacks: ['http://localhost:3000']
  },
  // iOS simulator and different device options
  ios: {
    url: 'http://localhost:3000', // iOS simulator
    fallbacks: ['http://127.0.0.1:3000']
  },
  // Expo environment
  expo: {
    url: 'http://localhost:3000',
    fallbacks: ['http://127.0.0.1:3000', 'http://10.0.2.2:3000']
  }
};

// Helper function to determine the appropriate base URL for the current environment
const getBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'localhost') {
      return CONNECTION_CONFIGS.web.url;
    }
    // If using a proxy in development
    return '';  // Empty baseURL when using proxy
  }
  
  // React Native environment detection
  if (Platform) {
    if (Platform.OS === 'android') {
      return CONNECTION_CONFIGS.android.url;
    } else if (Platform.OS === 'ios') {
      return CONNECTION_CONFIGS.ios.url;
    }
  }
  
  // If running in Expo environment
  if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Default fallback
  return CONNECTION_CONFIGS.web.url;
};

// Create API instance with optimal settings for connecting to the server
const api = axios.create({
  baseURL: getBaseUrl(),
  // Longer timeout for development
  timeout: 15000,
  // CORS setting - disabled for optimal connectivity based on diagnostic results
  withCredentials: false,
  // Use a proxy in browser development if needed
  proxy: false,
  // Standard headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Log API configuration
console.log(`API configured with baseURL: ${api.defaults.baseURL}, CORS disabled`);


// Add request interceptor
api.interceptors.request.use(
  config => {
    // Log request for debugging
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    console.log(`Base URL: ${config.baseURL}`);
    
    // For development/testing, add some retry logic
    if (!config.retryCount) {
      config.retryCount = 0;
    }
    
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with enhanced error handling and retry logic
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Network errors with advanced retry logic and diagnostics
    if (error.message === 'Network Error') {
      console.error('Network Error - Server may not be running or network connectivity issue');
      console.error(`Attempted to connect to: ${originalRequest.baseURL}${originalRequest.url}`);
      
      // Enhanced error diagnostics
      const diagnosticInfo = {
        url: `${originalRequest.baseURL || ''}${originalRequest.url || ''}`,
        method: originalRequest.method,
        timestamp: new Date().toISOString(),
        headers: originalRequest.headers,
        environment: Platform ? Platform.OS : 'unknown'
      };
      
      console.log('Connection diagnostic info:', diagnosticInfo);
      
      // Implement enhanced retry logic for Network Errors with exponential backoff
      if (originalRequest.retryCount < 3) {
        const retryDelay = Math.pow(2, originalRequest.retryCount) * 1000; // Exponential backoff
        console.log(`Retrying request (${originalRequest.retryCount + 1}/3) after ${retryDelay}ms...`);
        
        // If this is the first retry, maybe try a fallback URL
        if (originalRequest.retryCount === 0) {
          // Try a different baseURL based on the environment
          const currentEnv = Platform ? Platform.OS : 'web';
          const fallbacks = CONNECTION_CONFIGS[currentEnv]?.fallbacks || [];
          
          if (fallbacks.length > 0) {
            const fallbackURL = fallbacks[0];
            console.log(`Trying fallback URL: ${fallbackURL}`);
            originalRequest.baseURL = fallbackURL;
          }
        }
        
        // Wait before retrying with exponential backoff
        return new Promise(resolve => {
          setTimeout(() => {
            originalRequest.retryCount += 1;
            resolve(api(originalRequest));
          }, retryDelay);
        });
      }
      
      // Check if this is a network connectivity issue
      if (error.message.includes('Network Error')) {
        console.log(`Network error detected when connecting to ${originalRequest.url}`);
      }
      
      return Promise.reject({
        message: 'Cannot connect to server. Please check your network connectivity and ensure the server is running.',
        code: 'NETWORK_ERROR',
        originalError: error,
        url: diagnosticInfo.url,
        diagnostics: diagnosticInfo,
        suggestion: originalRequest.withCredentials ? 
          "Try disabling CORS by calling configureCorsMode(false) or use a CORS proxy" : 
          "If running in an emulator, try using 10.0.2.2 instead of localhost"
      });
    }
    
    // Handle session expiration or unauthorized
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.warn('Authentication error, redirecting to login');
      // Redirect to login or handle authentication error
    }
    
    return Promise.reject(error);
  }
);

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
    const response = await api.post('/api/auth/login', { email, password });
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

// Register function with enhanced error handling
export const register = async (userData) => {
  try {
    // Create a data object with all required fields based on user type
    const dataToSend = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      userTypes: userData.userTypes || userData.userType // Support both formats for backward compatibility
    };
    
    // Add type-specific fields only if they exist
    if (userData.nationality) dataToSend.nationality = userData.nationality;
    if (userData.gender) dataToSend.gender = userData.gender;
    
    // For native speakers
    if (userData.languageName) dataToSend.languageName = userData.languageName;
    
    // For restaurants
    if (userData.restaurantName) dataToSend.restaurantName = userData.restaurantName;
    if (userData.cuisineType) dataToSend.cuisineType = userData.cuisineType;
    
    // Log the data being sent for debugging
    console.log('Sending registration data:', JSON.stringify(dataToSend));
    
    // Send directly to the auth endpoint
    const response = await api.post('/api/auth/register', dataToSend);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Enhanced error handling with better diagnostics
    if (error.code === 'SERVER_UNAVAILABLE') {
      throw error;
    } else if (error.response?.data) {
      throw error.response.data;
    } else if (error.response) {
      throw { message: `Error ${error.response.status}: ${error.response.statusText}` };
    } else if (error.message && error.message.includes('Network Error')) {
      throw { 
        message: 'Cannot connect to server. Please start the server with: cd server && node start.js',
        code: 'NETWORK_ERROR'
      };
    } else {
      throw { message: error.message || 'An unknown error occurred', code: 'UNKNOWN_ERROR' };
    }
  }
};

// Test functions to verify server connectivity
export const testHealth = async () => {
  try {
    const response = await api.get('/api/health');
    console.log('Health check successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export const testEndpoint = async () => {
  try {
    const response = await api.get('/api/test/test');
    console.log('Test endpoint successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Test endpoint failed:', error);
    throw error;
  }
};

export const testEcho = async (data) => {
  try {
    const response = await api.post('/api/test/echo', data);
    console.log('Echo endpoint successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Echo endpoint failed:', error);
    throw error;
  }
};

// Test register function - using the proper API endpoint
export const testRegister = async (userData) => {
  // Use the main register function to avoid code duplication
  // This ensures consistency and better maintainability
  return register(userData);
};

// Test hello endpoint
export const testHello = async () => {
  try {
    const response = await api.get('/hello');
    console.log('Hello endpoint response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Hello endpoint error:', error);
    throw error;
  }
};

// Test auth-test endpoint
export const testAuthDirect = async () => {
  try {
    const response = await api.get('/auth-test');
    console.log('Auth test endpoint response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Auth test endpoint error:', error);
    throw error;
  }
};

// Test routes-info endpoint
export const testRoutesInfo = async () => {
  try {
    const response = await api.get('/routes-info');
    console.log('Routes info endpoint response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Routes info endpoint error:', error);
    throw error;
  }
};

export default api;