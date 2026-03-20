import { View, Text } from "react-native";
import { STATUS_META, MATCH_STATUS_META } from "@/lib/design";

type StatusKey = keyof typeof STATUS_META;
type MatchStatusKey = keyof typeof MATCH_STATUS_META;

interface Props {
  status: StatusKey | MatchStatusKey;
  showDot?: boolean;
  size?: "sm" | "md";
}

const ALL_META = { ...STATUS_META, ...MATCH_STATUS_META };

export function Badge({ status, showDot = true, size = "sm" }: Props) {
  const meta = ALL_META[status as keyof typeof ALL_META];
  if (!meta) return null;

  const isLive = status === "in_progress";
  const px = size === "sm" ? 8 : 12;
  const py = size === "sm" ? 3 : 5;
  const textSize = size === "sm" ? 11 : 13;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: meta.bg,
        paddingHorizontal: px,
        paddingVertical: py,
        borderRadius: 999,
        gap: 5,
      }}
    >
      {showDot && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: meta.dot,
            // Pulse effect visual hint for live
            opacity: isLive ? 1 : 0.9,
          }}
        />
      )}
      <Text
        style={{
          color: meta.text,
          fontSize: textSize,
          fontWeight: "600",
          letterSpacing: 0.2,
        }}
      >
        {isLive ? "● EN VIVO" : meta.label}
      </Text>
    </View>
  );
}
