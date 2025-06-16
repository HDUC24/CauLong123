import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getSessions, deleteSession } from "../services/storageService";
import { Session, Player, Expense, ExpenseType } from "../models/types";
import { calculateExpenses, formatCurrency } from "../utils/expenseUtils";
import ExpenseDistribution from "../components/ExpenseDistribution";
import ShareButton from "../components/ShareButton";

type RouteParams = {
  SessionDetail: {
    sessionId: string;
  };
};

const SessionDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, "SessionDetail">>();
  const { sessionId } = route.params;

  const [session, setSession] = useState<Session | null>(null);
  const [calculatedExpenses, setCalculatedExpenses] = useState<{
    totalAmount: number;
    splitByPlayer: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  const loadSessionDetails = async () => {
    setIsLoading(true);
    try {
      const sessions = await getSessions();
      const currentSession = sessions.find((s) => s.id === sessionId);

      if (currentSession) {
        setSession(currentSession);
        const calculated = calculateExpenses(currentSession);
        setCalculatedExpenses(calculated);
      } else {
        Alert.alert("Lỗi", "Không tìm thấy thông tin buổi đánh cầu");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết buổi đánh cầu:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin buổi đánh cầu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa buổi đánh cầu này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSession(sessionId);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa buổi đánh cầu");
            }
          },
        },
      ]
    );
  };

  const getExpenseTypeLabel = (type: ExpenseType): string => {
    switch (type) {
      case ExpenseType.COURT_FEE:
        return "Tiền sân";
      case ExpenseType.SHUTTLE:
        return "Tiền cầu";
      case ExpenseType.DRINK:
        return "Tiền nước";
      case ExpenseType.EQUIPMENT:
        return "Tiền phụ kiện";
      case ExpenseType.OTHER:
        return "Chi phí khác";
      default:
        return "Chi phí";
    }
  };
  const getExpenseTypeColor = (type: ExpenseType): string => {
    switch (type) {
      case ExpenseType.COURT_FEE:
        return "#4caf50"; // Xanh lá
      case ExpenseType.SHUTTLE:
        return "#2196f3"; // Xanh dương
      case ExpenseType.DRINK:
        return "#ff9800"; // Cam
      case ExpenseType.EQUIPMENT:
        return "#9c27b0"; // Tím
      case ExpenseType.OTHER:
        return "#e91e63"; // Hồng đậm - màu nổi bật hơn cho chi phí khác
      default:
        return "#607d8b"; // Xám xanh
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  if (!session || !calculatedExpenses) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Không tìm thấy thông tin</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {" "}
        <View style={styles.header}>
          <Text style={styles.dateText}>
            {format(new Date(session.date), "EEEE, dd/MM/yyyy", { locale: vi })}
          </Text>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>
              Thời gian: {format(new Date(session.date), "HH:mm")}
              {session.endTime
                ? ` - ${format(new Date(session.endTime), "HH:mm")}`
                : ""}
            </Text>
            {session.duration && (
              <Text style={styles.durationText}>
                Thời lượng:{" "}
                {Math.floor(session.duration / 60) > 0
                  ? `${Math.floor(session.duration / 60)} giờ ${
                      session.duration % 60
                    } phút`
                  : `${session.duration} phút`}
              </Text>
            )}
          </View>
          <Text style={styles.locationText}>{session.location}</Text>
          {session.notes && (
            <Text style={styles.notesText}>{session.notes}</Text>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách chi phí</Text>{" "}
          {session.expenses.map((expense) => {
            // Xác định màu sắc theo loại chi phí
            const expenseTypeColor = getExpenseTypeColor(expense.type);
            const hasCustomDivision =
              expense.divideAmong && expense.divideAmong.length > 0;

            return (
              <View
                key={expense.id}
                style={[
                  styles.expenseItem,
                  { borderLeftColor: expenseTypeColor, borderLeftWidth: 4 },
                ]}
              >
                <View style={styles.expenseHeader}>
                  <View style={styles.expenseTypeContainer}>
                    <Text
                      style={[styles.expenseType, { color: expenseTypeColor }]}
                    >
                      {getExpenseTypeLabel(expense.type)}
                    </Text>
                    {hasCustomDivision && (
                      <View
                        style={[
                          styles.customBadge,
                          { backgroundColor: expenseTypeColor },
                        ]}
                      >
                        <Text style={styles.customBadgeText}>Tùy chỉnh</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.expenseAmount,
                      expense.type === ExpenseType.OTHER
                        ? { fontWeight: "bold" }
                        : {},
                    ]}
                  >
                    {formatCurrency(expense.amount)}
                  </Text>
                </View>

                {expense.description && (
                  <Text
                    style={[
                      styles.expenseDescription,
                      expense.type === ExpenseType.OTHER
                        ? { fontStyle: "italic" }
                        : {},
                    ]}
                  >
                    {" "}
                    <Text>{expense.description}</Text>
                  </Text>
                )}

                {/* Display the specific players for custom expense division */}
                {hasCustomDivision && (
                  <View
                    style={[
                      styles.expensePlayers,
                      { backgroundColor: `${expenseTypeColor}08` },
                    ]}
                  >
                    <Text style={styles.expensePlayersLabel}>
                      Chi phí này được chia cho:
                    </Text>
                    <View style={styles.expensePlayersList}>
                      {expense.divideAmong.map((playerId) => {
                        const player = session.players.find(
                          (p) => p.id === playerId
                        );
                        return player ? (
                          <Text
                            key={playerId}
                            style={[
                              styles.expensePlayerName,
                              {
                                backgroundColor: `${expenseTypeColor}15`,
                                borderColor: expenseTypeColor,
                                color: expenseTypeColor,
                              },
                            ]}
                          >
                            {player.name}
                          </Text>
                        ) : null;
                      })}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
          <View style={styles.totalExpense}>
            <Text style={styles.totalExpenseLabel}>Tổng chi phí:</Text>{" "}
            <Text style={styles.totalExpenseAmount}>
              <Text>{formatCurrency(calculatedExpenses.totalAmount)}</Text>
            </Text>
          </View>
        </View>{" "}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Người tham gia ({session.players.length})
          </Text>
          {session.players.map((player) => (
            <View key={player.id} style={styles.playerItem}>
              <Text style={styles.playerName}>{player.name}</Text>{" "}
              <Text style={styles.playerAmount}>
                <Text>
                  {formatCurrency(
                    calculatedExpenses.splitByPlayer[player.id] || 0
                  )}
                </Text>
              </Text>
            </View>
          ))}
        </View>
        <ExpenseDistribution
          totalAmount={calculatedExpenses.totalAmount}
          playerAmounts={session.players.map((player) => ({
            id: player.id,
            name: player.name,
            amount: calculatedExpenses.splitByPlayer[player.id] || 0,
          }))}
        />{" "}
        <ShareButton
          session={session}
          calculatedExpenses={calculatedExpenses}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() =>
              navigation.navigate("EditSession", { sessionId: session.id })
            }
          >
            <Text style={styles.buttonText}>Chỉnh sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#777",
    fontStyle: "italic",
  },
  timeInfo: {
    marginVertical: 8,
  },
  timeText: {
    fontSize: 15,
    color: "#555",
    marginBottom: 4,
  },
  durationText: {
    fontSize: 15,
    color: "#555",
    marginBottom: 4,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  expenseItem: {
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  expenseTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  expenseType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  expenseDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    paddingTop: 6,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: "#f8f8f8",
  },
  customBadge: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  customBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  expensePlayers: {
    marginTop: 8,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  expensePlayersLabel: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 6,
    fontWeight: "500",
  },
  expensePlayersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  expensePlayerName: {
    fontSize: 12,
    color: "#4caf50",
    backgroundColor: "#f0fff0",
    borderWidth: 1,
    borderColor: "#4caf50",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 6,
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  totalExpense: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalExpenseLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalExpenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  playerName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#444",
  },
  playerAmount: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2e7d32",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  editButton: {
    backgroundColor: "#2196f3",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SessionDetailScreen;
