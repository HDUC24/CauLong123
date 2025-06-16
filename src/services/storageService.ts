import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, Player } from '../models/types';
import { generateId } from '../utils/expenseUtils';

// Keys for AsyncStorage
const SESSIONS_KEY = 'badminton_sessions';
const PLAYERS_KEY = 'badminton_players';

/**
 * Lưu danh sách buổi đánh cầu vào bộ nhớ
 */
export const saveSessions = async (sessions: Session[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Lỗi khi lưu sessions:', error);
    throw error;
  }
};

/**
 * Lấy danh sách buổi đánh cầu từ bộ nhớ
 */
export const getSessions = async (): Promise<Session[]> => {
  try {
    const sessions = await AsyncStorage.getItem(SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Lỗi khi đọc sessions:', error);
    return [];
  }
};

/**
 * Thêm một buổi đánh cầu mới
 */
export const addSession = async (session: Omit<Session, 'id'>): Promise<Session> => {
  try {
    const sessions = await getSessions();
    const newSession: Session = {
      ...session,
      id: generateId(),
    };
    
    sessions.push(newSession);
    await saveSessions(sessions);
    return newSession;
  } catch (error) {
    console.error('Lỗi khi thêm session:', error);
    throw error;
  }
};

/**
 * Cập nhật một buổi đánh cầu
 */
export const updateSession = async (updatedSession: Session): Promise<void> => {
  try {
    const sessions = await getSessions();
    const index = sessions.findIndex(s => s.id === updatedSession.id);
    
    if (index !== -1) {
      sessions[index] = updatedSession;
      await saveSessions(sessions);
    } else {
      throw new Error('Không tìm thấy buổi đánh cầu để cập nhật');
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật session:', error);
    throw error;
  }
};

/**
 * Xóa một buổi đánh cầu
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const sessions = await getSessions();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    await saveSessions(updatedSessions);
  } catch (error) {
    console.error('Lỗi khi xóa session:', error);
    throw error;
  }
};

/**
 * Lưu danh sách người chơi vào bộ nhớ
 */
export const savePlayers = async (players: Player[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  } catch (error) {
    console.error('Lỗi khi lưu players:', error);
    throw error;
  }
};

/**
 * Lấy danh sách người chơi từ bộ nhớ
 */
export const getPlayers = async (): Promise<Player[]> => {
  try {
    const players = await AsyncStorage.getItem(PLAYERS_KEY);
    return players ? JSON.parse(players) : [];
  } catch (error) {
    console.error('Lỗi khi đọc players:', error);
    return [];
  }
};

/**
 * Thêm người chơi mới
 */
export const addPlayer = async (name: string): Promise<Player> => {
  try {
    const players = await getPlayers();
    const newPlayer: Player = {
      id: generateId(),
      name,
    };
    
    players.push(newPlayer);
    await savePlayers(players);
    return newPlayer;
  } catch (error) {
    console.error('Lỗi khi thêm người chơi:', error);
    throw error;
  }
};

/**
 * Xóa người chơi
 */
export const deletePlayer = async (playerId: string): Promise<void> => {
  try {
    const players = await getPlayers();
    const updatedPlayers = players.filter(p => p.id !== playerId);
    await savePlayers(updatedPlayers);
  } catch (error) {
    console.error('Lỗi khi xóa người chơi:', error);
    throw error;
  }
};
