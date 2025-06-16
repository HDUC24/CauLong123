const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = async function (env, argv) {
  // Tạo cấu hình Expo mặc định với PWA enabled
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      pwa: true,
    },
    argv
  );

  // Cấu hình copy các file từ thư mục web và assets vào build
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "web"),
          to: path.resolve(__dirname, "web-build"),
          globOptions: {
            ignore: ["**/index.html"], // Bỏ qua file index.html để tránh xung đột
          },
        },
        {
          from: path.resolve(__dirname, "assets/icon.png"),
          to: path.resolve(__dirname, "web-build/pwa-icon-512.png"),
        },
        {
          from: path.resolve(__dirname, "assets/icon.png"),
          to: path.resolve(__dirname, "web-build/pwa-icon-192.png"),
        },
        {
          from: path.resolve(__dirname, "assets/icon.png"),
          to: path.resolve(__dirname, "web-build/pwa-icon-maskable-512.png"),
        },
        {
          from: path.resolve(__dirname, "assets/icon.png"),
          to: path.resolve(__dirname, "web-build/pwa-icon-180.png"),
        },
        {
          from: path.resolve(__dirname, "assets/favicon.png"),
          to: path.resolve(__dirname, "web-build/favicon-16.png"),
        },
        {
          from: path.resolve(__dirname, "assets/favicon.png"),
          to: path.resolve(__dirname, "web-build/favicon-32.png"),
        },
        {
          from: path.resolve(__dirname, "assets/splash-icon.png"),
          to: path.resolve(__dirname, "web-build/splash-icon.png"),
        },
      ],
    })
  );
  // Sử dụng service worker được tạo tự động bởi Expo

  // Sửa cấu hình PWA plugin nếu cần
  const WebpackPwaManifest = config.plugins.find(
    (plugin) =>
      plugin.constructor && plugin.constructor.name === "WebpackPwaManifest"
  );

  if (WebpackPwaManifest) {
    Object.assign(WebpackPwaManifest.options, {
      inject: true,
      ios: true,
      crossorigin: "use-credentials",
    });
  }

  return config;
};
