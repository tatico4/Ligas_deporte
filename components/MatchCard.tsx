import { TouchableOpacity, View, Text } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { shadow } from "@/lib/design";
import type { Match, MatchStatus } from "@/types";

interface Props {
  match: Match;
  onPress?: () => void;
}

export function MatchCard({ match, onPress }: Props) {
  const isFinished = match.status === "finished";
  const isLive = match.status === "in_progress";

  const homeColor = match.home_team?.color_primary ?? "#16a34a";
  const awayColor = match.away_team?.color_primary ?? "#3b82f6";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[{ backgroundColor: "#ffffff", borderRadius: 20, overflow: "hidden" }, shadow.md]}
    >
      {/* Round + status header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#71717a", letterSpacing: 0.3 }}>
          {match.round?.toUpperCase()}
        </Text>
        <Badge status={match.status as MatchStatus} />
      </View>

      {/* Main score area */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingBottom: 14,
          gap: 8,
        }}
      >
        {/* Home team */}
        <View style={{ flex: 1, alignItems: "center", gap: 6 }}>
          <Avatar
            name={match.home_team?.name ?? "?"}
            color={homeColor}
            size={48}
          />
          <Text
            style={{ fontSize: 13, fontWeight: "700", color: "#18181b", textAlign: "center" }}
            numberOfLines={2}
          >
            {match.home_team?.name ?? "Local"}
          </Text>
        </View>

        {/* Score box */}
        <View style={{ alignItems: "center", minWidth: 90 }}>
          {isFinished || isLive ? (
            <View
              style={{
                backgroundColor: isLive ? "#14532d" : "#f4f4f5",
                borderRadius: 14,
                paddingHorizontal: 18,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: isLive ? "#ffffff" : "#18181b",
                  letterSpacing: -1,
                }}
              >
                {match.home_score ?? 0} — {match.away_score ?? 0}
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#d4d4d8" }}>VS</Text>
              {match.scheduled_at && (
                <Text style={{ fontSize: 12, color: "#71717a", textAlign: "center" }}>
                  {new Date(match.scheduled_at).toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "short",
                  })}
                  {"\n"}
                  {new Date(match.scheduled_at).toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              )}
            </View>
          )}

          {/* Penales */}
          {isFinished &&
            match.home_score_penalties != null &&
            match.away_score_penalties != null && (
              <Text style={{ fontSize: 11, color: "#71717a", marginTop: 4 }}>
                (pen. {match.home_score_penalties} - {match.away_score_penalties})
              </Text>
            )}
        </View>

        {/* Away team */}
        <View style={{ flex: 1, alignItems: "center", gap: 6 }}>
          <Avatar
            name={match.away_team?.name ?? "?"}
            color={awayColor}
            size={48}
          />
          <Text
            style={{ fontSize: 13, fontWeight: "700", color: "#18181b", textAlign: "center" }}
            numberOfLines={2}
          >
            {match.away_team?.name ?? "Visitante"}
          </Text>
        </View>
      </View>

      {/* Venue footer */}
      {match.venue && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#f4f4f5",
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Text style={{ fontSize: 12, color: "#a1a1aa" }}>📍 {match.venue}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
