import { Expense, ExpenseCalculation, Player, Session } from '../models/types';

/**
 * Tính toán và chia chi phí cho một buổi đánh cầu
 * @param session Thông tin buổi đánh cầu
 * @returns Kết quả tính toán chi phí
 */
export const calculateExpenses = (session: Session): ExpenseCalculation => {
  const result: ExpenseCalculation = {
    totalAmount: 0,
    splitByPlayer: {},
  };

  // Khởi tạo số tiền cần trả cho mỗi người chơi là 0
  session.players.forEach((player) => {
    result.splitByPlayer[player.id] = 0;
  });

  // Tính tổng chi phí
  session.expenses.forEach((expense) => {
    result.totalAmount += expense.amount;

    // Xác định những người cần chia chi phí này
    const playersToSplit = expense.divideAmong 
      ? session.players.filter(p => expense.divideAmong?.includes(p.id))
      : session.players;

    if (playersToSplit.length === 0) return;

    // Chia đều chi phí
    const amountPerPlayer = expense.amount / playersToSplit.length;

    // Cập nhật chi phí cho mỗi người chơi
    playersToSplit.forEach((player) => {
      result.splitByPlayer[player.id] += amountPerPlayer;
    });
  });

  return result;
};

/**
 * Định dạng số thành chuỗi tiền tệ VND
 * @param amount Số tiền
 * @returns Chuỗi đã định dạng
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Tạo ID ngẫu nhiên
 * @returns Chuỗi ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
