import { Share as RNShare, Platform } from 'react-native';

// Interface that matches React Native's share options
interface ShareContent {
  message: string;
  title?: string;
  url?: string;
}

interface ShareResponse {
  action: string;
  activityType?: string;
}

// Create a unified Share implementation
const CrossPlatformShare = {
  share: async (options: ShareContent): Promise<ShareResponse> => {
    if (Platform.OS === 'web') {
      try {
        // Use Web Share API if available
        if (navigator.share) {
          await navigator.share({
            title: options.title,
            text: options.message,
            url: options.url,
          });
          return { action: 'sharedAction' };
        } else {
          // Fallback for browsers without Web Share API
          // Create a temporary textarea to copy text to clipboard
          const textarea = document.createElement('textarea');
          textarea.value = options.message || '';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          
          // Alert user about copy
          alert('Nội dung đã được sao chép vào clipboard!');
          return { action: 'sharedAction' };
        }
      } catch (error) {
        console.error('Error sharing content:', error);
        return { action: 'dismissedAction' };
      }
    } else {
      // Use React Native's Share on native platforms
      return await RNShare.share(options);
    }
  }
};

export default CrossPlatformShare;
