import React from "react";
import { Text, StyleSheet, Platform, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Icon mapping từ tên ionicon sang Unicode character cho web
const iconMap: Record<string, string> = {
  // Navigation icons
  home: "🏠",
  "home-outline": "🏠",
  people: "👥",
  "people-outline": "👥",
  "stats-chart": "📊",
  "stats-chart-outline": "📊",
  "help-outline": "❓",

  // Action icons
  add: "➕",
  "add-circle": "⊕",
  "add-circle-outline": "⊕",
  share: "📤",
  "share-social": "📤",
  "share-social-outline": "📤",
  create: "✏️",
  "create-outline": "✏️",
  trash: "🗑️",
  "trash-outline": "🗑️",
  checkmark: "✓",
  "checkmark-circle": "✅",
  "checkmark-circle-outline": "⭕",
  close: "✖",
  "close-circle": "❌",
  "close-circle-outline": "⭕",
  "arrow-back": "◀️",
  "arrow-forward": "▶️",
  calendar: "📅",
  "calendar-outline": "📅",
  time: "🕒",
  "time-outline": "🕒",
  "chevron-down": "▼",
  "chevron-up": "▲",
  "chevron-forward": "▶",
  "chevron-back": "◀",
  menu: "☰",
  "ellipsis-vertical": "⋮",
  "ellipsis-horizontal": "⋯",
  search: "🔍",
  "search-outline": "🔍",
  filter: "🔍",
  "filter-outline": "🔍",
  notifications: "🔔",
  "notifications-outline": "🔔",
};

interface WebIconProps {
  name: string; // ionicon name
  size?: number;
  color?: string;
  style?: any;
}

const WebIcon: React.FC<WebIconProps> = ({
  name,
  size = 24,
  color = "black",
  style,
}) => {
  // On native, use Ionicons directly
  if (Platform.OS !== "web") {
    return (
      <Ionicons name={name as any} size={size} color={color} style={style} />
    );
  }

  // On web, use emoji or unicode symbol alternatives
  const iconChar = iconMap[name] || "•"; // Default to bullet if icon not found

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.icon,
          {
            fontSize: size,
            color,
            lineHeight: size * 1.2, // Ensure proper vertical alignment
          },
        ]}
      >
        {iconChar}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    textAlign: "center",
  },
});

export default WebIcon;
