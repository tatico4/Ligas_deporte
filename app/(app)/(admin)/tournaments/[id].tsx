import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTournament, updateTournament } from "@/lib/queries/tournaments";
import { getTeams } from "@/lib/queries/teams";
import { getMatches, getStandings, generateFixtureRoundRobin } from "@/lib/queries/matches";
import { TeamCard } from "@/components/TeamCard";
import { MatchCard } from "@/components/MatchCard";
import { StandingsTable } from "@/components/StandingsTable";

type Tab = "equipos" | "fixture" | "tabla";

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("equipos");

  const { data: tournament, isLoading: loadingT } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => getTournament(id),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams", id],
    queryFn: () => getTeams(id),
    enabled: !!id,
  });

  const { data: matches = [] } = useQuery({
    queryKey: ["matches", id],
    queryFn: () => getMatches(id),
    enabled: !!id,
  });

  const { data: standings = [] } = useQuery({
    queryKey: ["standings", id],
    queryFn: () => getStandings(id),
    enabled: !!id,
  });

  const { mutate: activateTournament, isPending: activating } = useMutation({
    mutationFn: () => updateTournament(id, { status: "active" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tournament", id] }),
  });

  const { mutate: generateFixture, isPending: generatingFixture } = useMutation({
    mutationFn: () => generateFixtureRoundRobin(id, teams.map((t) => t.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", id] });
      Alert.alert("Fixture generado", `${teams.length} equipos, ${teams.length - 1} fechas.`);
    },
    onError: (err: Error) => Alert.alert("Error", err.message),
  });

  if (loadingT) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!tournament) return null;

  const STATUS_COLORS: Record<string, string> = {
    draft: "bg-secondary-200 text-secondary-700",
    registration: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    finished: "bg-secondary-100 text-secondary-500",
    cancelled: "bg-red-100 text-red-600",
  };

  const STATUS_LABELS: Record<string, string> = {
    draft: "Borrador",
    registration: "Inscripción",
    active: "En curso",
    finished: "Finalizado",
    cancelled: "Cancelado",
  };

  return (
    <View className="flex-1 bg-secondary-50">
      {/* Header */}
      <View className="bg-primary-600 px-6 pt-4 pb-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold flex-1 mr-2" numberOfLines={1}>
            {tournament.name}
          </Text>
          <View className={`px-3 py-1 rounded-full ${STATUS_COLORS[tournament.status]}`}>
            <Text className="text-xs font-semibold">{STATUS_LABELS[tournament.status]}</Text>
          </View>
        </View>
        <Text className="text-primary-200 text-sm mt-1">
          {tournament.type === "league" ? "Liga" : tournament.type === "cup" ? "Copa" : "Grupos + Eliminatoria"}
          {" · "}{teams.length}/{tournament.max_teams} equipos
        </Text>
      </View>

      {/* Acciones */}
      {tournament.status === "draft" && (
        <View className="px-4 pt-4 flex-row gap-3">
          <TouchableOpacity
            className="flex-1 border border-primary-600 rounded-xl py-3 items-center"
            onPress={() => router.push(`/(app)/(admin)/tournaments/${id}/add-team`)}
          >
            <Text className="text-primary-600 font-semibold">+ Agregar equipo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-primary-600 rounded-xl py-3 items-center"
            onPress={() => {
              if (teams.length < 2) {
                Alert.alert("Faltan equipos", "Agrega al menos 2 equipos antes de activar.");
                return;
              }
              activateTournament();
            }}
            disabled={activating}
          >
            {activating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-semibold">Activar torneo</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {tournament.status === "active" && matches.length === 0 && (
        <View className="px-4 pt-4">
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-3 items-center"
            onPress={() => {
              Alert.alert(
                "Generar fixture",
                `Se generará el fixture para ${teams.length} equipos (round-robin). ¿Continuar?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Generar", onPress: () => generateFixture() },
                ]
              );
            }}
            disabled={generatingFixture}
          >
            {generatingFixture ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-semibold">Generar fixture automático</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View className="flex-row px-4 pt-4 gap-2">
        {(["equipos", "fixture", "tabla"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            className={`flex-1 py-2 rounded-lg items-center ${tab === t ? "bg-primary-600" : "bg-white border border-secondary-200"}`}
            onPress={() => setTab(t)}
          >
            <Text className={`font-semibold text-sm capitalize ${tab === t ? "text-white" : "text-secondary-600"}`}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {tab === "equipos" && (
          <View className="gap-3 pb-6">
            {teams.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-4xl">👕</Text>
                <Text className="text-secondary-500 mt-2">Sin equipos registrados</Text>
              </View>
            ) : (
              teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onPress={() => router.push(`/(app)/(admin)/tournaments/${id}/teams/${team.id}`)}
                />
              ))
            )}
          </View>
        )}

        {tab === "fixture" && (
          <View className="gap-3 pb-6">
            {matches.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-4xl">📅</Text>
                <Text className="text-secondary-500 mt-2">Sin fixture generado</Text>
              </View>
            ) : (
              matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onPress={() => router.push(`/(app)/(admin)/tournaments/${id}/matches/${match.id}`)}
                />
              ))
            )}
          </View>
        )}

        {tab === "tabla" && (
          <View className="pb-6">
            {standings.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-4xl">📊</Text>
                <Text className="text-secondary-500 mt-2">Sin resultados aún</Text>
              </View>
            ) : (
              <StandingsTable standings={standings} />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
