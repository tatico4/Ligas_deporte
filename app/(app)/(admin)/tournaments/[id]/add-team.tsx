import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeam } from "@/lib/queries/teams";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

const COLORS = [
  "#16a34a", "#22c55e", "#3b82f6", "#8b5cf6",
  "#f59e0b", "#ef4444", "#ec4899", "#06b6d4",
  "#f97316", "#14b8a6", "#18181b", "#64748b",
];

const schema = z.object({
  name: z.string().min(2, "Nombre requerido (mín. 2 caracteres)"),
  color_primary: z.string(),
  group_name: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddTeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", color_primary: "#16a34a" },
  });

  const selectedColor = watch("color_primary");
  const teamName = watch("name");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      createTeam({
        tournament_id: id,
        name: data.name,
        color_primary: data.color_primary,
        color_secondary: "#ffffff",
        group_name: data.group_name ?? null,
        captain_id: null,
        logo_url: null,
        status: "active",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", id] });
      queryClient.invalidateQueries({ queryKey: ["tournament", id] });
      Alert.alert("Equipo agregado", `"${teamName}" fue agregado al torneo.`, [
        { text: "Agregar otro", onPress: () => router.replace(`/(app)/(admin)/tournaments/${id}/add-team`) },
        { text: "Ver torneo", onPress: () => router.back() },
      ]);
    },
    onError: (err: Error) => Alert.alert("Error", err.message),
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fafafa" }}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Preview */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 20,
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
          borderTopWidth: 4,
          borderTopColor: selectedColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Avatar name={teamName || "?"} color={selectedColor} size={64} />
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#18181b" }}>
          {teamName || "Nombre del equipo"}
        </Text>
        <Text style={{ fontSize: 13, color: "#71717a" }}>Vista previa</Text>
      </View>

      {/* Nombre */}
      <View style={{ marginBottom: 20 }}>
        <Text style={labelStyle}>Nombre del equipo *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={inputStyle}
              placeholder="Ej: Los Galácticos"
              onChangeText={onChange}
              value={value}
              autoFocus
            />
          )}
        />
        {errors.name && <Text style={errorStyle}>{errors.name.message}</Text>}
      </View>

      {/* Color */}
      <View style={{ marginBottom: 20 }}>
        <Text style={labelStyle}>Color del equipo</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setValue("color_primary", color)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 0,
                borderColor: "#18181b",
                transform: [{ scale: selectedColor === color ? 1.15 : 1 }],
              }}
            />
          ))}
        </View>
      </View>

      {/* Grupo (opcional) */}
      <View style={{ marginBottom: 28 }}>
        <Text style={labelStyle}>Grupo (opcional)</Text>
        <Controller
          control={control}
          name="group_name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={inputStyle}
              placeholder="Ej: A, B, Norte..."
              onChangeText={onChange}
              value={value}
              autoCapitalize="characters"
            />
          )}
        />
      </View>

      <Button
        label="Agregar equipo"
        onPress={handleSubmit((data) => mutate(data))}
        loading={isPending}
        fullWidth
      />
    </ScrollView>
  );
}

const labelStyle = {
  fontSize: 13,
  fontWeight: "600" as const,
  color: "#52525b",
  marginBottom: 6,
  textTransform: "uppercase" as const,
  letterSpacing: 0.4,
};

const inputStyle = {
  backgroundColor: "#fff",
  borderWidth: 1.5,
  borderColor: "#e4e4e7",
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 13,
  fontSize: 15,
  color: "#18181b",
};

const errorStyle = {
  color: "#dc2626",
  fontSize: 12,
  marginTop: 4,
};
