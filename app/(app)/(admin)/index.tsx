import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { getTournaments } from "@/lib/queries/tournaments";
import { getMatches } from "@/lib/queries/matches";
import { TournamentCard } from "@/components/TournamentCard";
import { MatchCard } from "@/components/MatchCard";
import { Button } from "@/components/ui/Button";
import { TournamentCardSkeleton } from "@/components/ui/Skeleton";
import { shadow } from "@/lib/design";

export default function AdminHome() {
  const { profile } = useAuthStore();
  const router = useRouter();

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["tournaments", profile?.id],
    queryFn: () => getTournaments(profile?.id),
    enabled: !!profile?.id,
  });

  // Buscar próximo partido en todos los torneos activos
  const activeTournaments = tournaments.filter((t) => t.status === "active");

  const { data: upcomingMatches = [] } = useQuery({
    queryKey: ["upcoming-matches", activeTournaments.map((t) => t.id).join(",")],
    queryFn: async () => {
      if (!activeTournaments.length) return [];
      const allMatches = await Promise.all(
        activeTournaments.map((t) => getMatches(t.id))
      );
      return allMatches
        .flat()
        .filter((m) => m.status === "scheduled")
        .sort((a, b) =>
          (a.scheduled_at ?? "") < (b.scheduled_at ?? "") ? -1 : 1
        )
        .slice(0, 1);
    },
    enabled: activeTournaments.length > 0,
  });

  const active = tournaments.filter((t) => t.status === "active").length;
  const draft = tournaments.filter((t) => t.status === "draft").length;

  const nextMatch = upcomingMatches[0];

  return (
    <ScrollView
      className="flex-1 bg-secondary-50"
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View
        style={{
          backgroundColor: "#16a34a",
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        <Text style={{ color: "#dcfce7", fontSize: 13, fontWeight: "500" }}>Bienvenido de vuelta</Text>
        <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: "800", letterSpacing: -0.5, marginTop: 2 }}>
          {profile?.full_name?.split(" ")[0]} 👋
        </Text>

        {/* Quick stats row */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <StatPill icon="trophy" label="Activos" value={active} />
          <StatPill icon="time-outline" label="Borradores" value={draft} />
          <StatPill icon="football-outline" label="Total" value={tournaments.length} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: -24, gap: 20 }}>
        {/* ── Próximo partido ── */}
        {nextMatch && (
          <View>
            <SectionHeader label="Próximo partido" />
            <MatchCard
              match={nextMatch}
              onPress={() => {
                const t = activeTournaments.find((t) => t.id === nextMatch.tournament_id);
                if (t) router.push(`/(app)/(admin)/tournaments/${t.id}`);
              }}
            />
          </View>
        )}

        {/* ── CTA crear torneo ── */}
        {tournaments.length === 0 && !isLoading && (
          <View
            style={[
              {
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 24,
                alignItems: "center",
                gap: 12,
              },
              shadow.sm,
            ]}
          >
            <Text style={{ fontSize: 44 }}>🏆</Text>
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#18181b" }}>
              Crea tu primer torneo
            </Text>
            <Text style={{ fontSize: 14, color: "#71717a", textAlign: "center" }}>
              Organiza equipos, genera el fixture y lleva la tabla de posiciones.
            </Text>
            <Button
              label="Crear torneo"
              onPress={() => router.push("/(app)/(admin)/tournaments/new")}
              size="md"
            />
          </View>
        )}

        {/* ── Mis torneos ── */}
        {(isLoading || tournaments.length > 0) && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <SectionHeader label="Mis torneos" />
              <TouchableOpacity onPress={() => router.push("/(app)/(admin)/tournaments")}>
                <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: "600" }}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={{ gap: 12 }}>
                <TournamentCardSkeleton />
                <TournamentCardSkeleton />
              </View>
            ) : (
              tournaments.slice(0, 3).map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  onPress={() => router.push(`/(app)/(admin)/tournaments/${t.id}`)}
                />
              ))
            )}

            {!isLoading && (
              <Button
                label="+ Nuevo torneo"
                onPress={() => router.push("/(app)/(admin)/tournaments/new")}
                variant="outline"
                fullWidth
              />
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function StatPill({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: "center",
        gap: 2,
      }}
    >
      <Ionicons name={icon as any} size={16} color="#bbf7d0" />
      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: "#86efac", fontSize: 10, fontWeight: "500" }}>{label}</Text>
    </View>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text style={{ fontSize: 16, fontWeight: "700", color: "#18181b", letterSpacing: -0.3 }}>
      {label}
    </Text>
  );
}
