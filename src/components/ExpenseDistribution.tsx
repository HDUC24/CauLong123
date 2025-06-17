import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { formatCurrency } from "../utils/expenseUtils";
import { CrossPlatformAlert } from "../utils";
import Icon from "./Icon";

type ExpenseDistributionProps = {
  totalAmount: number;
  playerAmounts: {
    id: string;
    name: string;
    amount: number;
  }[];
  onShowPaymentStatus?: () => void;
};

/**
 * Component hiển thị phân bổ chi phí với biểu đồ trực quan
 * Cho phép theo dõi trạng thái thanh toán của từng người chơi
 */
const ExpenseDistribution = ({
  totalAmount,
  playerAmounts,
  onShowPaymentStatus,
}: ExpenseDistributionProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>(
    {}
  );

  // Sắp xếp người chơi theo số tiền giảm dần
  const sortedPlayers = [...playerAmounts].sort((a, b) => b.amount - a.amount);

  // Tìm số tiền lớn nhất để tính tỷ lệ
  const maxAmount = Math.max(...playerAmounts.map((p) => p.amount), 1);
  // Toggle payment status for a player
  const togglePaymentStatus = (playerId: string) => {
    setPaymentStatus((prev) => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };

  // Check if all players have paid
  const allPaid = sortedPlayers.every((player) => paymentStatus[player.id]);

  // Calculate total amount paid
  const totalPaid = sortedPlayers.reduce((sum, player) => {
    return sum + (paymentStatus[player.id] ? player.amount : 0);
  }, 0);

  // Calculate remaining amount
  const remainingAmount = totalAmount - totalPaid;

  // Payment status modal
  const renderPaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Theo dõi thanh toán</Text>            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {sortedPlayers.map((player) => (
              <View key={player.id} style={styles.paymentRow}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{player.name}</Text>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(player.amount)}
                  </Text>
                </View>

                <Switch
                  value={paymentStatus[player.id] || false}
                  onValueChange={() => togglePaymentStatus(player.id)}
                  trackColor={{ false: "#e0e0e0", true: "#b9dfbb" }}
                  thumbColor={paymentStatus[player.id] ? "#4caf50" : "#f4f3f4"}
                />
              </View>
            ))}

            <View style={styles.paymentSummary}>
              <Text style={styles.summaryTitle}>Tổng quan</Text>

              <View style={styles.summaryRow}>
                <Text>Tổng chi phí:</Text>
                <Text style={styles.summaryTotal}>
                  {formatCurrency(totalAmount)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>Đã thu:</Text>
                <Text style={styles.summaryPaid}>
                  {formatCurrency(totalPaid)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>Còn lại:</Text>
                <Text style={styles.summaryRemaining}>
                  {formatCurrency(remainingAmount)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Phân bổ chi phí</Text>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => setShowPaymentModal(true)}
        >
          <Text style={styles.paymentButtonText}>Theo dõi thanh toán</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.totalText}>
        Tổng chi phí: {formatCurrency(totalAmount)}
        {remainingAmount > 0 && totalPaid > 0 && (
          <Text style={styles.remainingText}>
            {" "}
            (Còn thiếu: {formatCurrency(remainingAmount)})
          </Text>
        )}
      </Text>

      <View style={styles.chartContainer}>
        {sortedPlayers.map((player) => {
          // Calculate percentage for visual reference
          const barWidthPercent = Math.max(
            (player.amount / maxAmount) * 100,
            5
          );
          // Use flex to control the width instead of percentage string
          const barWidthFlex = barWidthPercent / 100;

          // Check payment status
          const isPaid = paymentStatus[player.id] || false;

          return (
            <TouchableOpacity
              key={player.id}
              style={styles.barRow}
              onPress={() => togglePaymentStatus(player.id)}
            >
              <View style={styles.nameContainer}>                {isPaid && (
                  <Icon
                    name="checkmark-circle"
                    size={16}
                    color="#4caf50"
                    style={styles.paidIcon}
                  />
                )}
                <Text
                  style={[styles.nameText, isPaid && styles.paidText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {player.name}
                </Text>
              </View>

              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { flex: barWidthFlex },
                    isPaid && styles.paidBar,
                  ]}
                />
                <Text style={[styles.amountText, isPaid && styles.paidAmount]}>
                  {formatCurrency(player.amount)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.note}>
        Nhấn vào người chơi để đánh dấu đã thanh toán
      </Text>

      {renderPaymentModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  paymentButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  paymentButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  totalText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
  },
  remainingText: {
    color: "#e53935",
  },
  chartContainer: {
    marginVertical: 12,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  nameContainer: {
    width: "28%",
    flexDirection: "row",
    alignItems: "center",
  },
  paidIcon: {
    marginRight: 4,
  },
  nameText: {
    fontSize: 14,
    color: "#444",
    marginRight: 8,
    flex: 1,
  },
  barContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  bar: {
    height: 20,
    backgroundColor: "#4caf50",
    borderRadius: 4,
    marginRight: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  paidText: {
    color: "#4caf50",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
  },
  paidBar: {
    backgroundColor: "#a5d6a7", // lighter green
    opacity: 0.7,
  },
  paidAmount: {
    color: "#4caf50",
  },
  note: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    fontStyle: "italic",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    padding: 16,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  paymentAmount: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  paymentSummary: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryTotal: {
    fontWeight: "500",
    color: "#333",
  },
  summaryPaid: {
    color: "#4caf50",
    fontWeight: "500",
  },
  summaryRemaining: {
    color: "#e53935",
    fontWeight: "500",
  },
});

export default ExpenseDistribution;
