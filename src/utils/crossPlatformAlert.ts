import { Alert as RNAlert, Platform } from 'react-native';
import { WebAlertManager } from '../components/web/WebAlert';

// Interface matching React Native's Alert functionality
interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
}

// Create a unified Alert implementation
const CrossPlatformAlert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => {
    if (Platform.OS === 'web') {
      // Use our web implementation on web platform
      WebAlertManager.alert(title, message, buttons, options);
    } else {
      // Use React Native's Alert on native platforms
      RNAlert.alert(title, message, buttons, options);
    }
  }
};

export default CrossPlatformAlert;
