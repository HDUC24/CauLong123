import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Share,
  View,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Session } from "../../models/types";
import { formatCurrency } from "../../utils/expenseUtils";
import { format } from "date-fns";

type WebShareButtonProps = {
  session: Session;
  calculatedExpenses: {
    totalAmount: number;
    splitByPlayer: Record<string, number>;
  };
};

const WebShareButton = ({
  session,
  calculatedExpenses,
}: WebShareButtonProps) => {
  const prepareMessage = () => {
    const date = format(new Date(session.date), "dd/MM/yyyy");
    const time = format(new Date(session.date), "HH:mm");

    let message = `📋 BÁO CÁO CHI PHÍ CẦU LÔNG\n\n`;
    message += `🗓️ Ngày: ${date}\n`;
    message += `🕒 Giờ: ${time}\n`;
    message += `📍 Địa điểm: ${session.location}\n`;
    message += `👥 Số người tham gia: ${session.players.length} người\n`;

    if (session.notes) {
      message += `📝 Ghi chú: ${session.notes}\n`;
    }

    message += `\n----------------------\n\n`;

    // Thêm danh sách chi tiết chi phí
    message += `🧾 CHI TIẾT CÁC KHOẢN CHI:\n\n`;
    session.expenses.forEach((expense, index) => {
      const expenseType = getExpenseTypeLabel(expense.type);
      message += `${index + 1}. ${expenseType}: ${formatCurrency(
        expense.amount
      )}`;
      if (expense.description) {
        message += ` (${expense.description})`;
      }

      // Thêm thông tin về người chia sẻ chi phí này
      if (
        expense.divideAmong &&
        expense.divideAmong.length > 0 &&
        expense.divideAmong.length < session.players.length
      ) {
        const playerNames = expense.divideAmong
          .map((id) => session.players.find((p) => p.id === id)?.name || "")
          .filter((name) => name)
          .join(", ");
        message += `\n   → Chia cho: ${playerNames}`;
      }

      message += "\n\n";
    });

    message += `----------------------\n\n`;
    message += `💰 TỔNG CHI PHÍ: ${formatCurrency(
      calculatedExpenses.totalAmount
    )}\n\n`;

    // Thêm chi phí mỗi người cần trả
    message += `💸 CHI PHÍ MỖI NGƯỜI:\n\n`;

    // Sắp xếp theo tên người chơi
    const sortedPlayers = [...session.players].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    sortedPlayers.forEach((player) => {
      const amount = calculatedExpenses.splitByPlayer[player.id] || 0;
      message += `• ${player.name}: ${formatCurrency(amount)}\n`;
    });

    return {
      message,
      title: `Chi phí đánh cầu lông ngày ${date}`,
    };
  };

  const handleShare = async () => {
    try {
      const { message, title } = prepareMessage();

      if (Platform.OS === "web") {
        // Web implementation using browser's Web Share API
        if (navigator.share) {
          await navigator.share({
            title: title,
            text: message,
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          // Create a temporary textarea to copy text to clipboard
          const textarea = document.createElement("textarea");
          textarea.value = message;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          alert("Nội dung đã được sao chép vào clipboard!");
        }
      } else {
        // Native implementation
        await Share.share({
          message,
          title,
        });
      }
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
    }
  };

  // Hàm lấy tên loại chi phí
  const getExpenseTypeLabel = (type: string): string => {
    switch (type) {
      case "court_fee":
        return "Tiền sân";
      case "shuttle":
        return "Tiền cầu";
      case "drink":
        return "Tiền nước";
      case "equipment":
        return "Tiền phụ kiện";
      case "other":
        return "Chi phí khác";
      default:
        return "Chi phí";
    }
  };

  return (
    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
      <Ionicons name="share-social-outline" size={20} color="white" />
      <Text style={styles.shareText}>Chia sẻ chi phí</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shareButton: {
    backgroundColor: "#2196f3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  shareText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default WebShareButton;
