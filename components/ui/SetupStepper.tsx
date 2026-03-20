import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type Step = {
  key: string;
  label: string;
  done: boolean;
};

interface Props {
  steps: Step[];
}

export function SetupStepper({ steps }: Props) {
  const firstPending = steps.findIndex((s) => !s.done);

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        gap: 0,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#71717a", marginBottom: 12, letterSpacing: 0.5, textTransform: "uppercase" }}>
        Configuración del torneo
      </Text>
      {steps.map((step, i) => {
        const isActive = i === firstPending;
        const isDone = step.done;

        return (
          <View key={step.key} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            {/* Connector line + circle */}
            <View style={{ alignItems: "center", width: 24 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: isDone ? "#16a34a" : isActive ? "#dcfce7" : "#f4f4f5",
                  borderWidth: isActive ? 2 : 0,
                  borderColor: "#16a34a",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: isActive ? "#16a34a" : "#d4d4d8",
                    }}
                  />
                )}
              </View>
              {i < steps.length - 1 && (
                <View style={{ width: 2, height: 20, backgroundColor: isDone ? "#16a34a" : "#e4e4e7", marginVertical: 2 }} />
              )}
            </View>

            {/* Label */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: isActive ? "700" : "400",
                color: isDone ? "#71717a" : isActive ? "#15803d" : "#a1a1aa",
                paddingTop: 2,
                paddingBottom: i < steps.length - 1 ? 18 : 0,
                textDecorationLine: isDone ? "line-through" : "none",
              }}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
