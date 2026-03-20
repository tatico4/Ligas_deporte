import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SuperAdminLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#71717a",
        headerStyle: { backgroundColor: "#18181b" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
          headerTitle: "Canchero Admin",
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Usuarios",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          headerTitle: "Usuarios",
        }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{
          title: "Torneos",
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />,
          headerTitle: "Todos los torneos",
        }}
      />
    </Tabs>
  );
}
