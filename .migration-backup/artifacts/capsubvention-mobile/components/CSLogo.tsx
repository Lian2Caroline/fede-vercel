import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText, Rect, Defs, LinearGradient, Stop } from "react-native-svg";

interface CSLogoProps {
  size?: number;
  showRing?: boolean;
}

export function CSLogo({ size = 40, showRing = true }: CSLogoProps) {
  if (showRing) {
    const fontSize = Math.round(size * 0.34);
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="navy" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0D1F3C" />
            <Stop offset="100%" stopColor="#1A3561" />
          </LinearGradient>
          <LinearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#D4A847" />
            <Stop offset="100%" stopColor="#B5872A" />
          </LinearGradient>
        </Defs>

        {/* Gold outer ring */}
        <Circle cx="50" cy="50" r="49" fill="url(#gold)" />

        {/* Navy inner circle */}
        <Circle cx="50" cy="50" r="42" fill="url(#navy)" />

        {/* 5 stars — 5 territories */}
        <SvgText x="27" y="29" textAnchor="middle" fontSize="9" fill="#D4A847" opacity="0.8">★</SvgText>
        <SvgText x="38" y="21" textAnchor="middle" fontSize="9" fill="#D4A847" opacity="0.8">★</SvgText>
        <SvgText x="50" y="18" textAnchor="middle" fontSize="9" fill="#D4A847" opacity="0.8">★</SvgText>
        <SvgText x="62" y="21" textAnchor="middle" fontSize="9" fill="#D4A847" opacity="0.8">★</SvgText>
        <SvgText x="73" y="29" textAnchor="middle" fontSize="9" fill="#D4A847" opacity="0.8">★</SvgText>

        {/* CS lettering */}
        <SvgText
          x="50"
          y="68"
          textAnchor="middle"
          fontFamily="Arial Black, Arial, sans-serif"
          fontWeight="900"
          fontSize="40"
          letterSpacing="-2"
          fill="url(#gold)"
        >
          CS
        </SvgText>

        {/* Bottom rule */}
        <Rect x="28" y="74" width="44" height="1.5" rx="1" fill="#D4A847" opacity="0.5" />
      </Svg>
    );
  }

  // Fallback simple ring without SVG ring stars — for very small sizes
  const inner = size - 4;
  return (
    <View style={[styles.outer, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.inner, { width: inner, height: inner, borderRadius: inner / 2 }]}>
        <Text style={[styles.text, { fontSize: Math.round(size * 0.32) }]}>CS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: "#B5872A",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    backgroundColor: "#0D1F3C",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#D4A847",
    fontWeight: "900" as const,
    letterSpacing: -0.5,
  },
});
