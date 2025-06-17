import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface WebDateTimePickerProps {
  value: Date;
  mode: "date" | "time";
  display?: "default" | "spinner" | "calendar" | "clock";
  onChange: (event: any, date?: Date) => void;
}

const WebDateTimePicker: React.FC<WebDateTimePickerProps> = ({
  value,
  mode,
  display = "default",
  onChange,
}) => {
  // Trên web, sử dụng input HTML gốc
  if (Platform.OS === "web") {
    const inputType = mode === "date" ? "date" : "time";

    // Định dạng giá trị cho input HTML
    const formatValue = () => {
      if (mode === "date") {
        return value.toISOString().split("T")[0]; // YYYY-MM-DD
      } else {
        return `${String(value.getHours()).padStart(2, "0")}:${String(
          value.getMinutes()
        ).padStart(2, "0")}`;
      }
    };    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (newValue) {
        let newDate: Date;

        if (mode === "date") {
          // Đảm bảo giữ lại giờ và phút từ giá trị hiện tại
          newDate = new Date(newValue);
          if (!isNaN(newDate.getTime())) {
            newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
          } else {
            newDate = new Date(value); // Sử dụng lại giá trị cũ nếu parse thất bại
            console.warn("Không thể parse ngày từ input:", newValue);
          }
        } else {
          const [hours, minutes] = newValue.split(":");
          newDate = new Date(value);
          if (hours !== undefined && minutes !== undefined) {
            newDate.setHours(parseInt(hours, 10) || 0);
            newDate.setMinutes(parseInt(minutes, 10) || 0);
          }
        }

        // Kiểm tra xem date có hợp lệ không
        if (!isNaN(newDate.getTime())) {
          onChange(
            { type: "set", nativeEvent: { timestamp: newDate.getTime() } },
            newDate
          );
        } else {
          console.warn("Tạo date không hợp lệ từ input:", newValue);
        }
      }
    };

    return (
      <View style={styles.container}>
        <input
          type={inputType}
          value={formatValue()}
          onChange={handleChange}
          style={styles.input}
        />
      </View>
    );
  }

  // Trên thiết bị di động, sử dụng DateTimePicker gốc
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display={display}
      onChange={onChange}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },
  input: {
    height: 40,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
});

export default WebDateTimePicker;
