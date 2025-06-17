import { Platform } from 'react-native';

// This file provides a simple way to check if we're running on web
export const isWeb = Platform.OS === 'web';

// A centralized place to handle any platform-specific logic
export const platformHelper = {
  isWeb,
  
  // Add more helper functions as needed
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',

  // For features that might not be available on web
  supportsPushNotifications: Platform.OS !== 'web',
  supportsNativeShare: Platform.OS !== 'web',
};

// Export a function to help conditionally import components
export function getPlatformComponent(webComponent: any, nativeComponent: any) {
  return isWeb ? webComponent : nativeComponent;
}
