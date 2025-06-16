// Đăng ký service worker cho PWA nếu trong production và trình duyệt hỗ trợ
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(error => {
        console.error('SW registration failed: ', error);
      });
  });
}
