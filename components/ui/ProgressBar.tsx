import { View, Text } from "react-native";

interface Props {
  current: number;
  total: number;
  color?: string;
  showLabel?: boolean;
}

export function ProgressBar({ current, total, color = "#16a34a", showLabel = false }: Props) {
  const pct = total > 0 ? Math.min(current / total, 1) : 0;
  const pctStr = `${Math.round(pct * 100)}%`;

  return (
    <View style={{ gap: 4 }}>
      {showLabel && (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 11, color: "#71717a" }}>{current}/{total} equipos</Text>
          <Text style={{ fontSize: 11, color, fontWeight: "600" }}>{pctStr}</Text>
        </View>
      )}
      <View style={{ height: 5, backgroundColor: "#e4e4e7", borderRadius: 999, overflow: "hidden" }}>
        <View
          style={{
            height: "100%",
            width: pctStr,
            backgroundColor: pct >= 1 ? "#22c55e" : color,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}
