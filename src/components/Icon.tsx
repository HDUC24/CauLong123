import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { platformHelper } from "../utils/platformUtils";
import WebIcon from "./web/WebIcon";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Trả về component icon phù hợp dựa trên nền tảng
const Icon: React.FC<IconProps> = ({ name, size = 24, color, style }) => {
  // Trên web, sử dụng WebIcon
  if (platformHelper.isWeb) {
    return <WebIcon name={name} size={size} color={color} style={style} />;
  }

  // Trên native, sử dụng Ionicons trực tiếp
  return (
    <Ionicons name={name as any} size={size} color={color} style={style} />
  );
};

export default Icon;
