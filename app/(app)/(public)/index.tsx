import { View, Text, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "@/lib/queries/tournaments";
import { TournamentCard } from "@/components/TournamentCard";

export default function PublicHome() {
  const router = useRouter();
  const { data: tournaments = [], isLoading, refetch } = useQuery({
    queryKey: ["public-tournaments"],
    queryFn: () => getTournaments(),
  });

  const active = tournaments.filter((t) => t.status === "active");
  const finished = tournaments.filter((t) => t.status === "finished");

  return (
    <FlatList
      className="flex-1 bg-secondary-50"
      data={[...active, ...finished]}
      keyExtractor={(item) => item.id}
      refreshing={isLoading}
      onRefresh={refetch}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      ListHeaderComponent={
        <Text className="text-secondary-800 font-bold text-lg mb-2">
          Torneos activos
        </Text>
      }
      ListEmptyComponent={
        <View className="items-center py-20">
          <Text className="text-5xl">⚽</Text>
          <Text className="text-secondary-500 mt-3 text-base">No hay torneos activos</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TournamentCard tournament={item} />
      )}
    />
  );
}
