import { registerRootComponent } from "expo";
import App from "./App";

// Đăng ký service worker cho PWA nếu đang chạy trong web
if (typeof document !== "undefined") {
  // Dynamic import cho web environment
  import("./web/register-service-worker").catch((err) =>
    console.error("Error loading service worker:", err)
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
