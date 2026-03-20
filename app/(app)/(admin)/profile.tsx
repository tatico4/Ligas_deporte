import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";

const ROLE_LABELS = {
  super_admin: "Super Administrador",
  tournament_admin: "Organizador de Torneos",
  captain: "Capitán",
  player: "Jugador",
};

export default function ProfileScreen() {
  const { profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-secondary-50">
      {/* Avatar + nombre */}
      <View className="bg-primary-600 items-center pt-10 pb-16">
        <View className="w-20 h-20 bg-primary-200 rounded-full items-center justify-center mb-3">
          <Text className="text-primary-700 font-bold text-3xl">
            {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text className="text-white font-bold text-xl">{profile?.full_name}</Text>
        <Text className="text-primary-200 text-sm mt-1">
          {profile?.role ? ROLE_LABELS[profile.role] : ""}
        </Text>
      </View>

      <View className="-mt-6 mx-4">
        {/* Info card */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <InfoRow icon="mail" label="Email" value={profile?.email ?? ""} />
          {profile?.phone && (
            <InfoRow icon="call" label="Teléfono" value={profile.phone} />
          )}
          <InfoRow
            icon="calendar"
            label="Miembro desde"
            value={profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("es-CL")
              : ""}
          />
        </View>

        {/* Acciones */}
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <ActionRow icon="create" label="Editar perfil" onPress={() => {}} />
          <ActionRow icon="lock-closed" label="Cambiar contraseña" onPress={() => {}} />
          <ActionRow icon="notifications" label="Notificaciones" onPress={() => {}} />
        </View>

        <TouchableOpacity
          className="bg-red-50 border border-red-200 rounded-2xl py-4 items-center"
          onPress={handleSignOut}
        >
          <Text className="text-red-600 font-semibold">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-3 border-b border-secondary-100 last:border-0">
      <Ionicons name={icon as any} size={18} color="#71717a" className="mr-3" />
      <View className="flex-1 ml-3">
        <Text className="text-secondary-500 text-xs">{label}</Text>
        <Text className="text-secondary-800 font-medium">{value}</Text>
      </View>
    </View>
  );
}

function ActionRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 border-b border-secondary-100 last:border-0"
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={18} color="#52525b" />
      <Text className="flex-1 ml-3 text-secondary-800">{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#a1a1aa" />
    </TouchableOpacity>
  );
}
