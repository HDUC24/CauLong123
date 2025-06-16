import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { format, subDays, isWithinInterval } from "date-fns";
import { vi } from "date-fns/locale";
import { getSessions } from "../services/storageService";
import { Session } from "../models/types";
import { formatCurrency } from "../utils/expenseUtils";
import Ionicons from "@expo/vector-icons/Ionicons";

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    timeRange: "all", // all, week, month, custom
    location: "",
  });
  const [sortOption, setSortOption] = useState("dateDesc"); // dateDesc, durationDesc, costDesc

  useEffect(() => {
    loadSessions();

    // Theo dõi thay đổi từ màn hình khác và cập nhật lại danh sách
    const unsubscribe = navigation.addListener("focus", () => {
      loadSessions();
    });

    return unsubscribe;
  }, [navigation]);

  // Apply filters when sessions or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [sessions, searchText, filterOptions, sortOption]);
  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await getSessions();
      // Sắp xếp theo ngày mới nhất
      const sortedSessions = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSessions(sortedSessions);
      setFilteredSessions(sortedSessions);
    } catch (error) {
      console.error("Lỗi khi tải sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...sessions];

    // Filter by search text (location or notes)
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(
        (session) =>
          session.location.toLowerCase().includes(lowerSearchText) ||
          (session.notes &&
            session.notes.toLowerCase().includes(lowerSearchText))
      );
    }

    // Filter by time range
    if (filterOptions.timeRange !== "all") {
      const today = new Date();
      const startDate =
        filterOptions.timeRange === "week"
          ? subDays(today, 7)
          : subDays(today, 30); // month

      result = result.filter((session) => {
        const sessionDate = new Date(session.date);
        return isWithinInterval(sessionDate, { start: startDate, end: today });
      });
    }

    // Filter by specific location
    if (filterOptions.location) {
      result = result.filter((session) =>
        session.location
          .toLowerCase()
          .includes(filterOptions.location.toLowerCase())
      );
    }

    // Sort the results based on the selected sort option
    result.sort((a, b) => {
      switch (sortOption) {
        case "dateDesc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "dateAsc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "durationDesc":
          return (b.duration || 0) - (a.duration || 0);
        case "durationAsc":
          return (a.duration || 0) - (b.duration || 0);
        case "costDesc":
          const totalCostB = b.expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );
          const totalCostA = a.expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );
          return totalCostB - totalCostA;
        case "costAsc":
          const totalCostAAsc = a.expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );
          const totalCostBAsc = b.expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );
          return totalCostAAsc - totalCostBAsc;
        default:
          return 0;
      }
    });

    setFilteredSessions(result);
  };

  const renderFilterModal = () => (
    <Modal
      visible={isFilterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {" "}
              <Text>Lọc buổi đánh cầu</Text> git add . git commit -m "Mô tả thay
            </Text>
            <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.filterLabel}>
              {" "}
              <Text>Khoảng thời gian:</Text>
            </Text>
            <View style={styles.timeRangeButtons}>
              {[
                { value: "all", label: "Tất cả" },
                { value: "week", label: "Tuần này" },
                { value: "month", label: "Tháng này" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeRangeButton,
                    filterOptions.timeRange === option.value &&
                      styles.timeRangeButtonActive,
                  ]}
                  onPress={() =>
                    setFilterOptions({
                      ...filterOptions,
                      timeRange: option.value,
                    })
                  }
                >
                  <Text
                    style={
                      filterOptions.timeRange === option.value
                        ? styles.timeRangeTextActive
                        : styles.timeRangeText
                    }
                  >
                    <Text>{option.label}</Text>
                  </Text>
                </TouchableOpacity>
              ))}
            </View>{" "}
            <Text style={styles.filterLabel}>
              <Text>Địa điểm:</Text>
            </Text>
            <TextInput
              style={styles.filterInput}
              value={filterOptions.location}
              onChangeText={(text) =>
                setFilterOptions({ ...filterOptions, location: text })
              }
              placeholder="Nhập tên địa điểm"
            />
            <Text style={styles.filterLabel}>
              <Text>Sắp xếp theo:</Text>
            </Text>
            <View style={styles.sortOptions}>
              {[
                { value: "dateDesc", label: "Mới nhất" },
                { value: "dateAsc", label: "Cũ nhất" },
                { value: "durationDesc", label: "Thời lượng" },
                { value: "costDesc", label: "Chi phí" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    sortOption === option.value && styles.sortOptionActive,
                  ]}
                  onPress={() => setSortOption(option.value)}
                >
                  <Text
                    style={
                      sortOption === option.value
                        ? styles.sortOptionTextActive
                        : styles.sortOptionText
                    }
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}{" "}
            </View>
            <Text style={styles.filterLabel}>
              <Text>Sắp xếp theo:</Text>
            </Text>
            <View style={styles.sortOptions}>
              {[
                { value: "dateDesc", label: "Ngày (mới nhất trước)" },
                { value: "dateAsc", label: "Ngày (cũ nhất trước)" },
                { value: "durationDesc", label: "Thời gian (giảm dần)" },
                { value: "durationAsc", label: "Thời gian (tăng dần)" },
                { value: "costDesc", label: "Chi phí (cao đến thấp)" },
                { value: "costAsc", label: "Chi phí (thấp đến cao)" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    sortOption === option.value && styles.sortOptionActive,
                  ]}
                  onPress={() => setSortOption(option.value)}
                >
                  <Text
                    style={
                      sortOption === option.value
                        ? styles.sortOptionTextActive
                        : styles.sortOptionText
                    }
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setFilterOptions({ timeRange: "all", location: "" });
                  setSearchText("");
                  setSortOption("dateDesc");
                }}
              >
                <Text style={styles.resetButtonText}>
                  <Text>Đặt lại</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>
                  <Text>Áp dụng</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderItem = ({ item }: { item: Session }) => {
    // Tính tổng chi phí của buổi đánh cầu
    const totalExpense = item.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    return (
      <TouchableOpacity
        style={styles.sessionItem}
        onPress={() =>
          navigation.navigate("SessionDetail", { sessionId: item.id })
        }
      >
        <View style={styles.sessionHeader}>
          {" "}
          <Text style={styles.sessionDate}>
            <Text>
              {format(new Date(item.date), "EEEE, dd/MM/yyyy", { locale: vi })}
            </Text>
          </Text>
          <Text style={styles.sessionLocation}>
            <Text>{item.location}</Text>
          </Text>
        </View>
        <View style={styles.sessionInfo}>
          <View style={styles.sessionInfoLeft}>
            <Text style={styles.playerCount}>
              {item.players.length} <Text>người tham gia</Text>
            </Text>
            {item.duration && (
              <Text style={styles.sessionDuration}>
                <Text>
                  {Math.floor(item.duration / 60) > 0
                    ? `${Math.floor(item.duration / 60)} giờ ${
                        item.duration % 60
                      } phút`
                    : `${item.duration} phút`}
                </Text>
              </Text>
            )}
          </View>{" "}
          <Text style={styles.expenseAmount}>
            <Text>{formatCurrency(totalExpense)}</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo địa điểm..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Ionicons name="options" size={20} color="#4caf50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isLoading
              ? "Đang tải..."
              : filteredSessions.length === 0 && sessions.length > 0
              ? "Không tìm thấy kết quả nào."
              : "Chưa có buổi đánh cầu nào. Thêm buổi đánh cầu mới!"}
          </Text>
        }
      />

      {renderFilterModal()}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("NewSession")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
  },
  filterButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4caf50",
    borderRadius: 18,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  // ... existing session item styles ...

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
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 12,
    color: "#333",
  },
  timeRangeButtons: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    alignItems: "center",
  },
  timeRangeButtonActive: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  timeRangeText: {
    color: "#555",
  },
  timeRangeTextActive: {
    color: "white",
    fontWeight: "500",
  },
  filterInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  sortOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  sortOptionActive: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  sortOptionText: {
    color: "#555",
    fontSize: 13,
  },
  sortOptionTextActive: {
    color: "white",
    fontWeight: "500",
    fontSize: 13,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  resetButtonText: {
    color: "#666",
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#666",
  },

  // Keep existing styles
  sessionItem: {
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
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sessionLocation: {
    fontSize: 14,
    color: "#666",
  },
  sessionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  sessionInfoLeft: {
    flexDirection: "column",
  },
  playerCount: {
    fontSize: 14,
    color: "#555",
  },
  sessionDuration: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
});

export default HomeScreen;
