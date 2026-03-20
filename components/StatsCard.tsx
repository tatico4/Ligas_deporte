import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  label: string;
  value: number;
  icon: string;
  dark?: boolean;
}

export function StatsCard({ label, value, icon, dark }: Props) {
  return (
    <View
      className={`flex-1 rounded-2xl p-4 shadow-sm min-w-[100px] ${
        dark ? "bg-secondary-800" : "bg-white"
      }`}
    >
      <Ionicons
        name={icon as any}
        size={22}
        color={dark ? "#4ade80" : "#16a34a"}
        style={{ marginBottom: 8 }}
      />
      <Text className={`text-2xl font-bold ${dark ? "text-white" : "text-secondary-900"}`}>
        {value}
      </Text>
      <Text className={`text-xs mt-0.5 ${dark ? "text-secondary-400" : "text-secondary-500"}`}>
        {label}
      </Text>
    </View>
  );
}
