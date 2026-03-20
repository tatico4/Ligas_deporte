import { View, Text } from "react-native";
import { Button } from "@/components/ui/Button";

interface Props {
  emoji: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji, title, description, actionLabel, onAction }: Props) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 56, paddingHorizontal: 32, gap: 12 }}>
      <Text style={{ fontSize: 56 }}>{emoji}</Text>
      <Text style={{ fontSize: 17, fontWeight: "700", color: "#27272a", textAlign: "center" }}>
        {title}
      </Text>
      {description && (
        <Text style={{ fontSize: 14, color: "#71717a", textAlign: "center", lineHeight: 20 }}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: 8 }}>
          <Button label={actionLabel} onPress={onAction} size="sm" />
        </View>
      )}
    </View>
  );
}
