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
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (newValue) {
        let newDate: Date;
        
        if (mode === "date") {
          newDate = new Date(newValue);
        } else {
          const [hours, minutes] = newValue.split(":");
          newDate = new Date(value);
          newDate.setHours(parseInt(hours, 10));
          newDate.setMinutes(parseInt(minutes, 10));
        }
        
        onChange({ type: "set", nativeEvent: { timestamp: newDate.getTime() } }, newDate);
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
