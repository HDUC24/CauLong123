import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";

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
