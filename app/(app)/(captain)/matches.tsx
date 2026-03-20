import { View, Text } from "react-native";

export default function CaptainMatches() {
  return (
    <View className="flex-1 items-center justify-center bg-secondary-50">
      <Text className="text-4xl">📅</Text>
      <Text className="text-secondary-600 font-semibold text-lg mt-3">Mis partidos</Text>
      <Text className="text-secondary-400 text-sm mt-1">Próximamente</Text>
    </View>
  );
}
