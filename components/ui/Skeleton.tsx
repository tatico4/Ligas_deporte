import { useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";

interface Props {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, radius = 8, style }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: "#e4e4e7",
          opacity,
        },
        style,
      ]}
    />
  );
}

export function TournamentCardSkeleton() {
  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Skeleton width={48} height={48} radius={12} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={12} />
        </View>
        <Skeleton width={64} height={24} radius={999} />
      </View>
      <Skeleton width="100%" height={6} radius={4} />
    </View>
  );
}

export function MatchCardSkeleton() {
  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Skeleton width={80} height={12} />
        <Skeleton width={64} height={20} radius={999} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", gap: 8, flex: 1 }}>
          <Skeleton width={44} height={44} radius={22} />
          <Skeleton width={70} height={12} />
        </View>
        <Skeleton width={60} height={32} radius={8} />
        <View style={{ alignItems: "center", gap: 8, flex: 1 }}>
          <Skeleton width={44} height={44} radius={22} />
          <Skeleton width={70} height={12} />
        </View>
      </View>
    </View>
  );
}
