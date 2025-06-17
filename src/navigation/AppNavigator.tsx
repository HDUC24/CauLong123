import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "../components/Icon";

import HomeScreen from "../screens/HomeScreen";
import SessionDetailScreen from "../screens/SessionDetailScreen";
import NewSessionScreen from "../screens/NewSessionScreen";
import EditSessionScreen from "../screens/EditSessionScreen";
import PlayersScreen from "../screens/PlayersScreen";
import AddPlayerScreen from "../screens/AddPlayerScreen";
import StatsScreen from "../screens/StatsScreen";

// Define types for navigation
export type RootStackParamList = {
  MainTabs: undefined;
  SessionDetail: { sessionId: string };
  NewSession: undefined;
  EditSession: { sessionId: string };
  AddPlayer: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Players: undefined;
  Stats: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: "#4caf50",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Players") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Stats") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else {
            iconName = "help-outline";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Trang chủ" }}
      />
      <Tab.Screen
        name="Players"
        component={PlayersScreen}
        options={{ title: "Người chơi" }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: "Thống kê" }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigation
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#4caf50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SessionDetail"
          component={SessionDetailScreen}
          options={{ title: "Chi tiết buổi đánh cầu" }}
        />
        <Stack.Screen
          name="NewSession"
          component={NewSessionScreen}
          options={{ title: "Thêm buổi đánh cầu mới" }}
        />
        <Stack.Screen
          name="EditSession"
          component={EditSessionScreen}
          options={{ title: "Chỉnh sửa buổi đánh cầu" }}
        />
        <Stack.Screen
          name="AddPlayer"
          component={AddPlayerScreen}
          options={{ title: "Thêm người chơi mới" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
