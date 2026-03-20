import { View, Text } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { colors, shadow } from "@/lib/design";
import type { Standing } from "@/types";

interface Props {
  standings: Standing[];
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const MEDAL_COLOR: Record<number, string> = {
  1: colors.medal.gold,
  2: colors.medal.silver,
  3: colors.medal.bronze,
};

function PodiumCard({ standing }: { standing: Standing }) {
  const medal = MEDAL[standing.position];
  const teamColor = (standing.team as any)?.color_primary ?? "#16a34a";

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 12,
          alignItems: "center",
          gap: 6,
          borderTopWidth: 3,
          borderTopColor: MEDAL_COLOR[standing.position] ?? "#e4e4e7",
        },
        shadow.sm,
      ]}
    >
      <Text style={{ fontSize: 22 }}>{medal}</Text>
      <Avatar
        name={standing.team?.name ?? "?"}
        color={teamColor}
        size={38}
      />
      <Text
        style={{ fontSize: 12, fontWeight: "700", color: "#18181b", textAlign: "center" }}
        numberOfLines={2}
      >
        {standing.team?.name ?? "Equipo"}
      </Text>
      <View
        style={{
          backgroundColor: "#16a34a",
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 3,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>
          {standing.points} pts
        </Text>
      </View>
      <Text style={{ fontSize: 11, color: "#71717a" }}>
        {standing.played}PJ · {standing.won}G
      </Text>
    </View>
  );
}

export function StandingsTable({ standings }: Props) {
  const top3 = standings.filter((s) => s.position <= 3);
  const rest = standings.filter((s) => s.position > 3);

  return (
    <View style={{ gap: 16 }}>
      {/* Podium top 3 */}
      {top3.length > 0 && (
        <View style={{ flexDirection: "row", gap: 8 }}>
          {top3.map((s) => (
            <PodiumCard key={s.id} standing={s} />
          ))}
        </View>
      )}

      {/* Full table */}
      <View style={[{ backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" }, shadow.sm]}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#18181b",
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={[colStyle.pos, { color: "#a1a1aa" }]}>#</Text>
          <Text style={[colStyle.team, { color: "#a1a1aa" }]}>Equipo</Text>
          <Text style={[colStyle.stat, { color: "#a1a1aa" }]}>PJ</Text>
          <Text style={[colStyle.stat, { color: "#a1a1aa" }]}>G</Text>
          <Text style={[colStyle.stat, { color: "#a1a1aa" }]}>E</Text>
          <Text style={[colStyle.stat, { color: "#a1a1aa" }]}>P</Text>
          <Text style={[colStyle.stat, { color: "#a1a1aa" }]}>DG</Text>
          <Text style={[colStyle.pts, { color: "#fff" }]}>Pts</Text>
        </View>

        {standings.map((s, index) => {
          const isMedal = s.position <= 3;
          const teamColor = (s.team as any)?.color_primary ?? "#16a34a";
          const dgPositive = s.goal_difference > 0;
          const dgNeutral = s.goal_difference === 0;

          return (
            <View
              key={s.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: isMedal
                  ? MEDAL_COLOR[s.position] + "0D"
                  : index % 2 === 0
                  ? "#fff"
                  : "#fafafa",
                borderBottomWidth: index < standings.length - 1 ? 1 : 0,
                borderBottomColor: "#f4f4f5",
                borderLeftWidth: isMedal ? 3 : 0,
                borderLeftColor: isMedal ? MEDAL_COLOR[s.position] : "transparent",
              }}
            >
              {/* Pos */}
              <View style={{ width: 28, alignItems: "center" }}>
                {isMedal ? (
                  <Text style={{ fontSize: 14 }}>{MEDAL[s.position]}</Text>
                ) : (
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#71717a" }}>
                    {s.position}
                  </Text>
                )}
              </View>

              {/* Team name with color dot */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginLeft: 4,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: teamColor,
                  }}
                />
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: "#18181b" }}
                  numberOfLines={1}
                >
                  {s.team?.name ?? "Equipo"}
                </Text>
              </View>

              <Text style={colStyle.stat}>{s.played}</Text>
              <Text style={colStyle.stat}>{s.won}</Text>
              <Text style={colStyle.stat}>{s.drawn}</Text>
              <Text style={colStyle.stat}>{s.lost}</Text>

              {/* DG with color */}
              <Text
                style={[
                  colStyle.stat,
                  {
                    color: dgPositive ? "#16a34a" : dgNeutral ? "#71717a" : "#dc2626",
                    fontWeight: "600",
                  },
                ]}
              >
                {dgPositive ? "+" : ""}
                {s.goal_difference}
              </Text>

              <Text
                style={[colStyle.pts, { color: "#16a34a", fontWeight: "800", fontSize: 14 }]}
              >
                {s.points}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const colStyle = {
  pos:  { width: 28, textAlign: "center" as const, fontSize: 11, color: "#52525b", fontWeight: "600" as const },
  team: { flex: 1, fontSize: 11, color: "#52525b", fontWeight: "600" as const, marginLeft: 12 },
  stat: { width: 28, textAlign: "center" as const, fontSize: 12, color: "#52525b" },
  pts:  { width: 32, textAlign: "center" as const, fontSize: 12, color: "#18181b", fontWeight: "700" as const },
};
