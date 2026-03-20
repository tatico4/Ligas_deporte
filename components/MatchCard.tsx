import { TouchableOpacity, View, Text } from "react-native";
import type { Match } from "@/types";

interface Props {
  match: Match;
  onPress?: () => void;
}

const STATUS_CONFIG = {
  scheduled: { label: "Programado", color: "bg-secondary-100 text-secondary-600" },
  in_progress: { label: "En vivo", color: "bg-green-100 text-green-700" },
  finished: { label: "Finalizado", color: "bg-secondary-50 text-secondary-500" },
  postponed: { label: "Postergado", color: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-600" },
};

export function MatchCard({ match, onPress }: Props) {
  const status = STATUS_CONFIG[match.status];
  const isFinished = match.status === "finished";

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 shadow-sm"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-secondary-400 text-xs">{match.round}</Text>
        <View className={`px-2 py-0.5 rounded-full ${status.color}`}>
          <Text className="text-xs font-medium">{status.label}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        {/* Local */}
        <View className="flex-1 items-center">
          <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mb-1">
            <Text className="text-primary-700 font-bold">
              {match.home_team?.name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text className="text-secondary-800 font-semibold text-sm text-center" numberOfLines={2}>
            {match.home_team?.name ?? "Local"}
          </Text>
        </View>

        {/* Score */}
        <View className="items-center px-4">
          {isFinished ? (
            <Text className="text-secondary-900 font-bold text-2xl">
              {match.home_score} - {match.away_score}
            </Text>
          ) : (
            <Text className="text-secondary-400 font-bold text-xl">VS</Text>
          )}
          {match.scheduled_at && !isFinished && (
            <Text className="text-secondary-400 text-xs mt-1">
              {new Date(match.scheduled_at).toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>

        {/* Visitante */}
        <View className="flex-1 items-center">
          <View className="w-10 h-10 bg-secondary-100 rounded-full items-center justify-center mb-1">
            <Text className="text-secondary-700 font-bold">
              {match.away_team?.name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text className="text-secondary-800 font-semibold text-sm text-center" numberOfLines={2}>
            {match.away_team?.name ?? "Visitante"}
          </Text>
        </View>
      </View>

      {match.venue && (
        <Text className="text-secondary-400 text-xs text-center mt-2">📍 {match.venue}</Text>
      )}
    </TouchableOpacity>
  );
}
