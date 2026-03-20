import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { getTournaments } from "@/lib/queries/tournaments";
import { TournamentCard } from "@/components/TournamentCard";
import { StatsCard } from "@/components/StatsCard";

export default function AdminHome() {
  const { profile, signOut } = useAuthStore();
  const router = useRouter();

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["tournaments", profile?.id],
    queryFn: () => getTournaments(profile?.id),
    enabled: !!profile?.id,
  });

  const active = tournaments.filter((t) => t.status === "active").length;
  const finished = tournaments.filter((t) => t.status === "finished").length;

  return (
    <ScrollView className="flex-1 bg-secondary-50">
      {/* Header saludo */}
      <View className="bg-primary-600 px-6 pt-6 pb-10">
        <Text className="text-white text-lg">
          Hola, {profile?.full_name?.split(" ")[0]} 👋
        </Text>
        <Text className="text-primary-100 text-sm mt-0.5">
          Administrador de torneos
        </Text>
      </View>

      <View className="-mt-6 px-4">
        {/* Stats */}
        <View className="flex-row gap-3 mb-4">
          <StatsCard label="Torneos activos" value={active} icon="trophy" />
          <StatsCard label="Finalizados" value={finished} icon="checkmark-circle" />
          <StatsCard label="Total equipos" value={tournaments.reduce((a, t) => a + (t.max_teams || 0), 0)} icon="people" />
        </View>

        {/* Acción rápida */}
        <TouchableOpacity
          className="bg-primary-600 rounded-2xl py-4 items-center mb-6 shadow-sm"
          onPress={() => router.push("/(app)/(admin)/tournaments/new")}
        >
          <Text className="text-white font-bold text-base">+ Crear nuevo torneo</Text>
        </TouchableOpacity>

        {/* Torneos recientes */}
        <Text className="text-secondary-800 font-bold text-lg mb-3">Mis torneos</Text>

        {isLoading ? (
          <Text className="text-secondary-400 text-center py-4">Cargando...</Text>
        ) : tournaments.length === 0 ? (
          <View className="items-center py-10">
            <Text className="text-4xl">🏆</Text>
            <Text className="text-secondary-500 mt-2">Aún no tienes torneos</Text>
            <Text className="text-secondary-400 text-sm">Crea tu primer torneo arriba</Text>
          </View>
        ) : (
          <View className="gap-3">
            {tournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onPress={() => router.push(`/(app)/(admin)/tournaments/${t.id}`)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
