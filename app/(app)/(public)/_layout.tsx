import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PublicLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#71717a",
        headerStyle: { backgroundColor: "#16a34a" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Torneos",
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />,
          headerTitle: "Canchero",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          headerTitle: "Mi Perfil",
        }}
      />
    </Tabs>
  );
}
