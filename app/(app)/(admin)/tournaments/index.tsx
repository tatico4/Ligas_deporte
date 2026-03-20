import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { getTournaments } from "@/lib/queries/tournaments";
import { TournamentCard } from "@/components/TournamentCard";

export default function TournamentsScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();

  const { data: tournaments = [], isLoading, refetch } = useQuery({
    queryKey: ["tournaments", profile?.id],
    queryFn: () => getTournaments(profile?.id),
    enabled: !!profile?.id,
  });

  return (
    <View className="flex-1 bg-secondary-50">
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20">
              <Text className="text-5xl">🏆</Text>
              <Text className="text-secondary-600 font-semibold text-lg mt-3">
                Sin torneos aún
              </Text>
              <Text className="text-secondary-400 text-sm mt-1">
                Crea tu primer torneo
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TournamentCard
            tournament={item}
            onPress={() => router.push(`/(app)/(admin)/tournaments/${item.id}`)}
          />
        )}
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary-600 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        onPress={() => router.push("/(app)/(admin)/tournaments/new")}
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </TouchableOpacity>
    </View>
  );
}
