declare module 'react-native-webview' {
  import { Component } from 'react';
  import { StyleProp, ViewStyle } from 'react-native';

  export interface WebViewProps {
    /**
     * Source for the WebView, can be a URL or HTML content
     */
    source: {
      uri?: string;
      html?: string;
      headers?: { [key: string]: string };
    };
    
    /**
     * Reference to the WebView instance
     */
    ref?: React.RefObject<WebView>;
    
    /**
     * Style for the WebView container
     */
    style?: StyleProp<ViewStyle>;
    
    /**
     * Determines whether JavaScript is enabled
     */
    javaScriptEnabled?: boolean;
    
    /**
     * Determines whether DOM Storage is enabled
     */
    domStorageEnabled?: boolean;

    /**
     * Determines whether the WebView should start loading immediately
     */
    startInLoadingState?: boolean;

    /**
     * Handle messages sent from WebView via window.ReactNativeWebView.postMessage
     */
    onMessage?: (event: { nativeEvent: { data: string } }) => void;
    
    /**
     * Handle errors in the WebView
     */
    onError?: (event: { nativeEvent: any }) => void;
    
    /**
     * Handle HTTP errors in the WebView
     */
    onHttpError?: (event: { nativeEvent: any }) => void;
    
    /**
     * Array of origin strings to allow being navigated to
     */
    originWhitelist?: string[];
    
    /**
     * Function to render a loading indicator
     */
    renderLoading?: () => React.ReactNode;
    
    /**
     * Send a message to the WebView
     */
    postMessage?: (message: string) => void;
  }

  export class WebView extends Component<WebViewProps> {
    /**
     * Send a message to the WebView
     */
    postMessage(message: string): void;
  }
}