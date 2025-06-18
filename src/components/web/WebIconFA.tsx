import React from 'react';
import { StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { findIconDefinition, IconLookup, IconName } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

// Mapping từ tên Ionicons sang tên tương đương trong Font Awesome
const iconNameMapping: Record<string, { prefix: 'fas' | 'far' | 'fab', name: string }> = {
  // Navigation icons
  'home': { prefix: 'fas', name: 'home' },
  'home-outline': { prefix: 'far', name: 'home' },
  'people': { prefix: 'fas', name: 'users' },
  'people-outline': { prefix: 'far', name: 'users' },
  'stats-chart': { prefix: 'fas', name: 'chart-bar' },
  'stats-chart-outline': { prefix: 'far', name: 'chart-bar' },
  'help-outline': { prefix: 'far', name: 'question-circle' },
  'list': { prefix: 'fas', name: 'list' },
  'list-outline': { prefix: 'far', name: 'list' },
  
  // Action icons
  'add': { prefix: 'fas', name: 'plus' },
  'add-circle': { prefix: 'fas', name: 'plus-circle' },
  'add-circle-outline': { prefix: 'far', name: 'plus-circle' },
  'share': { prefix: 'fas', name: 'share' },
  'share-social': { prefix: 'fas', name: 'share-alt' },
  'share-social-outline': { prefix: 'far', name: 'share-alt' },
  'create': { prefix: 'fas', name: 'edit' },
  'create-outline': { prefix: 'far', name: 'edit' },
  'trash': { prefix: 'fas', name: 'trash' },
  'trash-outline': { prefix: 'far', name: 'trash-alt' },
  'remove': { prefix: 'fas', name: 'minus' },
  'remove-circle': { prefix: 'fas', name: 'minus-circle' },
  'remove-circle-outline': { prefix: 'far', name: 'minus-circle' },
  'checkmark': { prefix: 'fas', name: 'check' },
  'checkmark-circle': { prefix: 'fas', name: 'check-circle' },
  'checkmark-circle-outline': { prefix: 'far', name: 'check-circle' },
  'close': { prefix: 'fas', name: 'times' },
  'close-circle': { prefix: 'fas', name: 'times-circle' },
  'close-circle-outline': { prefix: 'far', name: 'times-circle' },
  'arrow-back': { prefix: 'fas', name: 'arrow-left' },
  'arrow-forward': { prefix: 'fas', name: 'arrow-right' },
  'calendar': { prefix: 'fas', name: 'calendar' },
  'calendar-outline': { prefix: 'far', name: 'calendar' },
  'time': { prefix: 'fas', name: 'clock' },
  'time-outline': { prefix: 'far', name: 'clock' },
  'chevron-down': { prefix: 'fas', name: 'chevron-down' },
  'chevron-up': { prefix: 'fas', name: 'chevron-up' },
  'chevron-forward': { prefix: 'fas', name: 'chevron-right' },
  'chevron-back': { prefix: 'fas', name: 'chevron-left' },
  'menu': { prefix: 'fas', name: 'bars' },
  'ellipsis-vertical': { prefix: 'fas', name: 'ellipsis-v' },
  'ellipsis-horizontal': { prefix: 'fas', name: 'ellipsis-h' },
  'search': { prefix: 'fas', name: 'search' },
  'search-outline': { prefix: 'far', name: 'search' },
  'filter': { prefix: 'fas', name: 'filter' },
  'filter-outline': { prefix: 'far', name: 'filter' },
  'notifications': { prefix: 'fas', name: 'bell' },
  'notifications-outline': { prefix: 'far', name: 'bell' },
  'cart': { prefix: 'fas', name: 'shopping-cart' },
  'cart-outline': { prefix: 'far', name: 'shopping-cart' },
  'settings': { prefix: 'fas', name: 'cog' },
  'settings-outline': { prefix: 'far', name: 'cog' },
  'person': { prefix: 'fas', name: 'user' },
  'person-outline': { prefix: 'far', name: 'user' },
};

// Library mapping
const iconLibraries = {
  fas,
  far,
  fab
};

interface WebIconFAProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

const WebIconFA: React.FC<WebIconFAProps> = ({ name, size = 24, color, style }) => {
  // Lấy icon tương ứng từ mapping
  const iconInfo = iconNameMapping[name];
  
  // Fallback nếu không tìm thấy icon
  const defaultIconInfo = { prefix: 'fas' as const, name: 'question' };
  const { prefix, name: iconName } = iconInfo || defaultIconInfo;
    try {
    // Sử dụng trực tiếp mảng icon để tránh lỗi kiểu IconName
    return (
      <FontAwesomeIcon
        icon={[prefix, iconName as any]}
        size={size}
        color={color}
        style={style}
      />
    );
  } catch (error) {
    console.warn(`Could not find Font Awesome icon for: ${name}`, error);
    // Fallback icon khi không tìm thấy
    return (
      <FontAwesomeIcon
        icon={['fas', 'question']}
        size={size}
        color={color}
        style={style}
      />
    );
  }
};

export default WebIconFA;
