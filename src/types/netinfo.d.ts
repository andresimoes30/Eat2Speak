declare module '@react-native-community/netinfo' {
  export type NetInfoStateType =
    | 'unknown'
    | 'none'
    | 'cellular'
    | 'wifi'
    | 'bluetooth'
    | 'ethernet'
    | 'wimax'
    | 'vpn'
    | 'other';

  export interface NetInfoCellularGeneration {
    '2g': '2g';
    '3g': '3g';
    '4g': '4g';
    '5g': '5g';
  }

  export interface NetInfoState {
    type: NetInfoStateType;
    isConnected: boolean;
    isInternetReachable: boolean | null;
    details: {
      isConnectionExpensive?: boolean;
      cellularGeneration?: keyof NetInfoCellularGeneration;
      carrier?: string;
      ipAddress?: string;
      subnet?: string;
      ssid?: string;
      bssid?: string;
      strength?: number;
      frequency?: number;
    } | null;
  }

  export interface NetInfoSubscription {
    (): void;
  }

  export interface NetInfoConfiguration {
    reachabilityUrl?: string;
    reachabilityTest?: (response: Response) => boolean;
    reachabilityLongTimeout?: number;
    reachabilityShortTimeout?: number;
    reachabilityRequestTimeout?: number;
    reachabilityShouldRun?: () => boolean;
  }

  // Correctly type the fetch method
  export function fetch(): Promise<NetInfoState>;
  
  // Correctly type the addEventListener method
  export function addEventListener(
    listener: (state: NetInfoState) => void
  ): NetInfoSubscription;
  
  // Add useNetInfo hook
  export function useNetInfo(): NetInfoState;
  
  // Add configure method
  export function configure(configuration: NetInfoConfiguration): void;

  // Default export
  const NetInfo: {
    fetch: typeof fetch;
    addEventListener: typeof addEventListener;
    useNetInfo: typeof useNetInfo;
    configure: typeof configure;
  };

  export default NetInfo;
}