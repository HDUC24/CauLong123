import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getSessions } from "../services/storageService";
import { Session, ExpenseType } from "../models/types";
import { formatCurrency } from "../utils/expenseUtils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const StatsScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [statsView, setStatsView] = useState<"byMonth" | "byType" | "byPlayer">(
    "byMonth"
  );

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const loadedSessions = await getSessions();
      // Sắp xếp theo ngày mới nhất đến cũ nhất
      const sortedSessions = loadedSessions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSessions(sortedSessions);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu phiên:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu thống kê");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lấy tên tháng từ date
  const getMonthYearKey = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Hàm lấy tên hiển thị cho tháng
  const getMonthYearDisplay = (monthYearKey: string) => {
    const [month, year] = monthYearKey.split("/");
    return `Tháng ${month}/${year}`;
  };

  // Tính toán thống kê theo tháng
  const getStatsByMonth = () => {
    const monthStats: { [key: string]: { total: number; sessions: number } } =
      {};

    sessions.forEach((session) => {
      const monthYearKey = getMonthYearKey(session.date);

      if (!monthStats[monthYearKey]) {
        monthStats[monthYearKey] = { total: 0, sessions: 0 };
      }

      session.expenses.forEach((expense) => {
        monthStats[monthYearKey].total += expense.amount;
      });

      monthStats[monthYearKey].sessions += 1;
    });

    return Object.keys(monthStats)
      .sort((a, b) => {
        const [monthA, yearA] = a.split("/").map(Number);
        const [monthB, yearB] = b.split("/").map(Number);

        if (yearA !== yearB) {
          return yearB - yearA;
        }
        return monthB - monthA;
      })
      .map((key) => ({
        label: getMonthYearDisplay(key),
        total: monthStats[key].total,
        sessions: monthStats[key].sessions,
      }));
  };

  // Tính toán thống kê theo loại chi phí
  const getStatsByType = () => {
    const typeStats: { [key in ExpenseType]: number } = {
      [ExpenseType.COURT_FEE]: 0,
      [ExpenseType.SHUTTLE]: 0,
      [ExpenseType.DRINK]: 0,
      [ExpenseType.EQUIPMENT]: 0,
      [ExpenseType.OTHER]: 0,
    };

    sessions.forEach((session) => {
      session.expenses.forEach((expense) => {
        typeStats[expense.type] += expense.amount;
      });
    });

    return Object.entries(typeStats)
      .map(([type, amount]) => ({
        type: type as ExpenseType,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Tính toán thống kê theo người chơi
  const getStatsByPlayer = () => {
    const playerStats: {
      [playerId: string]: { name: string; sessions: number; totalPaid: number };
    } = {};

    sessions.forEach((session) => {
      // Tổng chi phí cho buổi này
      let sessionTotal = 0;
      session.expenses.forEach((expense) => {
        sessionTotal += expense.amount;
      });

      // Tính số người tham gia
      const playerCount = session.players.length;
      if (playerCount === 0) return;

      // Chia đều chi phí
      const perPlayerCost = sessionTotal / playerCount;

      // Cập nhật thống kê cho từng người chơi
      session.players.forEach((player) => {
        if (!playerStats[player.id]) {
          playerStats[player.id] = {
            name: player.name,
            sessions: 0,
            totalPaid: 0,
          };
        }

        playerStats[player.id].sessions += 1;
        playerStats[player.id].totalPaid += perPlayerCost;
      });
    });

    return Object.values(playerStats).sort((a, b) => b.totalPaid - a.totalPaid);
  };

  // Lấy tên hiển thị cho loại chi phí
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

  const renderByMonth = () => {
    const monthlyStats = getStatsByMonth();

    if (monthlyStats.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Không có dữ liệu</Text>
        </View>
      );
    }

    return (
      <View style={styles.statsContainer}>
        {monthlyStats.map((item, index) => (
          <View key={index} style={styles.statsCard}>
            <Text style={styles.statsTitle}>{item.label}</Text>
            <Text style={styles.statsSubtitle}>{item.sessions} buổi chơi</Text>
            <Text style={styles.statsAmount}>
              {formatCurrency(item.total)}
            </Text>{" "}
            <Text style={styles.statsAverage}>
              <Text>Trung bình: </Text>
              <Text>{formatCurrency(item.total / item.sessions)} / buổi</Text>
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderByType = () => {
    const typeStats = getStatsByType();
    const totalExpenses = typeStats.reduce((sum, item) => sum + item.amount, 0);

    if (totalExpenses === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Không có dữ liệu</Text>
        </View>
      );
    }

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsSummary}>
          <Text style={styles.statsTotalLabel}>Tổng chi phí:</Text>
          <Text style={styles.statsTotal}>{formatCurrency(totalExpenses)}</Text>
        </View>

        {typeStats.map((item, index) => (
          <View key={index} style={styles.statsRow}>
            <View style={styles.statsTypeInfo}>
              <Text style={styles.statsTypeLabel}>
                {getExpenseTypeLabel(item.type)}
              </Text>
              <Text style={styles.statsTypePercentage}>
                {Math.round((item.amount / totalExpenses) * 100)}%
              </Text>
            </View>
            <Text style={styles.statsTypeAmount}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderByPlayer = () => {
    const playerStats = getStatsByPlayer();

    if (playerStats.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Không có dữ liệu</Text>
        </View>
      );
    }

    return (
      <View style={styles.statsContainer}>
        {playerStats.map((item, index) => (
          <View key={index} style={styles.statsCard}>
            <Text style={styles.statsTitle}>{item.name}</Text>
            <Text style={styles.statsSubtitle}>
              {item.sessions} lần tham gia
            </Text>
            <Text style={styles.statsAmount}>
              {formatCurrency(item.totalPaid)}
            </Text>{" "}
            <Text style={styles.statsAverage}>
              <Text>Trung bình: </Text>
              <Text>
                {formatCurrency(item.totalPaid / item.sessions)} / lần
              </Text>
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, statsView === "byMonth" && styles.activeTab]}
          onPress={() => setStatsView("byMonth")}
        >
          <Text
            style={[
              styles.tabText,
              statsView === "byMonth" && styles.activeTabText,
            ]}
          >
            Theo tháng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, statsView === "byType" && styles.activeTab]}
          onPress={() => setStatsView("byType")}
        >
          <Text
            style={[
              styles.tabText,
              statsView === "byType" && styles.activeTabText,
            ]}
          >
            Theo loại
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, statsView === "byPlayer" && styles.activeTab]}
          onPress={() => setStatsView("byPlayer")}
        >
          <Text
            style={[
              styles.tabText,
              statsView === "byPlayer" && styles.activeTabText,
            ]}
          >
            Theo người chơi
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4caf50" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            {statsView === "byMonth" && renderByMonth()}
            {statsView === "byType" && renderByType()}
            {statsView === "byPlayer" && renderByPlayer()}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4caf50",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#4caf50",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  statsContainer: {
    paddingBottom: 20,
  },
  statsCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  statsAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  statsAverage: {
    fontSize: 14,
    color: "#666",
  },
  statsSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statsTotalLabel: {
    fontSize: 16,
    color: "#333",
  },
  statsTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statsTypeInfo: {
    flex: 1,
  },
  statsTypeLabel: {
    fontSize: 16,
    color: "#333",
  },
  statsTypePercentage: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  statsTypeAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2e7d32",
  },
});

export default StatsScreen;
