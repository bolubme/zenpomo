import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTimerStore, THEME_LABELS } from "@zenpomo/core";
import type { AmbientTheme } from "@zenpomo/core";

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

const THEME_EMOJIS: Record<string, string> = {
  zen_garden: "🌿",
  ocean_deep: "🌊",
  night_city: "🏙️",
  ancient_forest: "🌲",
  ember: "🔥",
};

export default function SettingsScreen() {
  const { theme, config, setTheme, updateConfig } = useTimerStore();
  const bg = THEME_BG[theme] ?? ["#080f0a", "#0d1f10"];
  const accent = THEME_PRIMARY[theme] ?? "#4ade80";

  const themes = Object.keys(THEME_LABELS) as AmbientTheme[];

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Settings</Text>

          {/* Theme */}
          <Text style={styles.sectionLabel}>Ambient Theme</Text>
          <View style={styles.card}>
            {themes.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTheme(t)}
                style={[
                  styles.themeRow,
                  theme === t && { backgroundColor: "rgba(255,255,255,0.06)" },
                ]}
              >
                <Text style={styles.themeEmoji}>{THEME_EMOJIS[t]}</Text>
                <Text style={styles.themeLabel}>{THEME_LABELS[t]}</Text>
                {theme === t && (
                  <Text style={[styles.themeCheck, { color: accent }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Timer */}
          <Text style={styles.sectionLabel}>Timer</Text>
          <View style={styles.card}>
            {[
              {
                label: "Focus",
                key: "focusDuration" as const,
                value: config.focusDuration,
              },
              {
                label: "Short break",
                key: "shortBreakDuration" as const,
                value: config.shortBreakDuration,
              },
              {
                label: "Long break",
                key: "longBreakDuration" as const,
                value: config.longBreakDuration,
              },
            ].map((item) => (
              <View key={item.key} style={styles.settingRow}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    onPress={() =>
                      updateConfig({ [item.key]: Math.max(60, item.value - 60) })
                    }
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{item.value / 60}m</Text>
                  <TouchableOpacity
                    onPress={() =>
                      updateConfig({
                        [item.key]: Math.min(90 * 60, item.value + 60),
                      })
                    }
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 100 },
  title: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 24, marginTop: 8 },
  sectionLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    overflow: "hidden",
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  themeEmoji: { fontSize: 20 },
  themeLabel: { flex: 1, color: "rgba(255,255,255,0.8)", fontSize: 14 },
  themeCheck: { fontSize: 16, fontWeight: "700" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  settingLabel: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { color: "rgba(255,255,255,0.7)", fontSize: 18 },
  stepValue: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    width: 40,
    textAlign: "center",
  },
});
