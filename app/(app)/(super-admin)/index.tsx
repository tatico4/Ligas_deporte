import { View, Text, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "@/lib/queries/tournaments";
import { StatsCard } from "@/components/StatsCard";

export default function SuperAdminDashboard() {
  const { data: tournaments = [] } = useQuery({
    queryKey: ["all-tournaments"],
    queryFn: () => getTournaments(),
  });

  const active = tournaments.filter((t) => t.status === "active").length;
  const draft = tournaments.filter((t) => t.status === "draft").length;
  const finished = tournaments.filter((t) => t.status === "finished").length;

  return (
    <ScrollView className="flex-1 bg-secondary-900">
      <View className="px-4 pt-6">
        <Text className="text-white text-2xl font-bold mb-1">Dashboard</Text>
        <Text className="text-secondary-400 text-sm mb-6">Vista global de la plataforma</Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatsCard label="Torneos activos" value={active} icon="trophy" dark />
          <StatsCard label="En borrador" value={draft} icon="create" dark />
          <StatsCard label="Finalizados" value={finished} icon="checkmark-circle" dark />
          <StatsCard label="Total torneos" value={tournaments.length} icon="list" dark />
        </View>

        <View className="bg-secondary-800 rounded-2xl p-4">
          <Text className="text-white font-bold text-base mb-3">Últimos torneos creados</Text>
          {tournaments.slice(0, 5).map((t) => (
            <View key={t.id} className="py-2 border-b border-secondary-700">
              <Text className="text-white font-medium">{t.name}</Text>
              <Text className="text-secondary-400 text-xs mt-0.5">
                {t.status} · {new Date(t.created_at).toLocaleDateString("es-CL")}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
