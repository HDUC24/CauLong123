# Web Components for CauLongApp

This directory contains web-specific components and utilities that are used to replace native React Native functionality when the app is running as a Progressive Web App (PWA).

## Components

### WebIcon

A replacement for Expo's Ionicons that works on web. It uses emoji or Unicode characters as a fallback for icon display on web.

Usage:
```tsx
import Icon from "../components/Icon"; // Use the unified component

// In your component
<Icon name="home" size={24} color="#4caf50" />
```

### WebDateTimePicker

A replacement for `@react-native-community/datetimepicker` that works on web. On native platforms, it uses the native date picker, while on web it uses HTML input elements.

Usage:
```tsx
import WebDateTimePicker from "../components/web/WebDateTimePicker";

// ...
<WebDateTimePicker
  value={date}
  mode="date"
  display="default"
  onChange={onChangeDate}
/>
```

### WebAlert

A replacement for React Native's Alert API. On web, it uses the browser's native alert/confirm dialogs or a custom modal component.

Do not use this component directly. Instead, import CrossPlatformAlert from the utils.

### WebShareButton

A component that provides sharing functionality that works on both web and native platforms. On web, it uses the Web Share API if available, or falls back to copying to clipboard.

## Cross-platform Utilities

The following utilities provide cross-platform functionality:

### CrossPlatformAlert

A utility that provides Alert.alert functionality on both web and native platforms:

```tsx
import { CrossPlatformAlert } from "../utils";

CrossPlatformAlert.alert(
  "Title",
  "Message",
  [
    { text: "Cancel", style: "cancel" },
    { text: "OK", onPress: () => console.log("OK Pressed") },
  ]
);
```

### CrossPlatformShare

A utility for sharing content on both web and native platforms:

```tsx
import { CrossPlatformShare } from "../utils";

CrossPlatformShare.share({
  message: "Content to share",
  title: "Share Title",
});
```

### PlatformUtils

Contains utility functions for platform detection:

```tsx
import { isWeb, platformHelper } from "../utils";

if (isWeb) {
  // Web-specific code
} else {
  // Native-specific code
}

// Check if a feature is supported
if (platformHelper.supportsPushNotifications) {
  // Use push notifications
}
```
