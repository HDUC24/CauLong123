// Tên cache hiện tại
const CACHE_NAME = 'caulongapp-v1';

// Biến __WB_MANIFEST được workbox-webpack-plugin thêm vào
// Đây là danh sách các tài nguyên được tạo ra bởi webpack
self.__WB_MANIFEST = self.__WB_MANIFEST || [];

// Danh sách các resource cần cache ban đầu
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/static/js/bundle.js',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/splash-icon.png'
];

// Cài đặt service worker - cache trước các resource
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - dọn dẹp cache cũ
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - trả về từ cache nếu có, nếu không thì request network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone request vì nó chỉ có thể dùng một lần
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Kiểm tra response hợp lệ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response vì body chỉ có thể đọc một lần
            const responseToCache = response.clone();

            // Thêm vào cache cho lần sau
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Nếu network fail và là GET request, trả về offline page
            if (event.request.method === 'GET') {
              return caches.match('/');
            }
          });
      })
  );
});

// Đồng bộ dữ liệu khi online trở lại
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Hàm đồng bộ dữ liệu
function syncData() {
  // Implement đồng bộ dữ liệu từ IndexedDB lên server khi có mạng
  console.log('Syncing data with server...');
  return Promise.resolve();
}
