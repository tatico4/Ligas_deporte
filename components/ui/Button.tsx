import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { shadow } from "@/lib/design";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: "#16a34a", text: "#ffffff" },
  outline: { bg: "transparent", text: "#16a34a", border: "#16a34a" },
  ghost:   { bg: "#f0fdf4",    text: "#15803d" },
  danger:  { bg: "#fee2e2",    text: "#b91c1c" },
};

const SIZES: Record<Size, { py: number; px: number; text: number; radius: number }> = {
  sm: { py: 8,  px: 14, text: 13, radius: 10 },
  md: { py: 14, px: 20, text: 15, radius: 14 },
  lg: { py: 17, px: 24, text: 16, radius: 16 },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}: Props) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: v.bg,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          borderRadius: s.radius,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border ?? "transparent",
          opacity: isDisabled ? 0.6 : 1,
          ...(variant === "primary" ? shadow.green : shadow.sm),
          ...(fullWidth ? { alignSelf: "stretch" } : {}),
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={{ color: v.text, fontSize: s.text, fontWeight: "700", letterSpacing: 0.2 }}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
