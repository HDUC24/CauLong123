import React from "react";
import { StyleSheet, View, Platform, Text } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

// Tạo direct mapping để tránh lỗi dynamic lookup
const directIconMapping: Record<string, any> = {
  // Tab Navigation icons
  home: fas.faHome,
  "home-outline": far.faHome,
  people: fas.faUsers,
  "people-outline": far.faUsers,
  "stats-chart": fas.faChartBar,
  "stats-chart-outline": far.faChartBar,
  "help-outline": far.faQuestionCircle,
  list: fas.faList,
  "list-outline": far.faList,

  // Fallbacks to ensure all icons work
  "home-sharp": fas.faHome,
  "people-sharp": fas.faUsers,
  "stats-chart-sharp": fas.faChartBar,

  // Action icons
  add: fas.faPlus,
  "add-circle": fas.faPlusCircle,
  "add-circle-outline": far.faPlusCircle,
  share: fas.faShare,
  "share-social": fas.faShareAlt,
  "share-social-outline": far.faShareAlt,
  create: fas.faEdit,
  "create-outline": far.faEdit,
  trash: fas.faTrash,
  "trash-outline": far.faTrashAlt,
  remove: fas.faMinus,
  "remove-circle": fas.faMinusCircle,
  "remove-circle-outline": far.faMinusCircle,
  checkmark: fas.faCheck,
  "checkmark-circle": fas.faCheckCircle,
  "checkmark-circle-outline": far.faCheckCircle,
  close: fas.faTimes,
  "close-circle": fas.faTimesCircle,
  "close-circle-outline": far.faTimesCircle,
  "arrow-back": fas.faArrowLeft,
  "arrow-forward": fas.faArrowRight,
  calendar: fas.faCalendar,
  "calendar-outline": far.faCalendar,
  time: fas.faClock,
  "time-outline": far.faClock,
  "chevron-down": fas.faChevronDown,
  "chevron-up": fas.faChevronUp,
  "chevron-forward": fas.faChevronRight,
  "chevron-back": fas.faChevronLeft,
  menu: fas.faBars,
  "ellipsis-vertical": fas.faEllipsisV,
  "ellipsis-horizontal": fas.faEllipsisH,
  search: fas.faSearch,
  "search-outline": far.faSearch,
  filter: fas.faFilter,
  "filter-outline": far.faFilter,
  notifications: fas.faBell,
  "notifications-outline": far.faBell,
  cart: fas.faShoppingCart,
  "cart-outline": far.faShoppingCart,
  settings: fas.faCog,
  "settings-outline": far.faCog,
  person: fas.faUser,
  "person-outline": far.faUser,
};

interface WebIconFAProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

const WebIconFA: React.FC<WebIconFAProps> = ({
  name,
  size = 24,
  color,
  style,
}) => {
  // Lấy icon trực tiếp từ mapping
  const iconDefinition = directIconMapping[name];

  // Styling cho web
  const webStyle =
    Platform.OS === "web"
      ? {
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
        }
      : style;

  try {
    if (!iconDefinition) {
      console.warn(`No icon mapping found for: ${name}, using question mark`);
    }

    return (
      <View style={webStyle}>
        <FontAwesomeIcon
          icon={iconDefinition || fas.faQuestion}
          size={size}
          color={color}
        />
      </View>
    );
  } catch (error) {
    console.error(`Error rendering icon ${name}:`, error);
    // Fallback khi lỗi - hiển thị dấu hỏi kiểu text
    return (
      <View style={[webStyle, styles.fallbackContainer]}>
        <Text
          style={{
            color: color || "#000",
            fontSize: size ? size * 0.8 : 20,
          }}
        >
          ?
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  fallbackContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default WebIconFA;
