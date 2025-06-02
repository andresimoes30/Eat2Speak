import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Networking utility to handle different environments and connection methods
 * Solves issues with localhost not being the same in different environments
 * 
 * PHYSICAL DEVICE CONFIGURATION:
 * When testing on a physical device, you need to use your computer's actual
 * IP address on your local network instead of localhost/127.0.0.1.
 * 
 * CONFIGURAÇÃO PARA DISPOSITIVOS FÍSICOS:
 * Ao testar em um dispositivo físico, você precisa usar o endereço IP real
 * do seu computador na rede local em vez de localhost/127.0.0.1.
 * 
 * 1. Find your computer's IP address:
 *    - Windows: Run 'ipconfig' in CMD and look for IPv4 Address
 *    - Mac/Linux: Run 'ifconfig' in terminal and look for inet
 * 
 * 2. Replace YOUR_COMPUTER_IP in the physicalDevice config below
 *    For example: http://192.168.1.100:3000
 */

// Connection configurations for different environments
const CONNECTION_CONFIGS = {
  // Production environment
  production: {
    url: 'https://eat2speak.com',
    proxyPath: '/api',
  },
  // Web browser environment (development)
  web: {
    url: 'https://eat2speak.com', // Updated to production URL
    proxyPath: '/api',
  },
  // Android emulator configuration
  android: {
    url: 'https://eat2speak.com', // Only using production URL
  },
  // iOS simulator configuration
  ios: {
    url: 'https://eat2speak.com', // Only using production URL
  },
  // Physical device configuration
  physicalDevice: {
    url: 'https://eat2speak.com', // Only using production URL
  },
  // Expo environment 
  expo: {
    url: 'https://eat2speak.com', // Only using production URL
  }
};

// Helper to check if we're running on a physical device
const isPhysicalDevice = () => {
  // This is a simplified check. For a more accurate detection,
  // you might need to use device-specific APIs
  if (Platform && typeof Platform === 'object') {
    if (Platform.OS === 'ios') {
      // On iOS, we can use the device model to check, with proper null checks for Hermes engine
      const model = Platform.constants?.model;
      return typeof model === 'string' && !model.includes('Simulator');
    } else if (Platform.OS === 'android') {
      // On Android, we can check for emulator properties, with proper null checks
      const brand = Platform.constants?.Brand;
      const deviceModel = Platform.constants?.Model;
      return (typeof brand !== 'string' || !brand.includes('google')) &&
             (typeof deviceModel !== 'string' || !deviceModel.includes('sdk'));
    }
  }
  
  // If we can't determine, assume it might be a physical device to be safe
  return true;
};

// Helper function to determine the appropriate base URL for the current environment
const getBaseUrl = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.hostname === 'localhost') {
        return CONNECTION_CONFIGS.web.url;
      }
      // If using a proxy in development
      return '';  // Empty baseURL when using proxy
    }
    
    // React Native environment detection - with error handling for Hermes
    if (typeof Platform === 'object' && Platform) {
      // Safely check for physical device first
      let isPhysical = false;
      try {
        isPhysical = isPhysicalDevice();
      } catch (err) {
        console.log("Error detecting physical device, defaulting to physical device config:", err.message);
        isPhysical = true; // Safer to assume physical device if detection fails
      }
      
      if (isPhysical) {
        console.log("Physical device detected - using physicalDevice configuration");
        // Try custom configuration for physical devices
        // NOTE: User must update the physicalDevice.url with their computer's IP address
        return CONNECTION_CONFIGS.physicalDevice.url;
      }
      
      // For emulators/simulators
      if (Platform.OS === 'android') {
        return CONNECTION_CONFIGS.android.url;
      } else if (Platform.OS === 'ios') {
        return CONNECTION_CONFIGS.ios.url;
      }
    }
  } catch (err) {
    console.log("Error in getBaseUrl, using fallback configuration:", err.message);
    // Use a safe fallback if anything fails
    return CONNECTION_CONFIGS.production.url;
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

// Show a warning if using the default placeholder for the physical device URL
if (api.defaults.baseURL.includes('YOUR_COMPUTER_IP')) {
  console.warn(
    '⚠️ Warning: Using placeholder IP address for physical device. ' + 
    'Replace YOUR_COMPUTER_IP in services/api.js with your computer\'s actual IP address ' +
    'to test on physical devices.'
  );
}


// Enhanced request interceptor with URL path correction and detailed logging
api.interceptors.request.use(
  config => {
    // For development/testing, add some retry logic
    if (!config.retryCount) {
      config.retryCount = 0;
    }
    
    // Check for potential URL issues
    if (config.url && config.url.includes('//')) {
      console.warn('Warning: URL contains double slashes which may cause routing issues:', config.url);
      // Fix double slashes in URLs (except after protocol)
      config.url = config.url.replace(/([^:])\/\//g, '$1/');
    }
    
    // Check if the URL has '/api' duplicated when the baseURL already includes it
    if (config.baseURL && 
        config.baseURL.includes('/api') && 
        config.url && 
        config.url.startsWith('/api')) {
      console.warn('Warning: URL path has duplicate /api prefix. Fixing URL path.');
      config.url = config.url.replace(/^\/api/, '');
    }

    // Enhanced logging for requests
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    console.log(`Full URL: ${config.baseURL}${config.url}`);
    
    // Log headers and body for debugging
    try {
      console.log('Request Headers:', JSON.stringify(config.headers, null, 2));
      if (config.data) {
        console.log('Request Body:', typeof config.data === 'string' ? 
          JSON.parse(config.data) : config.data);
      }
    } catch (err) {
      console.log('Error parsing request data:', err.message);
    }
    
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with detailed logging and improved error handling
api.interceptors.response.use(
  response => {
    // Log successful responses for debugging
    console.log(`API Response Success [${response.status}] for ${response.config.method.toUpperCase()} ${response.config.url}`);
    
    // For debugging, log response structure but not full data to avoid clutter
    const responseInfo = {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method,
      dataSize: response.data ? JSON.stringify(response.data).length : 0,
      hasData: !!response.data
    };
    console.log('Response info:', responseInfo);
    
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Enhanced error logging for debugging
    console.error(`API Error for ${originalRequest?.method?.toUpperCase() || 'UNKNOWN'} ${originalRequest?.url || 'UNKNOWN_URL'}:`);
    
    // Create detailed diagnostic information
    const diagnosticInfo = {
      url: `${originalRequest?.baseURL || ''}${originalRequest?.url || ''}`,
      method: originalRequest?.method,
      timestamp: new Date().toISOString(),
      headers: originalRequest?.headers,
      data: originalRequest?.data,
      environment: Platform ? Platform.OS : 'unknown',
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorMessage: error.message
    };
    
    console.log('Detailed error diagnostics:', diagnosticInfo);
    
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
        
        // No fallback URLs - only using https://eat2speak.com
        console.log('Retrying with the same production URL: https://eat2speak.com');
        
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
      
      // Provide better guidance for physical device connection issues
      let suggestion = originalRequest.withCredentials ? 
        "Try disabling CORS by calling configureCorsMode(false) or use a CORS proxy" : 
        "If running in an emulator, try using 10.0.2.2 instead of localhost";
      
      // For physical devices, give more specific guidance
      if (isPhysicalDevice() && diagnosticInfo.url.includes('YOUR_COMPUTER_IP')) {
        suggestion = "You need to set your computer's actual IP address in the physicalDevice configuration in services/api.js. " +
                     "Replace 'YOUR_COMPUTER_IP' with your computer's local network IP (e.g., 192.168.1.100).";
      }
      
      return Promise.reject({
        message: 'Cannot connect to server. Please check your network connectivity and ensure the server is running.',
        code: 'NETWORK_ERROR',
        originalError: error,
        url: diagnosticInfo.url,
        diagnostics: diagnosticInfo,
        suggestion: suggestion
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

// Logout function to properly invalidate session on the server
export const logout = async () => {
  try {
    // Make a POST request to the logout endpoint
    const response = await api.post('/api/auth/logout');
    
    // Log successful logout for debugging
    console.log('Logout successful');
    
    // Clear the auth token
    setAuthToken(null);
    
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Add detailed request information to help diagnose the issue
    if (error.config) {
      console.error('Logout request details:', {
        url: `${error.config.baseURL || ''}${error.config.url || ''}`,
        method: error.config.method,
        headers: error.config.headers
      });
    }
    
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

// Login function with correct URL path
export const login = async (email, password) => {
  try {
    // Use the full path to ensure it works correctly
    const response = await api.post('/api/auth/login', { email, password });
    
    // Log successful login for debugging
    console.log('Login successful');
    
    const { token } = response.data;
    
    // Set the token for future authenticated requests
    if (token) {
      setAuthToken(token);
      console.log('Auth token set successfully');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // Add detailed request information to help diagnose the issue
    if (error.config) {
      console.error('Login request details:', {
        url: `${error.config.baseURL || ''}${error.config.url || ''}`,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data ? JSON.parse(error.config.data) : null
      });
    }
    
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

// Register function with comprehensive validation and enhanced error handling
export const register = async (userData) => {
  try {
    // Validate required fields before sending
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'phoneNumber'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw {
        message: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'VALIDATION_ERROR',
        fields: missingFields
      };
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw {
        message: 'Invalid email format',
        code: 'VALIDATION_ERROR',
        fields: ['email']
      };
    }
    
    // Password validation
    if (userData.password && userData.password.length < 6) {
      throw {
        message: 'Password must be at least 6 characters',
        code: 'VALIDATION_ERROR',
        fields: ['password']
      };
    }
    
    // Ensure userTypes is always an array
    let userTypes = userData.userTypes;
    if (!userTypes) {
      if (userData.userType) {
        userTypes = Array.isArray(userData.userType) ? userData.userType : [userData.userType];
      } else {
        throw {
          message: 'User type is required',
          code: 'VALIDATION_ERROR',
          fields: ['userTypes']
        };
      }
    } else if (!Array.isArray(userTypes)) {
      userTypes = [userTypes]; // Convert to array if it's not already
    }
    
    // Map userType "teacher" to "native" for server compatibility
    userTypes = userTypes.map(type => type === 'teacher' ? 'native' : type);
    
    // Create a data object with all required fields based on user type
    const dataToSend = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber,
      userTypes: userTypes
    };
    
    // Add address (required for restaurant, recommended for all)
    if (userData.address) {
      dataToSend.address = userData.address;
    } else {
      // Default empty address object if not provided
      dataToSend.address = {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      };
    }
    
    // Add type-specific fields only if they exist
    if (userData.nationality) dataToSend.nationality = userData.nationality;
    if (userData.gender) dataToSend.gender = userData.gender;
    
    // For native speakers (teachers)
    if (userTypes.includes('native') && userData.nativeLanguage) {
      dataToSend.languageName = userData.nativeLanguage;
    }
    
    // For restaurants
    if (userTypes.includes('restaurant')) {
      if (!userData.restaurantName || !userData.cuisineType) {
        const missingRestaurantFields = [];
        if (!userData.restaurantName) missingRestaurantFields.push('restaurantName');
        if (!userData.cuisineType) missingRestaurantFields.push('cuisineType');
        
        throw {
          message: `Missing required restaurant fields: ${missingRestaurantFields.join(', ')}`,
          code: 'VALIDATION_ERROR',
          fields: missingRestaurantFields
        };
      }
      
      dataToSend.restaurantName = userData.restaurantName;
      dataToSend.cuisineType = userData.cuisineType;
    }
    
    // Log the data being sent for debugging
    console.log('Sending registration data:', JSON.stringify(dataToSend, null, 2));
    console.log('Headers:', JSON.stringify(api.defaults.headers, null, 2));
    
    // Use the correct endpoint with /api prefix as configured in the server
    // The correct endpoint is '/api/user/register' to match the server routes
    const response = await api.post('/api/user/register', dataToSend);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Add detailed request information to help diagnose the issue
    if (error.config) {
      console.error('Request details:', {
        url: `${error.config.baseURL || ''}${error.config.url || ''}`,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data ? JSON.parse(error.config.data) : null
      });
    }
    
    // Check for validation errors we generated above
    if (error.code === 'VALIDATION_ERROR') {
      throw error;
    }
    
    // Handle server validation errors (400 Bad Request)
    if (error.response?.status === 400) {
      // Try to extract field-specific errors from response
      const errorData = error.response.data;
      console.log('Server validation error:', JSON.stringify(errorData, null, 2));
      
      // Check for specific field errors in the response
      if (errorData.message && errorData.message.includes('required')) {
        // Parse the error message to identify missing fields
        const fieldMatch = errorData.message.match(/(\w+) is required/);
        if (fieldMatch && fieldMatch[1]) {
          throw {
            message: errorData.message,
            code: 'FIELD_REQUIRED',
            fields: [fieldMatch[1]]
          };
        }
      }
      
      // Return the server error with enhanced structure
      throw {
        message: errorData.message || 'Registration failed due to validation errors',
        code: 'SERVER_VALIDATION_ERROR',
        serverError: errorData
      };
    }
    
    // Enhanced error handling with better diagnostics
    if (error.code === 'SERVER_UNAVAILABLE') {
      throw error;
    } else if (error.response?.data) {
      throw {
        message: error.response.data.message || 'Server error occurred',
        code: 'SERVER_ERROR',
        serverError: error.response.data
      };
    } else if (error.response) {
      throw { 
        message: `Error ${error.response.status}: ${error.response.statusText}`,
        code: 'HTTP_ERROR',
        status: error.response.status
      };
    } else if (error.message && error.message.includes('Network Error')) {
      throw { 
        message: 'Cannot connect to server. Please check your network connection and ensure the server is running.',
        code: 'NETWORK_ERROR'
      };
    } else {
      throw { 
        message: error.message || 'An unknown error occurred during registration',
        code: 'UNKNOWN_ERROR'
      };
    }
  }
};

// Test functions to verify server connectivity with corrected URL paths
export const testHealth = async () => {
  try {
    // URL is '/health' not '/api/health' to avoid duplication
    const response = await api.get('/health');
    console.log('Health check successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export const testEndpoint = async () => {
  try {
    // URL is '/test/test' not '/api/test/test' to avoid duplication
    const response = await api.get('/test/test');
    console.log('Test endpoint successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Test endpoint failed:', error);
    throw error;
  }
};

export const testEcho = async (data) => {
  try {
    // URL is '/test/echo' not '/api/test/echo' to avoid duplication
    const response = await api.post('/test/echo', data);
    console.log('Echo endpoint successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Echo endpoint failed:', error);
    throw error;
  }
};

// Dedicated test function for registration - uses minimal payload for troubleshooting
export const testRegistrationMinimal = async () => {
  try {
    // Create a minimal test user with only the required fields
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Math.floor(Math.random() * 10000)}@example.com`, // Random email to avoid duplicates
      password: 'password123',
      phoneNumber: '123456789',
      userTypes: ['student']
    };
    
    console.log('Testing registration with minimal payload:', testUser);
    return register(testUser);
  } catch (error) {
    console.error('Registration test failed:', error);
    throw error;
  }
};

// Test registration with specific user type
export const testRegistrationByType = async (userType) => {
  try {
    // Validate user type
    if (!['student', 'teacher', 'restaurant'].includes(userType)) {
      throw new Error(`Invalid user type: ${userType}. Must be 'student', 'teacher', or 'restaurant'`);
    }
    
    // Create a test user with the specified user type
    const testUser = {
      firstName: 'Test',
      lastName: `${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
      email: `test${userType}${Math.floor(Math.random() * 10000)}@example.com`,
      password: 'password123',
      phoneNumber: '123456789',
      userTypes: [userType]
    };
    
    // Add type-specific required fields
    if (userType === 'teacher') {
      testUser.nativeLanguage = 'Inglês';
    } else if (userType === 'restaurant') {
      testUser.restaurantName = 'Test Restaurant';
      testUser.cuisineType = 'International';
      testUser.address = {
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      };
    }
    
    console.log(`Testing registration for ${userType} with payload:`, testUser);
    return register(testUser);
  } catch (error) {
    console.error(`Registration test for ${userType} failed:`, error);
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