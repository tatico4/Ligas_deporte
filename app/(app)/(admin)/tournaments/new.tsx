import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { createTournament } from "@/lib/queries/tournaments";
import { ImagePickerField } from "@/components/ui/ImagePickerField";
import { tournamentLogoPath } from "@/lib/storage";
import type { TournamentType } from "@/types";

const schema = z.object({
  name: z.string().min(3, "Nombre requerido (mín. 3 caracteres)"),
  description: z.string().optional(),
  type: z.enum(["league", "cup", "group_knockout"]),
  max_teams: z.number().min(2).max(64),
  points_win: z.number().min(1),
  points_draw: z.number().min(0),
  points_loss: z.number().min(0),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TYPES: { value: TournamentType; label: string; description: string }[] = [
  { value: "league", label: "Liga", description: "Todos contra todos" },
  { value: "cup", label: "Copa", description: "Eliminación directa" },
  { value: "group_knockout", label: "Fase de grupos + eliminatoria", description: "Grupos + playoffs" },
];

export default function NewTournamentScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  // Guardamos un id temporal hasta tener el id real del torneo
  const [tempLogoUri, setTempLogoUri] = useState<string | null>(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "league",
      max_teams: 8,
      points_win: 3,
      points_draw: 1,
      points_loss: 0,
    },
  });

  const selectedType = watch("type");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      createTournament({
        ...data,
        admin_id: profile!.id,
        status: "draft",
        logo_url: logoUrl,
        teams_per_group: null,
        description: data.description ?? null,
        start_date: data.start_date ?? null,
        end_date: data.end_date ?? null,
      }),
    onSuccess: (tournament) => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      Alert.alert("Torneo creado", `"${tournament.name}" fue creado exitosamente.`, [
        { text: "Ver torneo", onPress: () => router.replace(`/(app)/(admin)/tournaments/${tournament.id}`) },
      ]);
    },
    onError: (err: Error) => Alert.alert("Error", err.message),
  });

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-secondary-800 font-bold text-xl mb-4">Nuevo torneo</Text>

      {/* Logo del torneo */}
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <ImagePickerField
          label="Logo del torneo"
          bucket="logos"
          storagePath={tournamentLogoPath(`new-${Date.now()}`)}
          currentUrl={logoUrl}
          placeholder="🏆"
          placeholderColor="#16a34a"
          shape="rounded"
          size={96}
          onUploaded={(url) => setLogoUrl(url || null)}
        />
      </View>

      {/* Nombre */}
      <View className="mb-4">
        <Text className="text-secondary-700 font-medium mb-1">Nombre del torneo *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="border border-secondary-300 rounded-xl px-4 py-3 bg-secondary-50"
              placeholder="Ej: Liga Verano 2025"
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>}
      </View>

      {/* Descripción */}
      <View className="mb-4">
        <Text className="text-secondary-700 font-medium mb-1">Descripción</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="border border-secondary-300 rounded-xl px-4 py-3 bg-secondary-50"
              placeholder="Descripción opcional..."
              multiline
              numberOfLines={3}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>

      {/* Tipo */}
      <View className="mb-4">
        <Text className="text-secondary-700 font-medium mb-2">Formato *</Text>
        <View className="gap-2">
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              className={`border-2 rounded-xl p-3 ${selectedType === t.value ? "border-primary-600 bg-primary-50" : "border-secondary-200"}`}
              onPress={() => setValue("type", t.value)}
            >
              <Text className={`font-semibold ${selectedType === t.value ? "text-primary-700" : "text-secondary-800"}`}>
                {t.label}
              </Text>
              <Text className="text-secondary-500 text-sm">{t.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Max equipos */}
      <View className="mb-4">
        <Text className="text-secondary-700 font-medium mb-1">Máximo de equipos *</Text>
        <Controller
          control={control}
          name="max_teams"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="border border-secondary-300 rounded-xl px-4 py-3 bg-secondary-50"
              keyboardType="number-pad"
              onChangeText={(v) => onChange(parseInt(v) || 0)}
              value={value?.toString()}
            />
          )}
        />
        {errors.max_teams && <Text className="text-red-500 text-sm mt-1">{errors.max_teams.message}</Text>}
      </View>

      {/* Puntuación */}
      <Text className="text-secondary-700 font-semibold mb-2">Sistema de puntos</Text>
      <View className="flex-row gap-3 mb-6">
        {(["points_win", "points_draw", "points_loss"] as const).map((field) => (
          <View key={field} className="flex-1">
            <Text className="text-secondary-500 text-xs mb-1 text-center">
              {field === "points_win" ? "Victoria" : field === "points_draw" ? "Empate" : "Derrota"}
            </Text>
            <Controller
              control={control}
              name={field}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="border border-secondary-300 rounded-xl px-3 py-3 bg-secondary-50 text-center"
                  keyboardType="number-pad"
                  onChangeText={(v) => onChange(parseInt(v) || 0)}
                  value={value?.toString()}
                />
              )}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        className="bg-primary-600 rounded-xl py-4 items-center"
        onPress={handleSubmit((data) => mutate(data))}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-base">Crear torneo</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
