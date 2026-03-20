import { View, Text, ScrollView } from "react-native";
import type { Standing } from "@/types";

interface Props {
  standings: Standing[];
}

export function StandingsTable({ standings }: Props) {
  return (
    <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <View className="flex-row bg-primary-600 px-4 py-2">
        <Text className="text-white font-bold w-6 text-center text-xs">#</Text>
        <Text className="text-white font-bold flex-1 ml-2 text-xs">Equipo</Text>
        <Text className="text-white font-bold w-7 text-center text-xs">PJ</Text>
        <Text className="text-white font-bold w-7 text-center text-xs">G</Text>
        <Text className="text-white font-bold w-7 text-center text-xs">E</Text>
        <Text className="text-white font-bold w-7 text-center text-xs">P</Text>
        <Text className="text-white font-bold w-8 text-center text-xs">DG</Text>
        <Text className="text-white font-bold w-8 text-center text-xs font-bold">Pts</Text>
      </View>

      {/* Rows */}
      {standings.map((s, index) => (
        <View
          key={s.id}
          className={`flex-row px-4 py-3 items-center border-b border-secondary-100 ${
            index % 2 === 0 ? "bg-white" : "bg-secondary-50"
          }`}
        >
          <Text className="text-secondary-600 font-bold w-6 text-center text-sm">{s.position}</Text>
          <Text className="text-secondary-900 font-semibold flex-1 ml-2 text-sm" numberOfLines={1}>
            {s.team?.name ?? "Equipo"}
          </Text>
          <Text className="text-secondary-600 w-7 text-center text-sm">{s.played}</Text>
          <Text className="text-secondary-600 w-7 text-center text-sm">{s.won}</Text>
          <Text className="text-secondary-600 w-7 text-center text-sm">{s.drawn}</Text>
          <Text className="text-secondary-600 w-7 text-center text-sm">{s.lost}</Text>
          <Text className="text-secondary-600 w-8 text-center text-sm">
            {s.goal_difference > 0 ? "+" : ""}{s.goal_difference}
          </Text>
          <Text className="text-primary-700 font-bold w-8 text-center text-sm">{s.points}</Text>
        </View>
      ))}
    </View>
  );
}
