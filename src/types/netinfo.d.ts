// Type definitions for network connectivity checks
// This provides type compatibility for our fetch-based network connectivity solution
// that replaces @react-native-community/netinfo

/**
 * Simple network connectivity checker using fetch
 * @returns Promise<boolean> - Returns true if connected, false otherwise
 */
export function checkNetworkConnectivity(): Promise<boolean>;