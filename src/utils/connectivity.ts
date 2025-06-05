/**
 * Network connectivity utility functions
 * This provides a fetch-based approach to check network connectivity
 * as an alternative to @react-native-community/netinfo
 */

/**
 * Check if the device has an active network connection
 * Uses a simple fetch request to a reliable endpoint
 * 
 * @returns Promise<boolean> - true if connected, false otherwise
 */
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // A simple fetch request to check connectivity
    // We use a timeout to avoid hanging if network is very slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('Network connectivity check failed:', error);
    return false;
  }
};