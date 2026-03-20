import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Tournament } from "@/types";

const STATUS_CONFIG = {
  draft: { label: "Borrador", color: "bg-secondary-200", textColor: "text-secondary-600" },
  registration: { label: "Inscripción", color: "bg-blue-100", textColor: "text-blue-700" },
  active: { label: "En curso", color: "bg-green-100", textColor: "text-green-700" },
  finished: { label: "Finalizado", color: "bg-secondary-100", textColor: "text-secondary-500" },
  cancelled: { label: "Cancelado", color: "bg-red-100", textColor: "text-red-600" },
};

const TYPE_ICON = {
  league: "trophy",
  cup: "ribbon",
  group_knockout: "git-network",
};

interface Props {
  tournament: Tournament;
  onPress?: () => void;
  dark?: boolean;
}

export function TournamentCard({ tournament, onPress, dark }: Props) {
  const status = STATUS_CONFIG[tournament.status];
  const icon = TYPE_ICON[tournament.type];

  return (
    <TouchableOpacity
      className={`rounded-2xl p-4 shadow-sm ${dark ? "bg-secondary-800" : "bg-white"}`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center">
          <Ionicons name={icon as any} size={24} color="#16a34a" />
        </View>
        <View className="flex-1">
          <Text
            className={`font-bold text-base ${dark ? "text-white" : "text-secondary-900"}`}
            numberOfLines={1}
          >
            {tournament.name}
          </Text>
          <Text className={`text-xs mt-0.5 ${dark ? "text-secondary-400" : "text-secondary-500"}`}>
            {tournament.type === "league" ? "Liga" : tournament.type === "cup" ? "Copa" : "Fase de grupos"}
            {" · "}Máx. {tournament.max_teams} equipos
          </Text>
        </View>
        <View className={`px-2.5 py-1 rounded-full ${status.color}`}>
          <Text className={`text-xs font-semibold ${status.textColor}`}>{status.label}</Text>
        </View>
      </View>

      {tournament.start_date && (
        <View className="flex-row items-center mt-3 gap-1">
          <Ionicons name="calendar-outline" size={13} color="#a1a1aa" />
          <Text className="text-secondary-400 text-xs">
            {new Date(tournament.start_date).toLocaleDateString("es-CL")}
            {tournament.end_date
              ? ` → ${new Date(tournament.end_date).toLocaleDateString("es-CL")}`
              : ""}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
