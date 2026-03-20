import { View, Text, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "@/lib/queries/tournaments";
import { TournamentCard } from "@/components/TournamentCard";

export default function AllTournamentsScreen() {
  const { data: tournaments = [], isLoading, refetch } = useQuery({
    queryKey: ["all-tournaments"],
    queryFn: () => getTournaments(),
  });

  return (
    <FlatList
      className="flex-1 bg-secondary-900"
      data={tournaments}
      keyExtractor={(item) => item.id}
      refreshing={isLoading}
      onRefresh={refetch}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <TournamentCard tournament={item} dark />
      )}
    />
  );
}
