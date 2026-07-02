import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Text as SvgText,
  Rect,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
} from "react-native-svg";

interface CSLogoProps {
  size?: number;
  showRing?: boolean;
}

export function CSLogo({ size = 40, showRing = true }: CSLogoProps) {
  const r = size / 2;
  const fontSize = Math.round(size * 0.33);
  const subFontSize = Math.round(size * 0.115);

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0D1F3C" />
          <Stop offset="100%" stopColor="#162B52" />
        </LinearGradient>
        <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F0C84A" />
          <Stop offset="100%" stopColor="#B5872A" />
        </LinearGradient>
        <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D4A847" />
          <Stop offset="100%" stopColor="#8B6020" />
        </LinearGradient>
      </Defs>

      {/* Rounded square background — APK icon style */}
      <Rect x="2" y="2" width="96" height="96" rx="22" ry="22" fill="url(#bgGrad)" />

      {/* Gold accent bar top */}
      <Rect x="28" y="12" width="44" height="3" rx="1.5" fill="url(#goldGrad)" opacity="0.7" />

      {/* Euro / coin symbol — financing identity */}
      <Circle cx="50" cy="47" r="26" fill="none" stroke="url(#ringGrad)" strokeWidth="3.5" opacity="0.35" />

      {/* CS letters — main identity */}
      <SvgText
        x="50"
        y="62"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="38"
        letterSpacing="-2"
        fill="url(#goldGrad)"
      >
        CS
      </SvgText>

      {/* Thin divider line under CS */}
      <Rect x="26" y="67" width="48" height="1.5" rx="0.75" fill="url(#goldGrad)" opacity="0.5" />

      {/* SUBVENTION label below */}
      <SvgText
        x="50"
        y="82"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="9"
        letterSpacing="2.5"
        fill="#D4A847"
        opacity="0.75"
      >
        SUBVENTION
      </SvgText>

      {/* Gold accent bar bottom */}
      <Rect x="28" y="88" width="44" height="2" rx="1" fill="url(#goldGrad)" opacity="0.4" />
    </Svg>
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
