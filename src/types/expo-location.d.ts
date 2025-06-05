declare module 'expo-location' {
  export interface LocationObject {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }

  // Make Accuracy directly accessible from the Location namespace
  export const Accuracy: {
    Lowest: 1;
    Low: 2;
    Balanced: 3;
    High: 4;
    Highest: 5;
    BestForNavigation: 6;
  };

  export enum LocationAccuracy {
    Lowest = 1,
    Low = 2,
    Balanced = 3,
    High = 4,
    Highest = 5,
    BestForNavigation = 6
  }

  export interface LocationOptions {
    accuracy?: LocationAccuracy | number;
    timeInterval?: number;
    distanceInterval?: number;
    mayShowUserSettingsDialog?: boolean;
  }

  export interface PermissionResponse {
    status: 'granted' | 'denied' | 'undetermined';
    expires: 'never' | number;
    canAskAgain: boolean;
    granted: boolean;
  }

  export function requestForegroundPermissionsAsync(): Promise<PermissionResponse>;
  export function getCurrentPositionAsync(options?: LocationOptions): Promise<LocationObject>;
  export function watchPositionAsync(
    options: LocationOptions,
    callback: (location: LocationObject) => void
  ): { remove: () => void };
}