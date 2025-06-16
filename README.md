# CauLongApp - Ứng dụng Quản lý Chi phí Đánh Cầu Lông

Ứng dụng di động được phát triển với React Native và Expo để giúp người chơi cầu lông quản lý và chia đều các khoản chi phí cho các buổi đánh cầu.

## Tính năng chính

1. **Quản lý các buổi đánh cầu**

   - Tạo buổi đánh cầu mới
   - Xem chi tiết buổi đánh cầu
   - Chỉnh sửa thông tin buổi đánh cầu
   - Xóa buổi đánh cầu

2. **Quản lý chi phí**

   - Theo dõi các loại chi phí (tiền sân, tiền cầu, tiền nước, phụ kiện, khác)
   - Chia đều chi phí cho tất cả người tham gia
   - Tùy chọn người chia sẻ chi phí cho các mục ngoài tiền sân và tiền cầu
   - Tính toán tự động số tiền mỗi người cần đóng góp

3. **Quản lý người chơi**

   - Thêm, xóa người chơi
   - Lựa chọn người tham gia buổi đánh cầu

4. **Thống kê chi tiêu**
   - Phân tích chi phí theo tháng
   - Phân tích chi phí theo loại
   - Phân tích chi phí theo người chơi

## Cài đặt

### Yêu cầu hệ thống

- Node.js (v14 trở lên)
- npm hoặc yarn
- Expo CLI

### Các bước cài đặt

1. **Sao chép dự án về máy**

```
git clone <đường-dẫn-repository>
cd CauLongApp
```

2. **Cài đặt các gói phụ thuộc**

```
npm install
```

hoặc

```
yarn install
```

3. **Khởi chạy ứng dụng**

```
npx expo start
```

4. **Sử dụng ứng dụng với một trong các cách sau**
   - Quét mã QR bằng ứng dụng Expo Go trên điện thoại Android hoặc iOS
   - Nhấn 'a' để mở ứng dụng trên thiết bị Android đã kết nối
   - Nhấn 'i' để mở ứng dụng trên máy ảo iOS (chỉ trên macOS)
   - Nhấn 'w' để mở ứng dụng trên trình duyệt web

## Cấu trúc dự án

```
src/
  ├── assets/            # Hình ảnh và nội dung tĩnh
  ├── components/        # Các components tái sử dụng
  ├── models/            # Định nghĩa kiểu dữ liệu
  ├── navigation/        # Cấu hình điều hướng
  ├── screens/           # Các màn hình chính của ứng dụng
  ├── services/          # Các dịch vụ (lưu trữ, API)
  └── utils/             # Các hàm tiện ích
```

## Cách sử dụng

### Tạo buổi đánh cầu mới

1. Trên màn hình chính, nhấn nút "+" để tạo buổi đánh cầu mới
2. Nhập thông tin ngày, địa điểm và ghi chú (nếu có)
3. Chọn người tham gia từ danh sách hoặc thêm người mới
4. Nhập các khoản chi phí (loại chi phí, số tiền, mô tả)
5. Nhấn "Lưu" để hoàn tất

### Xem và quản lý chi tiết buổi đánh cầu

1. Nhấn vào một buổi đánh cầu trong danh sách để xem chi tiết
2. Xem danh sách chi phí và số tiền chia đều cho từng người chơi
3. Có thể chỉnh sửa thông tin hoặc xóa buổi đánh cầu

### Quản lý danh sách người chơi

1. Chuyển sang tab "Người chơi" để xem danh sách người chơi
2. Có thể thêm người chơi mới hoặc xóa người chơi hiện có

### Xem thống kê chi tiêu

1. Chuyển sang tab "Thống kê" để xem báo cáo chi tiêu
2. Chọn chế độ xem (theo tháng, theo loại chi phí, hoặc theo người chơi)
3. Xem phân tích chi tiết về các khoản chi phí

## Cải tiến dự kiến

- [ ] Xuất báo cáo chi phí (PDF, Excel)
- [ ] Nhắc nhở thanh toán
- [ ] Đăng nhập và đồng bộ dữ liệu đám mây
- [ ] Giao diện tùy biến (chủ đề sáng/tối)
