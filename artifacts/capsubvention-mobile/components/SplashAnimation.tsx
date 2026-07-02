import React, { useCallback, useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const NAVY_DEEP   = "#060F1E";
const NAVY        = "#0D1F3C";
const GOLD        = "#B5872A";
const GOLD_LIGHT  = "#D9B05A";
const GOLD_BRIGHT = "#F0C96B";

interface Props {
  onFinish: () => void;
}

export function SplashAnimation({ onFinish }: Props) {
  const { t } = useTranslation();
  const containerOpacity = useSharedValue(1);
  const haloScale        = useSharedValue(0.3);
  const haloOpacity      = useSharedValue(0);
  const logoScale        = useSharedValue(0.15);
  const logoOpacity      = useSharedValue(0);
  const glowOpacity      = useSharedValue(0);
  const glowOuterScale   = useSharedValue(0.6);
  const titleOpacity     = useSharedValue(0);
  const titleY           = useSharedValue(22);
  const taglineOpacity   = useSharedValue(0);
  const bottomOpacity    = useSharedValue(0);
  const pulseScale       = useSharedValue(1);
  const separatorScale   = useSharedValue(0);
  const separatorOpacity = useSharedValue(0);

  const finish = useCallback(() => onFinish(), [onFinish]);

  useEffect(() => {
    // ── Phase 1 : halo de fond (0–700 ms) ───────────────────────────────────
    haloOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    haloScale.value   = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });

    // ── Phase 2 : logo CS avec spring (150–750 ms) ──────────────────────────
    logoOpacity.value = withDelay(120, withTiming(1, { duration: 280 }));
    logoScale.value   = withDelay(
      120,
      withSpring(1, { damping: 13, stiffness: 110, mass: 0.9 }),
    );

    // ── Phase 3 : anneaux de glow (250–750 ms) ──────────────────────────────
    glowOpacity.value     = withDelay(200, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
    glowOuterScale.value  = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // ── Phase 4 : séparateur (550–800 ms) ───────────────────────────────────
    separatorOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
    separatorScale.value   = withDelay(500, withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }));

    // ── Phase 5 : titre (580–950 ms) ────────────────────────────────────────
    titleOpacity.value = withDelay(530, withTiming(1, { duration: 370, easing: Easing.out(Easing.cubic) }));
    titleY.value       = withDelay(530, withTiming(0, { duration: 370, easing: Easing.out(Easing.cubic) }));

    // ── Phase 6 : tagline (850–1100 ms) ─────────────────────────────────────
    taglineOpacity.value = withDelay(820, withTiming(1, { duration: 280 }));

    // ── Phase 7 : badge bas (950–1150 ms) ───────────────────────────────────
    bottomOpacity.value = withDelay(900, withTiming(1, { duration: 280 }));

    // ── Phase 8 : pulsation douce du logo (départ 750 ms, infini) ───────────
    pulseScale.value = withDelay(
      750,
      withRepeat(
        withSequence(
          withTiming(1.045, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(1,     { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );

    // ── Phase 9 : sortie fondue (1850–2320 ms) ───────────────────────────────
    containerOpacity.value = withDelay(
      1850,
      withTiming(0, { duration: 480, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(finish)();
      }),
    );
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimation(containerOpacity);
      cancelAnimation(logoScale);
      cancelAnimation(pulseScale);
      cancelAnimation(haloOpacity);
      cancelAnimation(haloScale);
      cancelAnimation(glowOpacity);
      cancelAnimation(glowOuterScale);
      cancelAnimation(titleOpacity);
      cancelAnimation(titleY);
      cancelAnimation(taglineOpacity);
      cancelAnimation(bottomOpacity);
      cancelAnimation(separatorScale);
      cancelAnimation(separatorOpacity);
    };
  }, []);

  // ── Animated styles ──────────────────────────────────────────────────────
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity:   haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity:   logoOpacity.value,
    transform: [{ scale: logoScale.value * pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity:   glowOpacity.value,
    transform: [{ scale: glowOuterScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity:   titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const bottomStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
  }));

  const separatorStyle = useAnimatedStyle(() => ({
    opacity:   separatorOpacity.value,
    transform: [{ scaleX: separatorScale.value }],
  }));

  return (
    <Animated.View style={[styles.root, containerStyle]}>
      {/* ── Fond gradient profond ── */}
      <LinearGradient
        colors={[NAVY_DEEP, NAVY, "#0E2445"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* ── Halo doré central (fond) ── */}
      <Animated.View style={[styles.haloWrap, haloStyle]} pointerEvents="none">
        <LinearGradient
          colors={[
            "rgba(181,135,42,0.22)",
            "rgba(181,135,42,0.10)",
            "rgba(181,135,42,0.03)",
            "transparent",
          ]}
          locations={[0, 0.35, 0.65, 1]}
          style={styles.haloGradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1,   y: 1   }}
        />
      </Animated.View>

      {/* ── Contenu central ── */}
      <View style={styles.center}>

        {/* Anneaux de glow derrière le logo */}
        <Animated.View style={[styles.glowContainer, glowStyle]} pointerEvents="none">
          <View style={styles.glowRing4} />
          <View style={styles.glowRing3} />
          <View style={styles.glowRing2} />
          <View style={styles.glowRing1} />
        </Animated.View>

        {/* Badge CS */}
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          {/* Couche de halo proche */}
          <View style={styles.logoGlowLayer3} />
          <View style={styles.logoGlowLayer2} />
          <View style={styles.logoGlowLayer1} />

          <LinearGradient
            colors={[GOLD_BRIGHT, GOLD_LIGHT, GOLD, "#8A6218"]}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.logoCircle}
            start={{ x: 0.25, y: 0 }}
            end={{ x: 0.75, y: 1 }}
          >
            <Text style={styles.logoText}>CS</Text>
          </LinearGradient>
        </Animated.View>

        {/* Séparateur */}
        <Animated.View style={[styles.separator, separatorStyle]} />

        {/* Nom de l'application */}
        <Animated.Text style={[styles.title, titleStyle]}>
          CapSubvention
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          {t("splash.tagline")}
        </Animated.Text>
      </View>

      {/* ── Badge légal en bas ── */}
      <Animated.View style={[styles.bottomBadge, bottomStyle]}>
        <View style={styles.bottomLine} />
        <Text style={styles.bottomText}>{t("splash.legal")}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const LOGO_SIZE   = Math.min(width * 0.24, 100);
const GLOW_1      = LOGO_SIZE + 18;
const GLOW_2      = LOGO_SIZE + 40;
const GLOW_3      = LOGO_SIZE + 66;
const GLOW_4      = LOGO_SIZE + 100;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },

  // Halo fond
  haloWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  haloGradient: {
    width:  width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
  },

  // Centre
  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Anneaux de glow externes
  glowContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing4: {
    position: "absolute",
    width: GLOW_4, height: GLOW_4, borderRadius: GLOW_4 / 2,
    backgroundColor: "rgba(181,135,42,0.04)",
  },
  glowRing3: {
    position: "absolute",
    width: GLOW_3, height: GLOW_3, borderRadius: GLOW_3 / 2,
    backgroundColor: "rgba(181,135,42,0.07)",
  },
  glowRing2: {
    position: "absolute",
    width: GLOW_2, height: GLOW_2, borderRadius: GLOW_2 / 2,
    backgroundColor: "rgba(181,135,42,0.11)",
  },
  glowRing1: {
    position: "absolute",
    width: GLOW_1, height: GLOW_1, borderRadius: GLOW_1 / 2,
    backgroundColor: "rgba(181,135,42,0.16)",
  },

  // Badge logo CS
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  // Couches de glow collées au logo
  logoGlowLayer1: {
    position: "absolute",
    width: LOGO_SIZE + 12, height: LOGO_SIZE + 12,
    borderRadius: (LOGO_SIZE + 12) / 2,
    backgroundColor: "rgba(181,135,42,0.28)",
  },
  logoGlowLayer2: {
    position: "absolute",
    width: LOGO_SIZE + 26, height: LOGO_SIZE + 26,
    borderRadius: (LOGO_SIZE + 26) / 2,
    backgroundColor: "rgba(181,135,42,0.14)",
  },
  logoGlowLayer3: {
    position: "absolute",
    width: LOGO_SIZE + 44, height: LOGO_SIZE + 44,
    borderRadius: (LOGO_SIZE + 44) / 2,
    backgroundColor: "rgba(181,135,42,0.07)",
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: LOGO_SIZE * 0.35,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  // Séparateur
  separator: {
    width: 40,
    height: 1.5,
    backgroundColor: GOLD,
    marginBottom: 20,
    opacity: 0.8,
  },

  // Textes
  title: {
    color: "#FFFFFF",
    fontSize: Math.min(width * 0.072, 30),
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  tagline: {
    color: "rgba(255,255,255,0.48)",
    fontSize: Math.min(width * 0.031, 13),
    fontWeight: "400",
    letterSpacing: 0.4,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // Badge bas
  bottomBadge: {
    position: "absolute",
    bottom: 44,
    alignItems: "center",
    gap: 10,
  },
  bottomLine: {
    width: 32,
    height: 1,
    backgroundColor: "rgba(181,135,42,0.4)",
  },
  bottomText: {
    color: "rgba(255,255,255,0.28)",
    fontSize: Math.min(width * 0.026, 11),
    fontWeight: "400",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
