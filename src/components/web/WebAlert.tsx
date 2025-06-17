import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert as RNAlert,
} from "react-native";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface WebAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss: () => void;
}

const WebAlert: React.FC<WebAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK" }],
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          {message && <Text style={styles.modalMessage}>{message}</Text>}

          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === "destructive" && styles.destructiveButton,
                  button.style === "cancel" && styles.cancelButton,
                ]}
                onPress={() => {
                  if (button.onPress) button.onPress();
                  onDismiss();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "destructive" && styles.destructiveText,
                    button.style === "cancel" && styles.cancelText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Create a function to match React Native's Alert.alert API
export const WebAlertManager = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean; onDismiss?: () => void }
  ) => {
    if (Platform.OS !== "web") {
      // Use React Native's Alert on non-web platforms
      RNAlert.alert(title, message, buttons, options);
      return;
    }

    // For web platform
    const alertContainer = document.createElement("div");
    alertContainer.id = "web-alert-container";
    document.body.appendChild(alertContainer);

    const destroyAlert = () => {
      if (alertContainer && document.body.contains(alertContainer)) {
        document.body.removeChild(alertContainer);
      }
    };

    // Create a simple alert for web using the browser's alert
    // This is a simple fallback; in a real app you would render a React component
    if (!buttons || buttons.length === 0) {
      window.alert(message ? `${title}\n\n${message}` : title);
      destroyAlert();
      return;
    }

    // For simple confirmations
    if (
      buttons.length === 2 &&
      buttons[0].style === "cancel" &&
      buttons[1].style === "destructive"
    ) {
      if (window.confirm(message ? `${title}\n\n${message}` : title)) {
        if (buttons[1].onPress) buttons[1].onPress();
      } else {
        if (buttons[0].onPress) buttons[0].onPress();
      }
      destroyAlert();
      return;
    }

    // For simple alerts with just an OK button
    window.alert(message ? `${title}\n\n${message}` : title);
    if (buttons[0] && buttons[0].onPress) buttons[0].onPress();
    destroyAlert();
  },
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    backgroundColor: "#2196F3",
    margin: 5,
  },
  destructiveButton: {
    backgroundColor: "#f44336",
  },
  cancelButton: {
    backgroundColor: "#9e9e9e",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  destructiveText: {
    color: "white",
  },
  cancelText: {
    color: "white",
  },
});

export default WebAlert;
