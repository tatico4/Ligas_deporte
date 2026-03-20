import { View, Text, Image } from "react-native";

interface Props {
  name: string;
  imageUrl?: string | null;
  color?: string | null;
  size?: number;
  textSize?: number;
}

export function Avatar({ name, imageUrl, color, size = 44, textSize }: Props) {
  const initial = name?.[0]?.toUpperCase() ?? "?";
  const bg = color ?? "#16a34a";
  const fontSize = textSize ?? Math.round(size * 0.38);

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize, fontWeight: "800" }}>{initial}</Text>
    </View>
  );
}
