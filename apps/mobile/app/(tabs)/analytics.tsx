import { View, Text, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTimerStore } from "@zenpomo/core";

const THEME_BG: Record<string, [string, string]> = {
  zen_garden: ["#080f0a", "#0d1f10"],
  ocean_deep: ["#030f1a", "#051624"],
  night_city: ["#050008", "#0a0010"],
  ancient_forest: ["#040d06", "#08180a"],
  ember: ["#0f0500", "#1a0800"],
};

export default function AnalyticsScreen() {
  const theme = useTimerStore((s) => s.theme);
  const completedFocusSessions = useTimerStore((s) => s.completedFocusSessions);
  const bg = THEME_BG[theme] ?? ["#080f0a", "#0d1f10"];

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.sub}>Your focus journey</Text>

          {completedFocusSessions === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyTitle}>No sessions yet</Text>
              <Text style={styles.emptyText}>
                Complete your first focus session to see analytics here.
              </Text>
            </View>
          ) : (
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedFocusSessions}</Text>
              <Text style={styles.statLabel}>Sessions this run</Text>
            </View>
          )}

          <Text style={styles.note}>
            Full analytics sync coming after Supabase setup
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 100 },
  title: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 4 },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 },
  empty: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 8 },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center" },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  statValue: { color: "white", fontSize: 48, fontWeight: "700" },
  statLabel: { color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 },
  note: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
});
