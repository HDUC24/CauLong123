import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { CrossPlatformAlert as Alert } from "../utils";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getPlayers, addPlayer, addSession } from "../services/storageService";
import { ExpenseType, Player, Expense } from "../models/types";
import { generateId, formatCurrency } from "../utils/expenseUtils";
import WebDateTimePicker from "../components/web/WebDateTimePicker";

const NewSessionScreen = () => {
  const navigation = useNavigation<any>();
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
    loadPlayers();
  }, []);

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

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên người chơi");
      return;
    }

    try {
      const newPlayer = await addPlayer(newPlayerName.trim());
      setAllPlayers([...allPlayers, newPlayer]);
      setSelectedPlayers([...selectedPlayers, newPlayer.id]);
      setNewPlayerName("");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm người chơi mới");
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
    } else {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
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
    try {
      const selectedPlayerObjects = allPlayers.filter((p) =>
        selectedPlayers.includes(p.id)
      ); // Calculate duration if end time is set
      const duration = calculateDuration();

      // Parse court fee per hour if provided
      const hourlyFee = courtFeePerHour
        ? parseFloat(courtFeePerHour)
        : undefined;

      await addSession({
        date: date.toISOString(),
        endTime: endTime ? endTime.toISOString() : undefined,
        duration: duration,
        courtFeePerHour: hourlyFee,
        location: location.trim(),
        notes: notes.trim() || undefined,
        players: selectedPlayerObjects,
        expenses: expenses,
      });

      Alert.alert("Thành công", "Đã thêm buổi đánh cầu mới", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu buổi đánh cầu");
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

  // Helper to check if expense type should show player selection
  const shouldShowPlayerSelection = (type: ExpenseType): boolean => {
    return [
      ExpenseType.DRINK,
      ExpenseType.EQUIPMENT,
      ExpenseType.OTHER,
    ].includes(type);
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

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.label}>Ngày</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePicker}
          >
            <Text style={styles.dateText}>
              {format(date, "dd/MM/yyyy", { locale: vi })}
            </Text>
          </TouchableOpacity>          {showDatePicker && (
            <WebDateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Thời gian kết thúc</Text>
          <TouchableOpacity
            onPress={() => setShowEndTimePicker(true)}
            style={styles.datePicker}
          >
            <Text style={styles.dateText}>
              {endTime
                ? format(endTime, "HH:mm", { locale: vi })
                : "Chưa chọn thời gian"}
            </Text>
          </TouchableOpacity>          {showEndTimePicker && (
            <WebDateTimePicker
              value={endTime || new Date()}
              mode="time"
              display="default"
              onChange={handleEndTimeChange}
            />
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Địa điểm</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Giá thuê sân (VNĐ/giờ)</Text>
          <TextInput
            style={styles.input}
            value={courtFeePerHour}
            onChangeText={setCourtFeePerHour}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Người chơi</Text>
          <View style={styles.playersContainer}>
            {allPlayers.map((player) => (
              <TouchableOpacity
                key={player.id}
                onPress={() => togglePlayerSelection(player.id)}
                style={[
                  styles.playerButton,
                  selectedPlayers.includes(player.id) && styles.selectedPlayer,
                ]}
              >
                <Text
                  style={[
                    styles.playerName,
                    selectedPlayers.includes(player.id) &&
                      styles.selectedPlayerText,
                  ]}
                >
                  {player.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.addPlayerContainer}>
            <TextInput
              style={styles.addPlayerInput}
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              placeholder="Nhập tên người chơi mới"
            />
            <TouchableOpacity
              onPress={handleAddPlayer}
              style={styles.addPlayerButton}
            >
              <Text style={styles.addPlayerButtonText}>
                <Text>Thêm</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Chi phí</Text>
          {expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              {" "}
              <Text style={styles.expenseText}>
                <Text>{getExpenseTypeLabel(expense.type)}: </Text>
                <Text>{formatCurrency(expense.amount)} </Text>
                <TouchableOpacity
                  onPress={() => removeExpense(expense.id)}
                  style={styles.removeExpenseButton}
                >
                  <Text style={styles.removeExpenseButtonText}>
                    <Text>X</Text>
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          ))}
          <View style={styles.addExpenseContainer}>
            {" "}
            <View style={styles.expenseTypeSelector}>
              <Text style={styles.expenseTypeLabel}>Loại chi phí:</Text>
              <View style={styles.expenseTypeOptions}>
                {Object.values(ExpenseType).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.expenseTypeOption,
                      currentExpense.type === type &&
                        styles.selectedExpenseType,
                    ]}
                    onPress={() => handleExpenseTypeChange(type)}
                  >
                    <Text
                      style={[
                        styles.expenseTypeText,
                        currentExpense.type === type &&
                          styles.selectedExpenseTypeText,
                      ]}
                    >
                      {getExpenseTypeLabel(type)}
                    </Text>
                    <View style={styles.radioContainer}>
                      <View
                        style={[
                          styles.radioOuter,
                          currentExpense.type === type &&
                            styles.radioOuterSelected,
                        ]}
                      >
                        {currentExpense.type === type && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TextInput
              style={styles.expenseInput}
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
              style={styles.expenseInput}
              placeholder="Mô tả (không bắt buộc)"
              value={currentExpense.description}
              onChangeText={(value) =>
                setCurrentExpense({ ...currentExpense, description: value })
              }
            />
            {shouldShowPlayerSelection(currentExpense.type) && (
              <View style={styles.playerSelectionContainer}>
                <Text style={styles.playerSelectionLabel}>
                  Chia chi phí cho:
                </Text>
                <View style={styles.playerSelectionList}>
                  {" "}
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
                      <View style={styles.checkboxContainer}>
                        <View
                          style={[
                            styles.checkbox,
                            currentExpense.divideAmong?.includes(player.id) &&
                              styles.checkboxSelected,
                          ]}
                        >
                          {currentExpense.divideAmong?.includes(player.id) && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                      </View>
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
              onPress={handleAddExpense}
              style={styles.addExpenseButton}
            >
              <Text style={styles.addExpenseButtonText}>
                <Text>Thêm chi phí</Text>
              </Text>
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
        </View>{" "}
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>
            <Text>Lưu buổi đánh cầu</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  datePicker: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 16,
  },
  playersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  playerButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#f0f8ff",
  },
  selectedPlayer: {
    backgroundColor: "#007bff",
  },
  playerName: {
    fontSize: 16,
    color: "#007bff",
  },
  selectedPlayerText: {
    color: "#fff",
  },
  addPlayerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  addPlayerInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    fontSize: 16,
    marginRight: 8,
  },
  addPlayerButton: {
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addPlayerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  expenseItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseText: {
    fontSize: 16,
  },
  removeExpenseButton: {
    padding: 8,
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
  },
  removeExpenseButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addExpenseContainer: {
    flexDirection: "column",
    width: "100%",
    marginTop: 16,
  },
  expenseTypeSelector: {
    marginBottom: 16,
    width: "100%",
  },
  expenseTypeLabel: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  expenseTypeOptions: {
    flexDirection: "column",
    width: "100%",
  },
  expenseTypeOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#4caf50",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f0fff0",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedExpenseType: {
    backgroundColor: "#4caf50",
  },
  expenseTypeText: {
    fontSize: 15,
    color: "#4caf50",
    fontWeight: "500",
    flex: 1,
  },
  selectedExpenseTypeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  expenseInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  playerSelectionContainer: {
    marginBottom: 12,
  },
  playerSelectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  playerSelectionList: {
    flexDirection: "column",
    width: "100%",
  },
  playerSelectItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#4caf50",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f0fff0",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  playerSelectItemSelected: {
    backgroundColor: "#4caf50",
  },
  playerSelectName: {
    fontSize: 15,
    color: "#4caf50",
    flex: 1,
    fontWeight: "500",
  },
  playerSelectNameSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  addExpenseButton: {
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  addExpenseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#4caf50",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxSelected: {
    backgroundColor: "#4caf50",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  radioContainer: {
    marginLeft: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  radioOuterSelected: {
    borderColor: "#4caf50",
    backgroundColor: "#f0fff0",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4caf50",
  },
  courtFeeButton: {
    backgroundColor: "#2196f3",
  },
  submitButton: {
    backgroundColor: "#4caf50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NewSessionScreen;
