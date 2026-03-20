import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TOURNAMENT_TYPE_META, shadow } from "@/lib/design";
import type { Tournament, TournamentStatus } from "@/types";

interface Props {
  tournament: Tournament;
  onPress?: () => void;
  teamCount?: number;
  dark?: boolean;
}

export function TournamentCard({ tournament, onPress, teamCount = 0, dark }: Props) {
  const typeMeta = TOURNAMENT_TYPE_META[tournament.type];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          backgroundColor: dark ? "#27272a" : "#ffffff",
          borderRadius: 20,
          overflow: "hidden",
          ...shadow.md,
        },
      ]}
    >
      {/* Colored header strip */}
      <View
        style={{
          backgroundColor: dark ? "#3f3f46" : typeMeta.color + "18",
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: dark ? "#52525b" : typeMeta.color + "22",
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: typeMeta.color + "28",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={typeMeta.icon as any} size={22} color={typeMeta.color} />
        </View>

        {/* Name + type */}
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: dark ? "#ffffff" : "#18181b",
              letterSpacing: -0.3,
            }}
          >
            {tournament.name}
          </Text>
          <Text style={{ fontSize: 12, color: dark ? "#a1a1aa" : "#71717a", marginTop: 2 }}>
            {typeMeta.label}
          </Text>
        </View>

        {/* Status badge */}
        <Badge status={tournament.status as TournamentStatus} />
      </View>

      {/* Body */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
        {/* Teams progress */}
        <ProgressBar
          current={teamCount}
          total={tournament.max_teams}
          color={typeMeta.color}
          showLabel
        />

        {/* Date row */}
        {tournament.start_date && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="calendar-outline" size={13} color="#a1a1aa" />
            <Text style={{ fontSize: 12, color: "#71717a" }}>
              {new Date(tournament.start_date).toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {tournament.end_date
                ? ` → ${new Date(tournament.end_date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}`
                : ""}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
