import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Team } from "@/types";

interface Props {
  team: Team;
  onPress?: () => void;
}

export function TeamCard({ team, onPress }: Props) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center gap-3"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: team.color_primary ?? "#16a34a" }}
      >
        <Text className="text-white font-bold text-lg">
          {team.name[0]?.toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-secondary-900 font-bold text-base" numberOfLines={1}>
          {team.name}
        </Text>
        {team.group_name && (
          <Text className="text-secondary-500 text-xs">Grupo {team.group_name}</Text>
        )}
      </View>
      <View
        className={`px-2.5 py-1 rounded-full ${
          team.status === "active"
            ? "bg-green-100"
            : team.status === "disqualified"
            ? "bg-red-100"
            : "bg-secondary-100"
        }`}
      >
        <Text
          className={`text-xs font-semibold ${
            team.status === "active"
              ? "text-green-700"
              : team.status === "disqualified"
              ? "text-red-600"
              : "text-secondary-500"
          }`}
        >
          {team.status === "active" ? "Activo" : team.status === "disqualified" ? "Descalificado" : "Inactivo"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#a1a1aa" />
    </TouchableOpacity>
  );
}
