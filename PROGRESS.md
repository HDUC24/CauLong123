# Tiến Trình Phát Triển Ứng Dụng

## Các tính năng đã thực hiện:

1. ✅ Khởi tạo dự án React Native với Expo

2. ✅ Cài đặt dependencies:

   - React Navigation và các thành phần điều hướng
   - AsyncStorage để lưu trữ dữ liệu
   - DateTimePicker cho chọn ngày

3. ✅ Tạo cấu trúc thư mục:

   - src/assets/images/: Hình ảnh
   - src/components/: Các component tái sử dụng
   - src/models/: Định nghĩa kiểu dữ liệu
   - src/navigation/: Cấu hình điều hướng
   - src/screens/: Các màn hình
   - src/services/: Các dịch vụ lưu trữ, API
   - src/utils/: Các hàm tiện ích

4. ✅ Tạo các model và utilities:

   - Định nghĩa model Player, ExpenseType, Expense, Session
   - Tạo các hàm tiện ích tính toán chi phí và định dạng tiền tệ

5. ✅ Tạo các service lưu trữ:

   - Sử dụng AsyncStorage để lưu trữ dữ liệu người chơi và buổi đánh cầu

6. ✅ Tạo các màn hình chính:

   - HomeScreen: Hiển thị danh sách các buổi đánh cầu
   - SessionDetailScreen: Chi tiết buổi đánh cầu, bao gồm biểu đồ phân bổ chi phí
   - NewSessionScreen: Thêm buổi đánh cầu mới
   - EditSessionScreen: Chỉnh sửa thông tin buổi đánh cầu
   - PlayersScreen: Quản lý danh sách người chơi
   - AddPlayerScreen: Thêm người chơi mới
   - StatsScreen: Thống kê chi phí theo tháng, theo loại, theo người chơi

7. ✅ Tạo các component:

   - ExpenseDistribution: Hiển thị biểu đồ phân bổ chi phí
   - ShareButton: Chia sẻ thông tin chi phí qua các ứng dụng khác

8. ✅ Cấu hình navigation:

   - Bottom Tab Navigator cho các màn hình chính (Home, Players, Stats)
   - Stack Navigator cho điều hướng giữa các màn hình

9. ✅ Cải thiện trải nghiệm người dùng:

   - Thêm màn hình Splash khi khởi động ứng dụng
   - Tùy chỉnh app.json để cấu hình đúng cho ứng dụng

10. ✅ Thêm tài liệu:
    - README.md với hướng dẫn cài đặt và sử dụng

## Các tính năng có thể phát triển thêm:

1. 🔄 Chức năng xuất báo cáo chi phí (PDF, Excel)
2. 🔄 Nhắc nhở thanh toán
3. 🔄 Đăng nhập và đồng bộ dữ liệu đám mây
4. 🔄 Chế độ giao diện tối (Dark Mode)
5. 🔄 Tích hợp thông báo đẩy (Push Notifications)
6. 🔄 Tạo sự kiện lịch cho các buổi đánh cầu

## Các tính năng đã thực hiện gần đây:

1. ✅ Trạng thái thanh toán

   - Theo dõi người chơi đã thanh toán hay chưa
   - Hiển thị biểu tượng trạng thái thanh toán
   - Modal xác nhận đã thanh toán

2. ✅ Chia sẻ thông tin buổi đánh cầu

   - Tạo báo cáo chi tiết về buổi đánh cầu
   - Chia sẻ thông tin với các ứng dụng khác

3. ✅ Thời lượng buổi đánh cầu

   - Theo dõi giờ bắt đầu và kết thúc
   - Tính toán thời lượng theo phút/giờ
   - Hiển thị thời lượng trong chi tiết buổi đánh

4. ✅ Tìm kiếm và lọc buổi đánh cầu

   - Tìm kiếm theo địa điểm
   - Lọc theo khoảng thời gian
   - Sắp xếp theo ngày, thời lượng, chi phí

5. ✅ Chi phí thuê sân tự động

   - Nhập giá sân theo giờ
   - Tính toán tự động chi phí dựa trên thời lượng
   - Nút thêm nhanh chi phí tiền sân

6. ✅ Tùy chọn chi phí theo từng người
   - Lựa chọn người tham gia chia sẻ chi phí cho các khoản ngoài tiền sân và tiền cầu
   - Hiển thị danh sách người chia sẻ với từng chi phí
   - Tính toán chính xác số tiền mỗi người phải trả dựa trên các chi phí họ tham gia

## Hướng dẫn chạy ứng dụng:

1. Cài đặt dependencies:

   ```
   npm install
   ```

2. Chạy ứng dụng:

   ```
   npx expo start
   ```

3. Sử dụng ứng dụng Expo Go trên điện thoại để quét mã QR hoặc mở trên thiết bị ảo.
