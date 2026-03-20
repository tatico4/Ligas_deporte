import { View, Text, ScrollView, FlatList } from "react-native";
import { useAuthStore } from "@/store/auth";

export default function CaptainHome() {
  const { profile } = useAuthStore();

  return (
    <ScrollView className="flex-1 bg-secondary-50">
      <View className="bg-primary-600 px-6 pt-6 pb-10">
        <Text className="text-white text-lg font-semibold">
          Hola, {profile?.full_name?.split(" ")[0]} 👋
        </Text>
        <Text className="text-primary-200 text-sm">Capitán</Text>
      </View>

      <View className="-mt-4 mx-4 bg-white rounded-2xl shadow-sm p-6">
        <Text className="text-secondary-500 text-center text-base">
          Selecciona tu equipo desde la sección de torneos para administrarlo.
        </Text>
      </View>
    </ScrollView>
  );
}
