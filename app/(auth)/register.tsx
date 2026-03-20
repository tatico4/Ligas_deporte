import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types";

const schema = z.object({
  full_name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.enum(["tournament_admin", "captain", "player"]),
});

type FormData = z.infer<typeof schema>;

const ROLES: { value: FormData["role"]; label: string; description: string }[] = [
  {
    value: "tournament_admin",
    label: "Organizador",
    description: "Crea y administra torneos",
  },
  {
    value: "captain",
    label: "Capitán",
    description: "Administra tu equipo",
  },
  {
    value: "player",
    label: "Jugador",
    description: "Ve tus stats y partidos",
  },
];

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "tournament_admin" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.full_name,
          role: values.role,
        },
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Cuenta creada",
        "Revisa tu email para confirmar tu cuenta.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-primary-700">Crear cuenta</Text>
          <Text className="text-secondary-500 text-base mt-1">Únete a Canchero</Text>
        </View>

        <View className="gap-4">
          {/* Nombre */}
          <View>
            <Text className="text-secondary-700 font-medium mb-1">Nombre completo</Text>
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="border border-secondary-300 rounded-xl px-4 py-3 text-secondary-900 bg-secondary-50"
                  placeholder="Juan Pérez"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.full_name && (
              <Text className="text-red-500 text-sm mt-1">{errors.full_name.message}</Text>
            )}
          </View>

          {/* Email */}
          <View>
            <Text className="text-secondary-700 font-medium mb-1">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="border border-secondary-300 rounded-xl px-4 py-3 text-secondary-900 bg-secondary-50"
                  placeholder="tu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View>
            <Text className="text-secondary-700 font-medium mb-1">Contraseña</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="border border-secondary-300 rounded-xl px-4 py-3 text-secondary-900 bg-secondary-50"
                  placeholder="••••••••"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
            )}
          </View>

          {/* Role selector */}
          <View>
            <Text className="text-secondary-700 font-medium mb-2">¿Cuál es tu rol?</Text>
            <View className="gap-2">
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  className={`border-2 rounded-xl p-4 ${
                    selectedRole === r.value
                      ? "border-primary-600 bg-primary-50"
                      : "border-secondary-200 bg-white"
                  }`}
                  onPress={() => setValue("role", r.value)}
                >
                  <Text
                    className={`font-semibold text-base ${
                      selectedRole === r.value ? "text-primary-700" : "text-secondary-800"
                    }`}
                  >
                    {r.label}
                  </Text>
                  <Text className="text-secondary-500 text-sm mt-0.5">{r.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4 items-center mt-2"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Crear cuenta</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-secondary-500">¿Ya tienes cuenta?</Text>
          <Link href="/(auth)/login">
            <Text className="text-primary-600 font-semibold">Iniciar sesión</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
