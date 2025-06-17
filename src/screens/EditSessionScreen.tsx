import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { CrossPlatformAlert as Alert } from "../utils";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import WebDateTimePicker from "../components/web/WebDateTimePicker";
import {
  getPlayers,
  getSessions,
  updateSession,
} from "../services/storageService";
import { ExpenseType, Player, Expense, Session } from "../models/types";
import { generateId, formatCurrency } from "../utils/expenseUtils";

type RouteParams = {
  EditSession: {
    sessionId: string;
  };
};

const EditSessionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, "EditSession">>();
  const { sessionId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [originalSession, setOriginalSession] = useState<Session | null>(null);
  const [date, setDate] = useState(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [courtFeePerHour, setCourtFeePerHour] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentExpense, setCurrentExpense] = useState<{
    type: ExpenseType;
    amount: string;
    description: string;
    divideAmong?: string[];
  }>({
    type: ExpenseType.COURT_FEE,
    amount: "",
    description: "",
    divideAmong: [],
  });

  useEffect(() => {
    loadSession();
    loadPlayers();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const sessions = await getSessions();
      const session = sessions.find((s) => s.id === sessionId);

      if (session) {
        setOriginalSession(session);

        // Set the form values from the session
        setDate(new Date(session.date));
        setLocation(session.location);
        setNotes(session.notes || "");
        setExpenses([...session.expenses]);
        setSelectedPlayers(session.players.map((player) => player.id));

        // Set end time if available
        if (session.endTime) {
          setEndTime(new Date(session.endTime));
        }

        // Set court fee per hour if available
        if (session.courtFeePerHour) {
          setCourtFeePerHour(session.courtFeePerHour.toString());
        }
      } else {
        Alert.alert("Lỗi", "Không tìm thấy buổi đánh cầu");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin buổi đánh cầu:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin buổi đánh cầu");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlayers = async () => {
    try {
      const players = await getPlayers();
      setAllPlayers(players);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người chơi:", error);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Handle end time selection
  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  // Calculate duration between start and end time in minutes
  const calculateDuration = (): number | undefined => {
    if (date && endTime) {
      const startDate = new Date(date);
      const end = new Date(endTime);

      // Set the end time to use the same date as the start time
      end.setFullYear(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );

      // If end time is earlier than start time, assume it's the next day
      if (end < startDate) {
        end.setDate(end.getDate() + 1);
      }

      // Calculate duration in minutes
      return Math.round((end.getTime() - startDate.getTime()) / (1000 * 60));
    }
    return undefined;
  };

  // Calculate court fee based on duration and hourly rate
  const calculateCourtFee = (): number => {
    const duration = calculateDuration();
    if (duration && courtFeePerHour) {
      const hourlyRate = parseFloat(courtFeePerHour);
      const hours = duration / 60;
      return Math.round(hourlyRate * hours);
    }
    return 0;
  };

  // Add court fee from hourly rate
  const addCourtFeeFromRate = () => {
    if (!courtFeePerHour || parseFloat(courtFeePerHour) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập giá thuê sân hợp lệ");
      return;
    }

    if (!endTime) {
      Alert.alert(
        "Lỗi",
        "Vui lòng chọn thời gian kết thúc để tính chi phí thuê sân"
      );
      return;
    }

    const fee = calculateCourtFee();
    if (fee <= 0) {
      Alert.alert("Lỗi", "Không thể tính chi phí thuê sân");
      return;
    }

    const duration = calculateDuration();
    let hours = 0;
    let minutes = 0;

    if (duration) {
      hours = Math.floor(duration / 60);
      minutes = duration % 60;
    }

    const hourText = hours > 0 ? hours + " giờ " : "";
    const minuteText = minutes > 0 ? minutes + " phút" : "";
    const durationText = hourText + minuteText;

    const rateText = formatCurrency(parseFloat(courtFeePerHour)) + "/giờ";
    const desc = "Sân " + durationText + " (" + rateText + ")";

    const newExpense = {
      id: generateId(),
      type: ExpenseType.COURT_FEE,
      amount: fee,
      description: desc,
    };

    setExpenses([...expenses, newExpense]);
    Alert.alert("Thành công", "Đã thêm chi phí thuê sân");
  };

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
    } else {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  // Toggle a player in the divideAmong list
  const togglePlayerInExpense = (playerId: string) => {
    const divideAmong = currentExpense.divideAmong || [];

    if (divideAmong.includes(playerId)) {
      // Remove player
      setCurrentExpense({
        ...currentExpense,
        divideAmong: divideAmong.filter((id) => id !== playerId),
      });
    } else {
      // Add player
      setCurrentExpense({
        ...currentExpense,
        divideAmong: [...divideAmong, playerId],
      });
    }
  };

  // Reset divideAmong when expense type changes
  const handleExpenseTypeChange = (type: ExpenseType) => {
    setCurrentExpense({
      ...currentExpense,
      type,
      // Only keep divideAmong if it's a type that uses custom division
      divideAmong: shouldShowPlayerSelection(type)
        ? currentExpense.divideAmong || []
        : [],
    });
  };
  const handleAddExpense = () => {
    if (!currentExpense.amount || parseFloat(currentExpense.amount) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    // For non-general expense types, check if players are selected
    if (
      shouldShowPlayerSelection(currentExpense.type) &&
      (!currentExpense.divideAmong || currentExpense.divideAmong.length === 0)
    ) {
      Alert.alert(
        "Chưa chọn người tham gia",
        "Vui lòng chọn ít nhất một người tham gia để chi trả chi phí này."
      );
      return;
    }

    const newExpense: Expense = {
      id: generateId(),
      type: currentExpense.type,
      amount: parseFloat(currentExpense.amount),
      description: currentExpense.description,
      divideAmong: currentExpense.divideAmong?.length
        ? currentExpense.divideAmong
        : undefined,
    };

    setExpenses([...expenses, newExpense]);
    setCurrentExpense({
      type: ExpenseType.COURT_FEE,
      amount: "",
      description: "",
      divideAmong: [],
    });
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
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

  const shouldShowPlayerSelection = (type: ExpenseType): boolean => {
    return [
      ExpenseType.DRINK,
      ExpenseType.EQUIPMENT,
      ExpenseType.OTHER,
    ].includes(type);
  };

  const handleSubmit = async () => {
    if (!location.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa điểm đánh cầu");
      return;
    }

    if (selectedPlayers.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một người tham gia");
      return;
    }

    if (expenses.length === 0) {
      Alert.alert("Lỗi", "Vui lòng thêm ít nhất một khoản chi phí");
      return;
    }

    if (!originalSession) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin gốc của buổi đánh cầu");
      return;
    }

    try {
      const selectedPlayerObjects = allPlayers.filter((p) =>
        selectedPlayers.includes(p.id)
      ); // Calculate duration if end time is set
      const duration = calculateDuration();

      // Parse court fee per hour if provided
      const hourlyFee = courtFeePerHour
        ? parseFloat(courtFeePerHour)
        : undefined;

      await updateSession({
        ...originalSession,
        date: date.toISOString(),
        endTime: endTime ? endTime.toISOString() : undefined,
        duration: duration,
        courtFeePerHour: hourlyFee,
        location: location.trim(),
        notes: notes.trim() || undefined,
        players: selectedPlayerObjects,
        expenses: expenses,
      });

      Alert.alert("Thành công", "Đã cập nhật buổi đánh cầu", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật buổi đánh cầu");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {format(date, "EEEE, dd/MM/yyyy", { locale: vi })}
          </Text>
        </TouchableOpacity>        {showDatePicker && (
          <WebDateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        <View style={styles.timeInputContainer}>
          <Text style={styles.timeInputLabel}>Thời gian bắt đầu:</Text>
          <TouchableOpacity
            style={styles.timeInput}
            onPress={() => {
              const now = new Date();
              setDate((prev) => {
                const newDate = new Date(prev);
                newDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
                return newDate;
              });
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.timeText}>{format(date, "HH:mm")}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timeInputContainer}>
          <Text style={styles.timeInputLabel}>Thời gian kết thúc:</Text>
          <TouchableOpacity
            style={styles.timeInput}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={styles.timeText}>
              {endTime ? format(endTime, "HH:mm") : "Chọn giờ kết thúc"}
            </Text>
          </TouchableOpacity>
        </View>        {showEndTimePicker && (
          <WebDateTimePicker
            value={endTime || new Date()}
            mode="time"
            display="default"
            onChange={handleEndTimeChange}
          />
        )}{" "}
        <TextInput
          style={styles.input}
          placeholder="Địa điểm"
          value={location}
          onChangeText={setLocation}
        />
        <View style={styles.feeContainer}>
          <Text style={styles.feeLabel}>Giá thuê sân (VNĐ/1 giờ):</Text>
          <TextInput
            style={styles.feeInput}
            placeholder="Nhập giá sân"
            value={courtFeePerHour}
            onChangeText={(value) =>
              setCourtFeePerHour(value.replace(/[^0-9]/g, ""))
            }
            keyboardType="numeric"
          />
        </View>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Ghi chú (không bắt buộc)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Người tham gia</Text>

        <View style={styles.playerList}>
          {allPlayers.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerItem,
                selectedPlayers.includes(player.id) &&
                  styles.playerItemSelected,
              ]}
              onPress={() => togglePlayerSelection(player.id)}
            >
              <Text
                style={[
                  styles.playerName,
                  selectedPlayers.includes(player.id) &&
                    styles.playerNameSelected,
                ]}
              >
                {player.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chi phí</Text>

        {expenses.length > 0 && (
          <View style={styles.expenseList}>
            {expenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseHeader}>
                  {" "}
                  <Text style={styles.expenseType}>
                    <Text>{getExpenseTypeLabel(expense.type)}</Text>
                  </Text>{" "}
                  <Text style={styles.expenseAmount}>
                    <Text>{formatCurrency(expense.amount)}</Text>
                  </Text>
                </View>

                {expense.description && (
                  <Text style={styles.expenseDescription}>
                    {" "}
                    <Text>{expense.description}</Text>
                  </Text>
                )}

                {/* Display the specific players for custom expense division */}
                {expense.divideAmong && expense.divideAmong.length > 0 && (
                  <View style={styles.expensePlayers}>
                    <Text style={styles.expensePlayersLabel}>
                      Chi phí chia cho:
                    </Text>
                    <View style={styles.expensePlayersList}>
                      {expense.divideAmong.map((playerId) => {
                        const player = allPlayers.find(
                          (p) => p.id === playerId
                        );
                        return player ? (
                          <Text key={playerId} style={styles.expensePlayerName}>
                            <Text>{player.name}</Text>
                          </Text>
                        ) : null;
                      })}
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeExpense(expense.id)}
                >
                  <Text style={styles.removeButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.newExpenseContainer}>
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>Loại chi phí:</Text>
            <View style={styles.selectOptions}>
              {Object.values(ExpenseType).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.selectOption,
                    currentExpense.type === type && styles.selectOptionSelected,
                  ]}
                  onPress={() => handleExpenseTypeChange(type)}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      currentExpense.type === type &&
                        styles.selectOptionTextSelected,
                    ]}
                  >
                    {getExpenseTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Số tiền"
            value={currentExpense.amount}
            onChangeText={(value) =>
              setCurrentExpense({
                ...currentExpense,
                amount: value.replace(/[^0-9]/g, ""),
              })
            }
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Mô tả (không bắt buộc)"
            value={currentExpense.description}
            onChangeText={(value) =>
              setCurrentExpense({ ...currentExpense, description: value })
            }
          />{" "}
          {shouldShowPlayerSelection(currentExpense.type) && (
            <View style={styles.playerSelectionContainer}>
              <Text style={styles.playerSelectionLabel}>
                Chia sẻ chi phí cho:
              </Text>
              <View style={styles.playerSelectionList}>
                {allPlayers.map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={[
                      styles.playerSelectItem,
                      currentExpense.divideAmong?.includes(player.id) &&
                        styles.playerSelectItemSelected,
                    ]}
                    onPress={() => togglePlayerInExpense(player.id)}
                  >
                    <Text
                      style={[
                        styles.playerSelectName,
                        currentExpense.divideAmong?.includes(player.id) &&
                          styles.playerSelectNameSelected,
                      ]}
                    >
                      {player.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <TouchableOpacity
            style={styles.addExpenseButton}
            onPress={handleAddExpense}
          >
            <Text style={styles.addExpenseButtonText}>Thêm chi phí</Text>
          </TouchableOpacity>
          {courtFeePerHour && endTime && (
            <TouchableOpacity
              style={[styles.addExpenseButton, styles.courtFeeButton]}
              onPress={addCourtFeeFromRate}
            >
              {" "}
              <Text style={styles.addExpenseButtonText}>
                <Text>
                  Tính tiền sân (
                  {formatCurrency(parseFloat(courtFeePerHour) || 0)}/giờ)
                </Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            <Text>Cập nhật</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  dateInput: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timeInputLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  timeInput: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  timeText: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
  },
  input: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  playerList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  playerItem: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  playerItemSelected: {
    backgroundColor: "#4caf50",
  },
  playerName: {
    fontSize: 14,
    color: "#444",
  },
  playerNameSelected: {
    color: "white",
  },
  newPlayerContainer: {
    flexDirection: "row",
  },
  newPlayerInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    fontSize: 16,
  },
  addPlayerButton: {
    backgroundColor: "#2196f3",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  addPlayerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  expenseList: {
    marginBottom: 16,
  },
  expenseItem: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  expenseType: {
    fontSize: 15,
    fontWeight: "500",
    color: "#444",
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  expenseDescription: {
    fontSize: 14,
    color: "#777",
    marginBottom: 8,
  },
  removeButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#f44336",
    borderRadius: 4,
  },
  removeButtonText: {
    color: "white",
    fontSize: 12,
  },
  newExpenseContainer: {
    marginTop: 8,
  },
  selectContainer: {
    marginBottom: 12,
  },
  selectLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  selectOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectOption: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    margin: 4,
  },
  selectOptionSelected: {
    backgroundColor: "#2196f3",
  },
  selectOptionText: {
    fontSize: 14,
    color: "#444",
  },
  selectOptionTextSelected: {
    color: "white",
    fontWeight: "500",
  },
  addExpenseButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addExpenseButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  feeContainer: {
    marginBottom: 12,
  },
  feeLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  feeInput: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  courtFeeButton: {
    backgroundColor: "#2196f3",
    marginTop: 8,
  },
  playerSelectionContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  playerSelectionLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  playerSelectionList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  playerSelectItem: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  playerSelectItemSelected: {
    backgroundColor: "#4caf50",
  },
  playerSelectName: {
    fontSize: 14,
    color: "#444",
  },
  playerSelectNameSelected: {
    color: "white",
  },
  expensePlayers: {
    marginTop: 6,
    marginBottom: 8,
  },
  expensePlayersLabel: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
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
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 4,
  },
});

export default EditSessionScreen;
