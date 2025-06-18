import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";

// Font Awesome setup
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { dom } from "@fortawesome/fontawesome-svg-core";

// Add all icons to the library so we can use them
library.add(fas, far, fab);

// Configure Font Awesome for web rendering
if (Platform.OS === "web") {
  // Tránh lỗi với DOM và cấu hình đúng cách cho web
  dom.watch();

  // Thêm CSS để đảm bảo icon được hiển thị đúng
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(
    document.createTextNode(`
    .svg-inline--fa {
      display: inline-block;
      width: 1em;
      height: 1em;
      overflow: visible;
      vertical-align: -0.125em;
    }
  `)
  );
  document.head.appendChild(style);
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Giả lập thời gian tải ứng dụng
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require("./assets/icon.png")}
          style={styles.splashImage}
        />
        <Text style={styles.splashTitle}>CauLongApp</Text>
        <Text style={styles.splashSubtitle}>Quản lý chi phí đánh cầu lông</Text>
        <ActivityIndicator size="large" color="#4caf50" style={styles.loader} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  splashImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4caf50",
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});
