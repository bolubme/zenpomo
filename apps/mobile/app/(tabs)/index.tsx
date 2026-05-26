import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useTimerStore, formatTime, PHASE_LABELS } from "@zenpomo/core";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 110;
const STROKE_WIDTH = 6;
const SIZE = (RADIUS + STROKE_WIDTH) * 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const THEME_BG: Record<string, [string, string]> = {
  zen_garden: ["#080f0a", "#0d1f10"],
  ocean_deep: ["#030f1a", "#051624"],
  night_city: ["#050008", "#0a0010"],
  ancient_forest: ["#040d06", "#08180a"],
  ember: ["#0f0500", "#1a0800"],
};

const THEME_PRIMARY: Record<string, string> = {
  zen_garden: "#4ade80",
  ocean_deep: "#22d3ee",
  night_city: "#f472b6",
  ancient_forest: "#86efac",
  ember: "#fb923c",
};

export default function TimerScreen() {
  const {
    phase,
    status,
    secondsRemaining,
    config,
    completedFocusSessions,
    theme,
    start,
    pause,
    reset,
    skipPhase,
    tick,
  } = useTimerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dashOffset = useSharedValue(0);

  const totalDuration =
    phase === "focus"
      ? config.focusDuration
      : phase === "short_break"
        ? config.shortBreakDuration
        : config.longBreakDuration;

  const progress = 1 - secondsRemaining / totalDuration;

  useEffect(() => {
    dashOffset.value = withTiming(CIRCUMFERENCE * (1 - progress), {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
  }, [progress]);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, tick]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const accent = THEME_PRIMARY[theme] ?? "#4ade80";
  const bg = THEME_BG[theme] ?? ["#080f0a", "#0d1f10"];

  function handlePlayPause() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    status === "running" ? pause() : start();
  }

  const dots = Array.from({ length: config.sessionsUntilLongBreak }, (_, i) => ({
    i,
    filled: i < completedFocusSessions % config.sessionsUntilLongBreak,
  }));

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Session dots */}
        <View style={styles.dots}>
          {dots.map(({ i, filled }) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: filled ? accent : "rgba(255,255,255,0.15)",
                  width: filled ? 12 : 8,
                  height: filled ? 12 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Timer ring */}
        <View style={styles.ringContainer}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE_WIDTH}
            />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={accent}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={animatedProps}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>

          <View style={styles.centerContent}>
            <Text style={[styles.time, { color: "white" }]}>
              {formatTime(secondsRemaining)}
            </Text>
            <Text style={[styles.phase, { color: accent }]}>
              {PHASE_LABELS[phase]}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              reset();
            }}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>↺</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePlayPause} style={styles.primaryBtn}>
            <LinearGradient
              colors={[accent, accent + "aa"]}
              style={styles.primaryBtnGrad}
            >
              <Text style={styles.primaryBtnText}>
                {status === "running" ? "⏸" : "▶"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              skipPhase();
            }}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>⏭</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          {phase === "focus"
            ? "Deep work mode — stay present"
            : "Take a mindful break"}
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignItems: "center", justifyContent: "center", gap: 32 },
  dots: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { borderRadius: 99 },
  ringContainer: { position: "relative", alignItems: "center", justifyContent: "center" },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    gap: 4,
  },
  time: { fontSize: 56, fontWeight: "600", letterSpacing: -2 },
  phase: { fontSize: 12, fontWeight: "500", letterSpacing: 3, textTransform: "uppercase" },
  controls: { flexDirection: "row", alignItems: "center", gap: 20 },
  primaryBtn: { borderRadius: 99, overflow: "hidden" },
  primaryBtnGrad: {
    width: 76,
    height: 76,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 28, color: "black" },
  secondaryBtn: {
    width: 52,
    height: 52,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  secondaryBtnText: { fontSize: 20, color: "rgba(255,255,255,0.6)" },
  hint: { color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", paddingHorizontal: 40 },
});
