import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { CrossPlatformAlert as Alert } from "../utils";
import { getPlayers, deletePlayer } from "../services/storageService";
import { Player } from "../models/types";
import { useNavigation } from "@react-navigation/native";

const PlayersScreen = () => {
  const navigation = useNavigation<any>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayers();

    // Reload khi quay lại màn hình
    const unsubscribe = navigation.addListener("focus", () => {
      loadPlayers();
    });

    return unsubscribe;
  }, [navigation]);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const data = await getPlayers();
      // Sắp xếp theo tên
      const sortedPlayers = [...data].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setPlayers(sortedPlayers);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người chơi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlayer = (player: Player) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa người chơi "${player.name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlayer(player.id);
              loadPlayers();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa người chơi");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Player }) => (
    <View style={styles.playerItem}>
      <Text style={styles.playerName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePlayer(item)}
      >
        <Text style={styles.deleteButtonText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={players}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isLoading
              ? "Đang tải..."
              : "Chưa có người chơi nào. Hãy thêm người chơi mới!"}
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddPlayer")}
      >
        <Text style={styles.addButtonText}>+ Thêm người chơi</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  playerName: {
    fontSize: 16,
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#4caf50",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PlayersScreen;
