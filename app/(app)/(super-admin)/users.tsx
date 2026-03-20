import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  tournament_admin: "Organizador",
  captain: "Capitán",
  player: "Jugador",
};

const ROLE_COLORS = {
  super_admin: "bg-purple-100 text-purple-700",
  tournament_admin: "bg-blue-100 text-blue-700",
  captain: "bg-primary-100 text-primary-700",
  player: "bg-secondary-100 text-secondary-600",
};

export default function UsersScreen() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-secondary-900">
        <ActivityIndicator color="#16a34a" />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-secondary-900"
      data={users}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      renderItem={({ item }) => (
        <View className="bg-secondary-800 rounded-xl px-4 py-3 flex-row items-center">
          <View className="w-10 h-10 bg-secondary-700 rounded-full items-center justify-center mr-3">
            <Text className="text-white font-bold">
              {item.full_name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">{item.full_name || "Sin nombre"}</Text>
            <Text className="text-secondary-400 text-xs">{item.email}</Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${ROLE_COLORS[item.role]}`}>
            <Text className="text-xs font-semibold">{ROLE_LABELS[item.role]}</Text>
          </View>
        </View>
      )}
    />
  );
}
