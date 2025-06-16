// Định nghĩa các kiểu dữ liệu cho ứng dụng

// Người tham gia chơi cầu
export interface Player {
  id: string;
  name: string;
}

// Loại chi phí
export enum ExpenseType {
  COURT_FEE = 'court_fee', // Tiền sân
  SHUTTLE = 'shuttle',     // Tiền cầu
  DRINK = 'drink',         // Tiền nước
  EQUIPMENT = 'equipment', // Tiền quấn cán, phụ kiện
  OTHER = 'other',         // Chi phí khác
}

// Chi phí đơn lẻ
export interface Expense {
  id: string;
  type: ExpenseType;
  amount: number;
  description: string;
  divideAmong?: string[]; // ID của các người chơi cần chia đều chi phí này. Nếu không có, mặc định chia cho tất cả
}

// Buổi đánh cầu
export interface Session {
  id: string;
  date: string; // ISO string
  endTime?: string; // Thời gian kết thúc (ISO string)
  duration?: number; // Thời lượng tính bằng phút
  courtFeePerHour?: number; // Giá thuê sân mỗi giờ
  players: Player[];
  expenses: Expense[];
  location: string;
  notes?: string;
  paymentStatus?: Record<string, boolean>; // Trạng thái thanh toán theo player ID
}

// Kết quả tính chi phí
export interface ExpenseCalculation {
  totalAmount: number;
  splitByPlayer: Record<string, number>; // Map player ID -> số tiền cần trả
}
