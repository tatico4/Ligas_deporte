import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getMatch, updateMatchScore, addMatchEvent } from "@/lib/queries/matches";
import { getPlayers } from "@/lib/queries/players";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { shadow } from "@/lib/design";
import type { EventType, MatchStatus } from "@/types";

const EVENT_TYPES: { type: EventType; label: string; icon: string }[] = [
  { type: "goal",         label: "Gol",           icon: "⚽" },
  { type: "own_goal",     label: "Gol en contra",  icon: "🤦" },
  { type: "yellow_card",  label: "Tarjeta amarilla", icon: "🟨" },
  { type: "red_card",     label: "Tarjeta roja",   icon: "🟥" },
  { type: "penalty_goal", label: "Penal",          icon: "🎯" },
];

export default function MatchDetailScreen() {
  const { id, matchId } = useLocalSearchParams<{ id: string; matchId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [addingEvent, setAddingEvent] = useState(false);
  const [eventType, setEventType] = useState<EventType>("goal");
  const [eventMinute, setEventMinute] = useState("");
  const [eventTeamId, setEventTeamId] = useState<string>("");
  const [eventPlayerId, setEventPlayerId] = useState<string | null>(null);

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => getMatch(matchId),
  });

  const { data: homePlayers = [] } = useQuery({
    queryKey: ["players", match?.home_team_id],
    queryFn: () => getPlayers(match!.home_team_id),
    enabled: !!match?.home_team_id,
  });

  const { data: awayPlayers = [] } = useQuery({
    queryKey: ["players", match?.away_team_id],
    queryFn: () => getPlayers(match!.away_team_id),
    enabled: !!match?.away_team_id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    queryClient.invalidateQueries({ queryKey: ["matches", id] });
    queryClient.invalidateQueries({ queryKey: ["standings", id] });
  };

  const { mutate: saveResult, isPending: savingResult } = useMutation({
    mutationFn: () =>
      updateMatchScore(matchId, Number(homeScore), Number(awayScore)),
    onSuccess: () => {
      invalidate();
      Alert.alert("Resultado guardado", "La tabla de posiciones se actualizó automáticamente.");
    },
    onError: (err: Error) => Alert.alert("Error", err.message),
  });

  const { mutate: saveEvent, isPending: savingEvent } = useMutation({
    mutationFn: () =>
      addMatchEvent({
        match_id: matchId,
        team_id: eventTeamId,
        player_id: eventPlayerId,
        event_type: eventType,
        minute: Number(eventMinute),
        description: null,
      }),
    onSuccess: () => {
      invalidate();
      setAddingEvent(false);
      setEventMinute("");
      setEventPlayerId(null);
    },
    onError: (err: Error) => Alert.alert("Error", err.message),
  });

  if (isLoading || !match) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#71717a" }}>Cargando...</Text>
      </View>
    );
  }

  const homeColor = (match.home_team as any)?.color_primary ?? "#16a34a";
  const awayColor = (match.away_team as any)?.color_primary ?? "#3b82f6";
  const isFinished = match.status === "finished";

  const activePlayers = eventTeamId === match.home_team_id ? homePlayers : awayPlayers;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fafafa" }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      {/* Hero score card */}
      <View
        style={[
          {
            backgroundColor: "#fff",
            borderRadius: 24,
            overflow: "hidden",
          },
          shadow.md,
        ]}
      >
        {/* Header gradient top */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 10,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#71717a" }}>
            {match.round?.toUpperCase()}
          </Text>
          <Badge status={match.status as MatchStatus} />
        </View>

        {/* Teams + score */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingBottom: 20,
          }}
        >
          {/* Home */}
          <View style={{ flex: 1, alignItems: "center", gap: 8 }}>
            <Avatar name={match.home_team?.name ?? "?"} color={homeColor} size={56} />
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: "#18181b", textAlign: "center" }}
              numberOfLines={2}
            >
              {match.home_team?.name}
            </Text>
          </View>

          {/* Score */}
          <View style={{ alignItems: "center", gap: 6, minWidth: 100 }}>
            <View
              style={{
                backgroundColor: isFinished ? "#f4f4f5" : "#18181b",
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 34,
                  fontWeight: "900",
                  color: isFinished ? "#18181b" : "#ffffff",
                  letterSpacing: -2,
                }}
              >
                {isFinished
                  ? `${match.home_score} — ${match.away_score}`
                  : "? — ?"}
              </Text>
            </View>
            {match.venue && (
              <Text style={{ fontSize: 11, color: "#a1a1aa" }}>📍 {match.venue}</Text>
            )}
          </View>

          {/* Away */}
          <View style={{ flex: 1, alignItems: "center", gap: 8 }}>
            <Avatar name={match.away_team?.name ?? "?"} color={awayColor} size={56} />
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: "#18181b", textAlign: "center" }}
              numberOfLines={2}
            >
              {match.away_team?.name}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Cargar resultado (si no está finalizado) ── */}
      {!isFinished && (
        <View style={[{ backgroundColor: "#fff", borderRadius: 20, padding: 20, gap: 16 }, shadow.sm]}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#18181b" }}>
            Cargar resultado
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* Home score */}
            <View style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 12, color: "#71717a", fontWeight: "600" }}>
                {match.home_team?.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setHomeScore(String(Math.max(0, Number(homeScore) - 1)))}
                  style={scoreBtn}
                >
                  <Ionicons name="remove" size={18} color="#52525b" />
                </TouchableOpacity>
                <TextInput
                  value={homeScore}
                  onChangeText={setHomeScore}
                  keyboardType="number-pad"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: homeColor,
                    textAlign: "center",
                    fontSize: 26,
                    fontWeight: "800",
                    color: "#18181b",
                  }}
                />
                <TouchableOpacity
                  onPress={() => setHomeScore(String(Number(homeScore) + 1))}
                  style={scoreBtn}
                >
                  <Ionicons name="add" size={18} color="#52525b" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={{ fontSize: 22, color: "#d4d4d8", fontWeight: "800" }}>—</Text>

            {/* Away score */}
            <View style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 12, color: "#71717a", fontWeight: "600" }}>
                {match.away_team?.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setAwayScore(String(Math.max(0, Number(awayScore) - 1)))}
                  style={scoreBtn}
                >
                  <Ionicons name="remove" size={18} color="#52525b" />
                </TouchableOpacity>
                <TextInput
                  value={awayScore}
                  onChangeText={setAwayScore}
                  keyboardType="number-pad"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: awayColor,
                    textAlign: "center",
                    fontSize: 26,
                    fontWeight: "800",
                    color: "#18181b",
                  }}
                />
                <TouchableOpacity
                  onPress={() => setAwayScore(String(Number(awayScore) + 1))}
                  style={scoreBtn}
                >
                  <Ionicons name="add" size={18} color="#52525b" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Button
            label="Guardar resultado final"
            onPress={() => {
              if (homeScore === "" || awayScore === "") {
                Alert.alert("Faltan datos", "Ingresa el marcador de ambos equipos.");
                return;
              }
              Alert.alert(
                "Confirmar resultado",
                `${match.home_team?.name} ${homeScore} — ${awayScore} ${match.away_team?.name}`,
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Confirmar", onPress: () => saveResult() },
                ]
              );
            }}
            loading={savingResult}
            fullWidth
          />
        </View>
      )}

      {/* ── Eventos del partido ── */}
      <View style={[{ backgroundColor: "#fff", borderRadius: 20, overflow: "hidden" }, shadow.sm]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: "#f4f4f5",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#18181b" }}>
            Eventos
          </Text>
          <TouchableOpacity
            onPress={() => setAddingEvent(!addingEvent)}
            style={{
              backgroundColor: addingEvent ? "#fee2e2" : "#dcfce7",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: addingEvent ? "#b91c1c" : "#15803d",
              }}
            >
              {addingEvent ? "Cancelar" : "+ Agregar"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form agregar evento */}
        {addingEvent && (
          <View style={{ padding: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: "#f4f4f5" }}>
            {/* Tipo de evento */}
            <View>
              <Text style={miniLabel}>Tipo de evento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8, paddingVertical: 4 }}>
                  {EVENT_TYPES.map((e) => (
                    <TouchableOpacity
                      key={e.type}
                      onPress={() => setEventType(e.type)}
                      style={{
                        backgroundColor: eventType === e.type ? "#18181b" : "#f4f4f5",
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Text>{e.icon}</Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: eventType === e.type ? "#fff" : "#52525b",
                        }}
                      >
                        {e.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Equipo */}
            <View>
              <Text style={miniLabel}>Equipo</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[match.home_team, match.away_team].map((team) =>
                  team ? (
                    <TouchableOpacity
                      key={team.id}
                      onPress={() => {
                        setEventTeamId(team.id);
                        setEventPlayerId(null);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor:
                          eventTeamId === team.id ? "#18181b" : "#f4f4f5",
                        borderRadius: 12,
                        padding: 10,
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Avatar
                        name={team.name}
                        color={
                          team.id === match.home_team_id ? homeColor : awayColor
                        }
                        size={32}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: eventTeamId === team.id ? "#fff" : "#52525b",
                        }}
                        numberOfLines={1}
                      >
                        {team.name}
                      </Text>
                    </TouchableOpacity>
                  ) : null
                )}
              </View>
            </View>

            {/* Jugador */}
            {eventTeamId && activePlayers.length > 0 && (
              <View>
                <Text style={miniLabel}>Jugador (opcional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8, paddingVertical: 4 }}>
                    {activePlayers.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() =>
                          setEventPlayerId(eventPlayerId === p.id ? null : p.id)
                        }
                        style={{
                          backgroundColor:
                            eventPlayerId === p.id ? "#16a34a" : "#f4f4f5",
                          borderRadius: 10,
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: eventPlayerId === p.id ? "#fff" : "#18181b",
                          }}
                        >
                          #{p.jersey_number ?? "—"}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: eventPlayerId === p.id ? "#dcfce7" : "#71717a",
                          }}
                        >
                          {p.name.split(" ")[0]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Minuto */}
            <View>
              <Text style={miniLabel}>Minuto *</Text>
              <TextInput
                value={eventMinute}
                onChangeText={setEventMinute}
                keyboardType="number-pad"
                placeholder="Ej: 45"
                style={{
                  backgroundColor: "#f4f4f5",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  fontSize: 15,
                  color: "#18181b",
                }}
              />
            </View>

            <Button
              label="Registrar evento"
              onPress={() => {
                if (!eventTeamId || !eventMinute) {
                  Alert.alert("Faltan datos", "Selecciona el equipo y el minuto.");
                  return;
                }
                saveEvent();
              }}
              loading={savingEvent}
              size="sm"
              fullWidth
            />
          </View>
        )}

        {/* Lista de eventos */}
        {(match as any).match_events?.length === 0 && !addingEvent && (
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: "#a1a1aa", fontSize: 14 }}>Sin eventos registrados</Text>
          </View>
        )}

        {((match as any).match_events ?? []).map((ev: any) => (
          <View
            key={ev.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              gap: 12,
              borderTopWidth: 1,
              borderTopColor: "#f4f4f5",
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                backgroundColor: "#f4f4f5",
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text>
                {EVENT_TYPES.find((e) => e.type === ev.event_type)?.icon ?? "⚽"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#18181b" }}>
                {ev.player?.name ?? "Jugador desconocido"}
              </Text>
              <Text style={{ fontSize: 12, color: "#71717a" }}>
                {EVENT_TYPES.find((e) => e.type === ev.event_type)?.label}
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#a1a1aa" }}>
              {ev.minute}'
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const scoreBtn = {
  width: 34,
  height: 34,
  borderRadius: 10,
  backgroundColor: "#f4f4f5",
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const miniLabel = {
  fontSize: 11,
  fontWeight: "700" as const,
  color: "#71717a",
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
  marginBottom: 8,
};
